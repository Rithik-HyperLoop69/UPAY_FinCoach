import prisma from '../../config/database';
import { User, FinancialProfile, RefreshToken } from '@prisma/client';

export class AuthRepository {
  async findByEmail(email: string): Promise<(User & { profile: FinancialProfile | null }) | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }

  async findById(id: string): Promise<(User & { profile: FinancialProfile | null }) | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    phone?: string;
    monthlyIncome?: number;
    occupation?: string;
  }): Promise<User & { profile: FinancialProfile | null }> {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        profile: {
          create: {
            monthlyIncome: data.monthlyIncome || 45000.0,
            occupation: data.occupation || 'Professional',
            primaryIncomeSource: 'Salary',
            savingsTargetPercent: 20.0,
            financialHealthScore: 70.0,
          },
        },
      },
      include: { profile: true },
    });
  }

  async updateUser(
    id: string,
    userData: { fullName?: string; phone?: string; upayWalletNumber?: string; upayConnected?: boolean },
    profileData?: {
      monthlyIncome?: number;
      primaryIncomeSource?: string;
      riskTolerance?: string;
      savingsTargetPercent?: number;
      occupation?: string;
      emergencyFundMonths?: number;
    }
  ): Promise<User & { profile: FinancialProfile | null }> {
    return prisma.user.update({
      where: { id },
      data: {
        ...userData,
        ...(profileData && {
          profile: {
            update: profileData,
          },
        }),
      },
      include: { profile: true },
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: DateTime): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }
}

type DateTime = Date;
