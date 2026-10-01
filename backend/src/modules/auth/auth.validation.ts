import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
  monthlyIncome: z.number().min(0).optional().default(45000),
  occupation: z.string().optional().default('Professional'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  monthlyIncome: z.number().min(0).optional(),
  primaryIncomeSource: z.string().optional(),
  riskTolerance: z.enum(['LOW', 'MODERATE', 'HIGH']).optional(),
  savingsTargetPercent: z.number().min(0).max(100).optional(),
  occupation: z.string().optional(),
  emergencyFundMonths: z.number().min(1).max(24).optional(),
  upayWalletNumber: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});
