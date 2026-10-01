import prisma from '../../config/database';
import { Budget, BudgetItem } from '@prisma/client';

export class BudgetRepository {
  async findByMonth(userId: string, month: string) {
    return prisma.budget.findUnique({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
      include: {
        items: true,
      },
    });
  }

  async findRecent(userId: string) {
    return prisma.budget.findMany({
      where: { userId },
      orderBy: { month: 'desc' },
      take: 6,
      include: { items: true },
    });
  }

  async upsertBudget(
    userId: string,
    month: string,
    totalLimit: number,
    items: { category: string; limitAmount: number }[]
  ) {
    // Delete existing items for the month or upsert budget
    return prisma.$transaction(async (tx) => {
      let budget = await tx.budget.findUnique({
        where: { userId_month: { userId, month } },
      });

      if (budget) {
        await tx.budgetItem.deleteMany({ where: { budgetId: budget.id } });
        budget = await tx.budget.update({
          where: { id: budget.id },
          data: { totalLimit },
        });
      } else {
        budget = await tx.budget.create({
          data: {
            userId,
            month,
            totalLimit,
          },
        });
      }

      await tx.budgetItem.createMany({
        data: items.map((item) => ({
          budgetId: budget.id,
          category: item.category,
          limitAmount: item.limitAmount,
        })),
      });

      return tx.budget.findUnique({
        where: { id: budget.id },
        include: { items: true },
      });
    });
  }

  async deleteBudget(id: string, userId: string) {
    return prisma.budget.delete({
      where: { id },
    });
  }
}
