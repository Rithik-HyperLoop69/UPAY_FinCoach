import { AIContextBuilder } from './aiContextBuilder';
import { StructuredFinancialContext } from './ai.types';

export interface ProactiveNudge {
  id: string;
  type:
    | 'FEE_OPTIMIZATION'
    | 'WEEKEND_SURGE_PREEMPTION'
    | 'LIQUIDITY_SHORTFALL_RISK'
    | 'BUDGET_PACING_SPIKE'
    | 'SAVINGS_GOAL_ACCELERATION'
    | 'UNUSUAL_OUTLIER_ALERT';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  title: string;
  message: string;
  actionLabel: string;
  actionRoute: string;
  potentialSavingsBDT?: number;
  confidenceScore: number;
  generatedAt: string;
}

export class ProactiveNudgeEngine {
  private contextBuilder: AIContextBuilder;

  constructor() {
    this.contextBuilder = new AIContextBuilder();
  }

  public async generateNudges(userId: string): Promise<ProactiveNudge[]> {
    const context: StructuredFinancialContext = await this.contextBuilder.buildContext(userId);
    const nudges: ProactiveNudge[] = [];
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat

    // 1. Critical Anomaly / Outlier Nudge
    if (context.anomalies?.recentAnomalies && context.anomalies.recentAnomalies.length > 0) {
      const topAnomaly = context.anomalies.recentAnomalies[0];
      nudges.push({
        id: `nudge-anomaly-${Date.now()}`,
        type: 'UNUSUAL_OUTLIER_ALERT',
        priority: topAnomaly.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        title: `Uncharacteristic Spurt in ${topAnomaly.category}`,
        message: `Detected ৳${topAnomaly.amount.toLocaleString()} spend (${topAnomaly.reason}). Review to prevent budget spillover.`,
        actionLabel: 'Review Outlier Audit',
        actionRoute: '/analytics',
        potentialSavingsBDT: Math.round(topAnomaly.amount * 0.4),
        confidenceScore: 0.92,
        generatedAt: now.toISOString(),
      });
    }

    // 2. Liquidity Shortfall & Upcoming Commitments Preemption
    const shortfallProb = context.statisticalForecast?.shortfallProbability || 0;
    const p10Balance = context.statisticalForecast?.quantileBounds?.p10EndingBalance;
    if (shortfallProb > 0.15 || (p10Balance !== undefined && p10Balance < 0)) {
      const riskPct = Math.round(shortfallProb * 100);
      const minProjected = p10Balance ?? context.forecast.projectedNetCashFlow;
      nudges.push({
        id: `nudge-shortfall-${Date.now()}`,
        type: 'LIQUIDITY_SHORTFALL_RISK',
        priority: 'CRITICAL',
        title: `Cash-Flow Shortfall Alert (${riskPct}% Probability)`,
        message: `P10 pessimistic projections indicate net liquidity may dip to ৳${minProjected.toLocaleString()} before month-end bills clear.`,
        actionLabel: 'Inspect Cash-Flow Timeline',
        actionRoute: '/forecast',
        potentialSavingsBDT: Math.abs(minProjected < 0 ? minProjected : 2000),
        confidenceScore: 0.88,
        generatedAt: now.toISOString(),
      });
    }

    // 3. Weekend Cash-Burn Seasonality Nudge (Thursday/Friday/Saturday)
    if (dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6) {
      nudges.push({
        id: `nudge-weekend-${Date.now()}`,
        type: 'WEEKEND_SURGE_PREEMPTION',
        priority: 'HIGH',
        title: 'Bangladeshi Weekend Surge Watch (+18%)',
        message: 'Discretionary dining, family transfers, and shopping surge on Fridays & Saturdays. Pre-set a weekend limit of ৳2,500 to stay on track.',
        actionLabel: 'Adjust Budget Pacing',
        actionRoute: '/budgets',
        potentialSavingsBDT: 750,
        confidenceScore: 0.85,
        generatedAt: now.toISOString(),
      });
    }

    // 4. Budget Pacing Velocity Nudge
    if (context.activeBudgets && context.activeBudgets.percentageUsed > 65) {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const currentDay = now.getDate();
      const monthProgressPct = Math.round((currentDay / daysInMonth) * 100);

      if (context.activeBudgets.percentageUsed > monthProgressPct + 10) {
        const remainingBudget = Math.max(0, context.activeBudgets.totalLimit - context.activeBudgets.totalSpent);
        const remainingDays = Math.max(1, daysInMonth - currentDay);
        const dailyCap = Math.round(remainingBudget / remainingDays);

        nudges.push({
          id: `nudge-pacing-${Date.now()}`,
          type: 'BUDGET_PACING_SPIKE',
          priority: 'HIGH',
          title: 'Budget Burn Velocity Exceeding Target',
          message: `You have consumed ${context.activeBudgets.percentageUsed}% of your budget with ${remainingDays} days remaining. Cap daily spend at ৳${dailyCap.toLocaleString()}/day.`,
          actionLabel: 'View Category Limits',
          actionRoute: '/budgets',
          potentialSavingsBDT: Math.round(dailyCap * 3),
          confidenceScore: 0.89,
          generatedAt: now.toISOString(),
        });
      }
    }

    // 5. MFS Cash-Out Fee Optimization Nudge
    const transferCategory = (context.topSpendingCategories || []).find(
      (c) => c.category.toLowerCase().includes('cash out') || c.category.toLowerCase().includes('transfer')
    );
    if (transferCategory && transferCategory.amount > 3000) {
      const estimatedFee = Math.round(transferCategory.amount * 0.0149);
      nudges.push({
        id: `nudge-fee-${Date.now()}`,
        type: 'FEE_OPTIMIZATION',
        priority: 'MEDIUM',
        title: 'MFS Cash-Out Fee Optimization Opportunity',
        message: `You spent ৳${transferCategory.amount.toLocaleString()} in cash-out transfers, generating ~৳${estimatedFee} in fees. Use upay Merchant QR or bank transfer to eliminate fees.`,
        actionLabel: 'Switch to Merchant QR',
        actionRoute: '/transactions',
        potentialSavingsBDT: estimatedFee,
        confidenceScore: 0.94,
        generatedAt: now.toISOString(),
      });
    }

    // 6. Savings Goal Acceleration Nudge
    const goals = context.goals || [];
    if (goals.length > 0 && context.savingsRate > 15) {
      const topGoal = goals.find((g) => g.progressPercent < 90) || goals[0];
      const suggestedDeposit = Math.min(2000, Math.round(context.monthlyIncome * 0.05));
      nudges.push({
        id: `nudge-goal-${Date.now()}`,
        type: 'SAVINGS_GOAL_ACCELERATION',
        priority: 'MEDIUM',
        title: `Accelerate Goal: ${topGoal.name}`,
        message: `Your savings buffer is stable (${context.savingsRate}%). Locking ৳${suggestedDeposit.toLocaleString()} today will reach target ahead of schedule.`,
        actionLabel: 'Deposit to Goal',
        actionRoute: '/goals',
        potentialSavingsBDT: suggestedDeposit,
        confidenceScore: 0.87,
        generatedAt: now.toISOString(),
      });
    }

    // Return prioritized nudges (max 4 high-relevance items)
    return nudges.slice(0, 4);
  }
}
