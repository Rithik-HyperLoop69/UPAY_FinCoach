import prisma from '../../config/database';
import { Transaction } from '@prisma/client';

export class AnalyticsRepository {
  async getTransactionsByUser(userId: string, startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    const where: any = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }
    return prisma.transaction.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  async getBudgetForMonth(userId: string, month: string) {
    return prisma.budget.findUnique({
      where: { userId_month: { userId, month } },
      include: { items: true },
    });
  }

  async getSavingsGoals(userId: string) {
    return prisma.savingsGoal.findMany({
      where: { userId },
    });
  }

  async updateHealthScore(userId: string, score: number) {
    return prisma.financialProfile.update({
      where: { userId },
      data: { financialHealthScore: score },
    });
  }
}
