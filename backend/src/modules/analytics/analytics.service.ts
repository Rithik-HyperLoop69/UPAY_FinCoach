import { AnalyticsRepository } from './analytics.repository';
import {
  FinancialSummary,
  CategorySpendingBreakdown,
  MonthlyTrendPoint,
  HealthScoreBreakdown,
  DetectedAnomaly,
  UserFinancialBehaviorProfile,
} from './analytics.types';
import { BehavioralHealthModel } from './behavioralHealthModel';
import { AnomalyDetector } from './anomalyDetector';
import prisma from '../../config/database';

export class AnalyticsService {
  private repo: AnalyticsRepository;
  private behavioralModel: BehavioralHealthModel;
  private anomalyDetector: AnomalyDetector;

  constructor() {
    this.repo = new AnalyticsRepository();
    this.behavioralModel = new BehavioralHealthModel();
    this.anomalyDetector = new AnomalyDetector();
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
    const transactions = await this.repo.getTransactionsByUser(userId);
    const currentMonthKey = new Date().toISOString().slice(0, 7);
    const budget = await this.repo.getBudgetForMonth(userId, currentMonthKey);
    const goals = await this.repo.getSavingsGoals(userId);

    const breakdown = this.behavioralModel.evaluate(summary, transactions, budget, goals);

    // Persist calculated score to profile
    await this.repo.updateHealthScore(userId, breakdown.score);

    return breakdown;
  }

  async getAnomalies(userId: string): Promise<DetectedAnomaly[]> {
    const transactions = await this.repo.getTransactionsByUser(userId);
    return this.anomalyDetector.detectAnomalies(transactions);
  }

  async getBehaviorProfile(userId: string): Promise<UserFinancialBehaviorProfile> {
    const summary = await this.getSummary(userId);
    const transactions = await this.repo.getTransactionsByUser(userId);
    return this.behavioralModel.deriveBehaviorProfile(userId, summary, transactions);
  }
}
