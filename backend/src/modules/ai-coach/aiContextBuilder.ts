import { AnalyticsService } from '../analytics/analytics.service';
import { ForecastService } from '../forecast/forecast.service';
import { BudgetService } from '../budgets/budget.service';
import { GoalService } from '../goals/goal.service';
import { StructuredFinancialContext } from './ai.types';

export class AIContextBuilder {
  private analyticsService: AnalyticsService;
  private forecastService: ForecastService;
  private budgetService: BudgetService;
  private goalService: GoalService;

  constructor() {
    this.analyticsService = new AnalyticsService();
    this.forecastService = new ForecastService();
    this.budgetService = new BudgetService();
    this.goalService = new GoalService();
  }

  async buildContext(userId: string): Promise<StructuredFinancialContext> {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const [summary, healthScore, spending, forecast, budget, goals] = await Promise.all([
      this.analyticsService.getSummary(userId),
      this.analyticsService.calculateHealthScore(userId),
      this.analyticsService.getSpendingBreakdown(userId, currentMonth),
      this.forecastService.getForecast(userId),
      this.budgetService.getBudgetForMonth(userId, currentMonth),
      this.goalService.getGoals(userId),
    ]);

    const topSpending = spending.slice(0, 5).map((s) => ({
      category: s.category,
      amount: s.amount,
      percentage: s.percentage,
    }));

    const recurring = forecast.recurringObligations.slice(0, 6).map((o) => ({
      name: o.name,
      amount: o.expectedAmount,
      nextExpectedDate: o.nextExpectedDate,
    }));

    return {
      userId,
      monthlyIncome: summary.monthlyIncome,
      monthlyExpenses: summary.monthlyExpenses,
      savingsRate: summary.monthlySavingsRate,
      currentBalance: summary.currentBalance,
      financialHealthScore: healthScore.score,
      healthTier: healthScore.tier,
      topSpendingCategories: topSpending,
      forecast: {
        expectedMonthlyIncome: forecast.expectedMonthlyIncome,
        expectedMonthlyExpense: forecast.expectedMonthlyExpense,
        projectedNetCashFlow: forecast.expectedMonthlyNet,
        confidenceTier: forecast.confidenceTier,
      },
      recurringObligations: recurring,
      activeBudgets: budget
        ? {
            month: budget.month,
            totalLimit: budget.totalLimit,
            totalSpent: budget.totalSpent,
            percentageUsed: budget.totalPercentage,
          }
        : null,
      goals: goals.map((g) => ({
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        progressPercent: g.progressPercent,
      })),
      timestamp: new Date().toISOString(),
    };
  }
}
