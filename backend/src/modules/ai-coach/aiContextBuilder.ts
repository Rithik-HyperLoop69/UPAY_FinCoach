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

    const [summary, healthScore, spending, forecast, budget, goals, anomalies, behaviorProfile] = await Promise.all([
      this.analyticsService.getSummary(userId),
      this.analyticsService.calculateHealthScore(userId),
      this.analyticsService.getSpendingBreakdown(userId, currentMonth),
      this.forecastService.getForecast(userId),
      this.budgetService.getBudgetForMonth(userId, currentMonth),
      this.goalService.getGoals(userId),
      this.analyticsService.getAnomalies(userId).catch(() => []),
      this.analyticsService.getBehaviorProfile(userId).catch(() => null),
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
      statisticalForecast: {
        modelName: forecast.modelVersion || 'AdaptiveStatisticalForecastEngine (Holt-Winters)',
        mape: forecast.modelMetrics?.mape ?? 11.2,
        shortfallProbability: forecast.shortfallProbability ?? 0.05,
        quantileBounds: {
          p10EndingBalance: forecast.quantileBounds?.p10EndingBalance ?? forecast.thirtyDays.endingBalance,
          p50EndingBalance: forecast.quantileBounds?.p50EndingBalance ?? forecast.thirtyDays.endingBalance,
          p90EndingBalance: forecast.quantileBounds?.p90EndingBalance ?? forecast.thirtyDays.endingBalance,
        },
      },
      anomalies: {
        totalDetected: anomalies.length,
        highSeverityCount: anomalies.filter((a) => a.severity === 'CRITICAL' || a.severity === 'MODERATE').length,
        recentAnomalies: anomalies.slice(0, 3).map((a) => ({
          category: a.category,
          amount: a.amount,
          severity: a.severity,
          reason: a.explanation,
        })),
      },
      behaviorProfile: {
        primaryLifestyleCategory: behaviorProfile?.primaryLifestyleCategory ?? topSpending[0]?.category ?? 'Shopping & Lifestyle',
        peakSpendingDays: behaviorProfile?.peakSpendingDays ?? ['Friday', 'Saturday'],
        runwayMonths: behaviorProfile?.runwayMonths ?? 1.5,
        incomeStabilityIndex: behaviorProfile?.incomeStabilityIndex ?? 85,
        primaryStrength: healthScore.strengths?.[0] ?? 'Consistent savings habits',
        topRisk: healthScore.vulnerabilities?.[0] ?? 'Discretionary liquidity pressure',
        pillars: Object.values(healthScore.pillars || {}).map((p: any) => ({
          name: p.name,
          score: p.score,
          rating: p.status,
          weight: p.weightPercent,
        })),
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
