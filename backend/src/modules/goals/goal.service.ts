import { GoalRepository } from './goal.repository';
import prisma from '../../config/database';
import { NotFoundError, AppError } from '../../utils/errors';

export class GoalService {
  private repo: GoalRepository;

  constructor() {
    this.repo = new GoalRepository();
  }

  async getGoals(userId: string) {
    const goals = await this.repo.findForUser(userId);

    // Calculate user's average monthly net savings over the last 90 days to project realistic completion
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'INCOME', date: { gte: ninetyDaysAgo } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE', date: { gte: ninetyDaysAgo } },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = incomeAgg._sum.amount || 0;
    const totalExpense = expenseAgg._sum.amount || 0;
    const netSavings3Mo = Math.max(1, totalIncome - totalExpense);
    const avgMonthlySavings = netSavings3Mo / 3;

    return goals.map((goal) => {
      const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
      const progressPercent =
        goal.targetAmount > 0
          ? Math.min(100, Number(((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)))
          : 0;

      let estimatedMonthsRemaining: number | null = null;
      let estimatedCompletionDate: string | null = null;

      if (remainingAmount > 0 && avgMonthlySavings > 0) {
        // Assume 25% of monthly savings capacity can be directed to this specific goal
        const allocatedMonthlyContribution = Math.max(500, avgMonthlySavings * 0.25);
        estimatedMonthsRemaining = Math.ceil(remainingAmount / allocatedMonthlyContribution);

        const estDate = new Date();
        estDate.setMonth(estDate.getMonth() + estimatedMonthsRemaining);
        estimatedCompletionDate = estDate.toISOString().slice(0, 10);
      } else if (remainingAmount === 0) {
        estimatedMonthsRemaining = 0;
        estimatedCompletionDate = 'Goal Achieved';
      }

      return {
        ...goal,
        remainingAmount,
        progressPercent,
        estimatedMonthsRemaining,
        estimatedCompletionDate,
      };
    });
  }

  async createGoal(userId: string, data: any) {
    return this.repo.create({
      userId,
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount || 0,
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      category: data.category || 'General',
      notes: data.notes,
    });
  }

  async deposit(id: string, userId: string, amount: number) {
    const goal = await this.repo.findById(id, userId);
    if (!goal) throw new NotFoundError('Goal not found');

    const newAmount = goal.currentAmount + amount;
    const isCompleted = newAmount >= goal.targetAmount;

    return this.repo.update(id, userId, {
      currentAmount: newAmount,
      isCompleted,
    });
  }

  async withdraw(id: string, userId: string, amount: number) {
    const goal = await this.repo.findById(id, userId);
    if (!goal) throw new NotFoundError('Goal not found');

    const newAmount = Math.max(0, goal.currentAmount - amount);
    const isCompleted = newAmount >= goal.targetAmount;

    return this.repo.update(id, userId, {
      currentAmount: newAmount,
      isCompleted,
    });
  }

  async updateGoal(id: string, userId: string, data: any) {
    const goal = await this.repo.findById(id, userId);
    if (!goal) throw new NotFoundError('Goal not found');

    const updateData: any = { ...data };
    if (data.targetDate) {
      updateData.targetDate = new Date(data.targetDate);
    }
    if (data.targetAmount !== undefined && data.currentAmount !== undefined) {
      updateData.isCompleted = data.currentAmount >= data.targetAmount;
    }

    return this.repo.update(id, userId, updateData);
  }

  async deleteGoal(id: string, userId: string) {
    const goal = await this.repo.findById(id, userId);
    if (!goal) throw new NotFoundError('Goal not found');
    return this.repo.delete(id, userId);
  }
}
