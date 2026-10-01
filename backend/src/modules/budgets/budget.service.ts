import { BudgetRepository } from './budget.repository';
import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';

export class BudgetService {
  private repo: BudgetRepository;

  constructor() {
    this.repo = new BudgetRepository();
  }

  async getBudgetForMonth(userId: string, month: string) {
    const budget = await this.repo.findByMonth(userId, month);
    if (!budget) {
      return null;
    }

    // Determine start and end date for this YYYY-MM
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10) - 1;
    const startDate = new Date(year, m, 1);
    const endDate = new Date(year, m + 1, 0, 23, 59, 59, 999);

    // Fetch actual expenses incurred in this month
    const expenses = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const expenseMap = new Map<string, number>();
    let totalSpent = 0;
    expenses.forEach((e) => {
      const amt = e._sum.amount || 0;
      expenseMap.set(e.category, amt);
      totalSpent += amt;
    });

    const itemsWithTracking = budget.items.map((item) => {
      const actualAmount = expenseMap.get(item.category) || 0;
      const remainingAmount = Math.max(0, item.limitAmount - actualAmount);
      const percentageUsed = item.limitAmount > 0 ? (actualAmount / item.limitAmount) * 100 : 0;

      let status = 'SAFE';
      if (percentageUsed >= 100) status = 'EXCEEDED';
      else if (percentageUsed >= 90) status = 'CRITICAL';
      else if (percentageUsed >= 75) status = 'WARNING';
      else if (percentageUsed >= 50) status = 'MODERATE';

      return {
        id: item.id,
        category: item.category,
        limitAmount: item.limitAmount,
        actualAmount,
        remainingAmount,
        percentageUsed: Number(percentageUsed.toFixed(1)),
        status,
      };
    });

    const totalRemaining = Math.max(0, budget.totalLimit - totalSpent);
    const totalPercentage = budget.totalLimit > 0 ? (totalSpent / budget.totalLimit) * 100 : 0;

    return {
      id: budget.id,
      month: budget.month,
      totalLimit: budget.totalLimit,
      totalSpent,
      totalRemaining,
      totalPercentage: Number(totalPercentage.toFixed(1)),
      items: itemsWithTracking,
    };
  }

  async setBudget(userId: string, data: { month: string; totalLimit: number; items: { category: string; limitAmount: number }[] }) {
    return this.repo.upsertBudget(userId, data.month, data.totalLimit, data.items);
  }

  async deleteBudget(id: string, userId: string) {
    return this.repo.deleteBudget(id, userId);
  }
}
