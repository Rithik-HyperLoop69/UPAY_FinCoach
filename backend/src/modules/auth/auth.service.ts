import bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError, AppError } from '../../utils/errors';
import prisma from '../../config/database';

export class AuthService {
  private authRepo: AuthRepository;

  constructor() {
    this.authRepo = new AuthRepository();
  }

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    monthlyIncome?: number;
    occupation?: string;
  }) {
    const existing = await this.authRepo.findByEmail(data.email.toLowerCase().trim());
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.authRepo.createUser({
      email: data.email.toLowerCase().trim(),
      passwordHash,
      fullName: data.fullName.trim(),
      phone: data.phone,
      monthlyIncome: data.monthlyIncome,
      occupation: data.occupation,
    });

    // Seed default categories for this new user
    const defaultCategories = [
      { name: 'Salary', type: 'INCOME', icon: 'briefcase', color: '#10B981' },
      { name: 'Freelance & Consulting', type: 'INCOME', icon: 'laptop', color: '#06B6D4' },
      { name: 'Rent & Housing', type: 'EXPENSE', icon: 'home', color: '#F43F5E' },
      { name: 'Food & Groceries', type: 'EXPENSE', icon: 'shopping-cart', color: '#F59E0B' },
      { name: 'Dining Out & Cafes', type: 'EXPENSE', icon: 'coffee', color: '#EC4899' },
      { name: 'Transportation & Fuel', type: 'EXPENSE', icon: 'car', color: '#3B82F6' },
      { name: 'Bills & Utilities', type: 'EXPENSE', icon: 'zap', color: '#EAB308' },
      { name: 'Internet & Mobile', type: 'EXPENSE', icon: 'wifi', color: '#6366F1' },
      { name: 'Healthcare & Pharmacy', type: 'EXPENSE', icon: 'heart', color: '#EF4444' },
      { name: 'Entertainment & Subs', type: 'EXPENSE', icon: 'tv', color: '#A855F7' },
      { name: 'Family & Transfers', type: 'EXPENSE', icon: 'users', color: '#14B8A6' },
      { name: 'Savings & DPS', type: 'TRANSFER', icon: 'shield-check', color: '#00C897' },
    ];

    for (const cat of defaultCategories) {
      await prisma.category.create({
        data: {
          ...cat,
          userId: user.id,
          isSystem: true,
        },
      });
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.authRepo.saveRefreshToken(user.id, refreshToken, expiresAt);

    return {
      user: this.sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '1d',
      },
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.authRepo.findByEmail(data.email.toLowerCase().trim());
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.authRepo.saveRefreshToken(user.id, refreshToken, expiresAt);

    return {
      user: this.sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '1d',
      },
    };
  }

  async refreshToken(token: string) {
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const storedToken = await this.authRepo.findRefreshToken(token);
    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token has expired or been revoked');
    }

    // Revoke old token (token rotation)
    await this.authRepo.revokeRefreshToken(token);

    const user = await this.authRepo.findById(payload.userId);
    if (!user) {
      throw new NotFoundError('User associated with token not found');
    }

    const newPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.authRepo.saveRefreshToken(user.id, newRefreshToken, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken?: string, userId?: string) {
    if (refreshToken) {
      await this.authRepo.revokeRefreshToken(refreshToken);
    } else if (userId) {
      await this.authRepo.revokeAllUserTokens(userId);
    }
  }

  async getCurrentUser(userId: string) {
    const user = await this.authRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, data: any) {
    const { fullName, phone, upayWalletNumber, ...profileData } = data;
    const user = await this.authRepo.updateUser(
      userId,
      { fullName, phone, upayWalletNumber },
      profileData
    );
    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    const user = await this.authRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(data.newPassword, 10);
    await this.authRepo.updatePassword(userId, newHash);
    await this.authRepo.revokeAllUserTokens(userId);
  }

  async connectUpayWallet(userId: string, walletNumber: string) {
    const updated = await this.authRepo.updateUser(userId, {
      upayWalletNumber: walletNumber,
      upayConnected: true,
    });
    return this.sanitizeUser(updated);
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
