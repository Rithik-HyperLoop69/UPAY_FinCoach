import prisma from '../../config/database';
import { Transaction, ForecastPoint, FinancialProfile } from '@prisma/client';

export class ForecastRepository {
  async getTransactions(userId: string): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
  }

  async getFinancialProfile(userId: string): Promise<FinancialProfile | null> {
    return prisma.financialProfile.findUnique({
      where: { userId },
    });
  }

  async saveForecastPoints(
    userId: string,
    horizon: string,
    points: {
      date: Date;
      projectedIncome: number;
      projectedExpense: number;
      projectedNet: number;
      projectedBalance: number;
      confidence: number;
    }[]
  ) {
    // Clean old points for horizon
    await prisma.forecastPoint.deleteMany({
      where: { userId, horizon },
    });

    await prisma.forecastPoint.createMany({
      data: points.map((p) => ({
        userId,
        forecastDate: p.date,
        horizon,
        projectedIncome: p.projectedIncome,
        projectedExpense: p.projectedExpense,
        projectedNet: p.projectedNet,
        projectedBalance: p.projectedBalance,
        confidenceScore: p.confidence,
      })),
    });
  }

  async createAlertIfNotExists(userId: string, title: string, message: string, severity: string, type: string) {
    const existing = await prisma.alert.findFirst({
      where: { userId, title },
    });
    if (!existing) {
      return prisma.alert.create({
        data: {
          userId,
          title,
          message,
          severity,
          type,
          isRead: false,
          actionUrl: '/forecast',
        },
      });
    }
    return existing;
  }
}
