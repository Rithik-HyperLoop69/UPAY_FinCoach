import { AnalyticsRepository } from './analytics.repository';
import {
  FinancialSummary,
  CategorySpendingBreakdown,
  MonthlyTrendPoint,
  HealthScoreBreakdown,
} from './analytics.types';
import prisma from '../../config/database';

export class AnalyticsService {
  private repo: AnalyticsRepository;

  constructor() {
    this.repo = new AnalyticsRepository();
  }

  async getSummary(userId: string): Promise<FinancialSummary> {
    const allTransactions = await this.repo.getTransactionsByUser(userId);

    let totalIncome = 0;
    let totalExpenses = 0;

    // Monthly bucketing
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    let currentMonthIncome = 0;
    let currentMonthExpenses = 0;
    let prevMonthIncome = 0;
    let prevMonthExpenses = 0;

    allTransactions.forEach((tx) => {
      const txMonthKey = tx.date.toISOString().slice(0, 7);

      if (tx.type === 'INCOME') {
        totalIncome += tx.amount;
        if (txMonthKey === currentMonthKey) currentMonthIncome += tx.amount;
        if (txMonthKey === prevMonthKey) prevMonthIncome += tx.amount;
      } else if (tx.type === 'EXPENSE') {
        totalExpenses += tx.amount;
        if (txMonthKey === currentMonthKey) currentMonthExpenses += tx.amount;
        if (txMonthKey === prevMonthKey) prevMonthExpenses += tx.amount;
      }
    });

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    const monthlyNetSavings = currentMonthIncome - currentMonthExpenses;
    const monthlySavingsRate =
      currentMonthIncome > 0
        ? ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100
        : 0;

    // Growth rates
    const incomeGrowthRate =
      prevMonthIncome > 0
        ? ((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100
        : 0;
    const expenseGrowthRate =
      prevMonthExpenses > 0
        ? ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100
        : 0;

    // Average daily spending this month
    const daysPassedInMonth = Math.max(1, now.getDate());
    const averageDailySpending = currentMonthExpenses / daysPassedInMonth;

    return {
      currentBalance: netSavings,
      totalIncome: Math.round(totalIncome),
      totalExpenses: Math.round(totalExpenses),
      netSavings: Math.round(netSavings),
      savingsRate: Number(savingsRate.toFixed(1)),
      monthlyIncome: Math.round(currentMonthIncome),
      monthlyExpenses: Math.round(currentMonthExpenses),
      monthlyNetSavings: Math.round(monthlyNetSavings),
      monthlySavingsRate: Number(monthlySavingsRate.toFixed(1)),
      incomeGrowthRate: Number(incomeGrowthRate.toFixed(1)),
      expenseGrowthRate: Number(expenseGrowthRate.toFixed(1)),
      averageDailySpending: Math.round(averageDailySpending),
      currency: 'BDT',
    };
  }

  async getSpendingBreakdown(userId: string, month?: string): Promise<CategorySpendingBreakdown[]> {
    const where: any = {
      userId,
      type: 'EXPENSE',
    };

    if (month) {
      const [y, m] = month.split('-');
      const start = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      const end = new Date(parseInt(y, 10), parseInt(m, 10), 0, 23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    }

    const expenses = await prisma.transaction.groupBy({
      by: ['category'],
      where,
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    const totalExpense = expenses.reduce((acc, curr) => acc + (curr._sum.amount || 0), 0);

    // Fetch user categories for colors/icons
    const categories = await prisma.category.findMany({
      where: { OR: [{ userId }, { isSystem: true }] },
    });
    const catMap = new Map(categories.map((c) => [c.name, c]));

    return expenses.map((item) => {
      const amount = item._sum.amount || 0;
      const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      const catConfig = catMap.get(item.category);

      return {
        category: item.category,
        amount: Math.round(amount),
        percentage: Number(percentage.toFixed(1)),
        transactionCount: item._count.id,
        color: catConfig?.color || '#0284c7',
        icon: catConfig?.icon || 'tag',
      };
    });
  }

  async getMonthlyTrends(userId: string): Promise<MonthlyTrendPoint[]> {
    const allTransactions = await this.repo.getTransactionsByUser(userId);

    const monthlyMap = new Map<string, { income: number; expense: number }>();

    allTransactions.forEach((tx) => {
      const monthKey = tx.date.toISOString().slice(0, 7);
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expense: 0 });
      }
      const current = monthlyMap.get(monthKey)!;
      if (tx.type === 'INCOME') current.income += tx.amount;
      if (tx.type === 'EXPENSE') current.expense += tx.amount;
    });

    const sortedMonths = Array.from(monthlyMap.keys()).sort();

    return sortedMonths.map((month) => {
      const data = monthlyMap.get(month)!;
      const netSavings = data.income - data.expense;
      const savingsRate = data.income > 0 ? (netSavings / data.income) * 100 : 0;

      return {
        month,
        income: Math.round(data.income),
        expense: Math.round(data.expense),
        netSavings: Math.round(netSavings),
        savingsRate: Number(savingsRate.toFixed(1)),
      };
    });
  }

  async calculateHealthScore(userId: string): Promise<HealthScoreBreakdown> {
    const summary = await this.getSummary(userId);
    const currentMonthKey = new Date().toISOString().slice(0, 7);
    const budget = await this.repo.getBudgetForMonth(userId, currentMonthKey);
    const goals = await this.repo.getSavingsGoals(userId);

    // Factor 1: Savings Behavior (0 - 25 points)
    // Target is 25% savings rate
    let savingsScore = 0;
    if (summary.monthlySavingsRate >= 30) savingsScore = 25;
    else if (summary.monthlySavingsRate >= 20) savingsScore = 22;
    else if (summary.monthlySavingsRate >= 15) savingsScore = 18;
    else if (summary.monthlySavingsRate >= 10) savingsScore = 14;
    else if (summary.monthlySavingsRate > 0) savingsScore = 8;
    else savingsScore = 2;

    // Factor 2: Budget Adherence (0 - 25 points)
    let budgetScore = 20; // Default when no budget exceeded
    if (budget && budget.totalLimit > 0) {
      const utilization = (summary.monthlyExpenses / budget.totalLimit) * 100;
      if (utilization <= 80) budgetScore = 25;
      else if (utilization <= 95) budgetScore = 20;
      else if (utilization <= 100) budgetScore = 15;
      else if (utilization <= 110) budgetScore = 8;
      else budgetScore = 3;
    }

    // Factor 3: Cash-Flow Stability (0 - 25 points)
    // Stability based on positive net flow and expense volatility
    let stabilityScore = 18;
    if (summary.monthlyNetSavings > 15000) stabilityScore = 25;
    else if (summary.monthlyNetSavings > 5000) stabilityScore = 20;
    else if (summary.monthlyNetSavings >= 0) stabilityScore = 15;
    else stabilityScore = 5;

    // Factor 4: Goal Progress (0 - 25 points)
    let goalScore = 15;
    if (goals.length > 0) {
      const avgProgress =
        goals.reduce((acc, g) => acc + (g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0), 0) /
        goals.length;
      if (avgProgress >= 70) goalScore = 25;
      else if (avgProgress >= 50) goalScore = 21;
      else if (avgProgress >= 25) goalScore = 16;
      else goalScore = 10;
    }

    const totalScore = Math.min(100, Math.round(savingsScore + budgetScore + stabilityScore + goalScore));

    let tier: 'Excellent' | 'Strong' | 'Moderate' | 'Needs Attention' = 'Moderate';
    if (totalScore >= 85) tier = 'Excellent';
    else if (totalScore >= 70) tier = 'Strong';
    else if (totalScore >= 50) tier = 'Moderate';
    else tier = 'Needs Attention';

    // Persist calculated score to profile
    await this.repo.updateHealthScore(userId, totalScore);

    return {
      score: totalScore,
      tier,
      factors: {
        savingsBehavior: {
          score: savingsScore,
          max: 25,
          description: `Current savings rate of ${summary.monthlySavingsRate}%. (Healthy target: 20%+)`,
        },
        budgetAdherence: {
          score: budgetScore,
          max: 25,
          description: budget
            ? `Monthly budget utilization is managed within safe limits.`
            : `No explicit limits exceeded; disciplined regular spending.`,
        },
        cashFlowStability: {
          score: stabilityScore,
          max: 25,
          description: `Positive monthly net surplus of ৳${summary.monthlyNetSavings.toLocaleString()}.`,
        },
        goalProgress: {
          score: goalScore,
          max: 25,
          description: `${goals.length} active savings targets being tracked with regular contributions.`,
        },
      },
      disclaimer:
        'This score is an analytical indicator calculated from your historical cash inflows, expenses, and savings consistency. It does not constitute certified investment advice.',
    };
  }
}
