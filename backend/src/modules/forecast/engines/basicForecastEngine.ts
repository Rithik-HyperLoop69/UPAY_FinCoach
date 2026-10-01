import { Transaction } from '@prisma/client';
import { ForecastEngine } from './forecastEngine.interface';
import {
  ForecastResult,
  RecurringObligation,
  ForecastPointItem,
  CashFlowRisk,
} from '../forecast.types';

export class BasicForecastEngine implements ForecastEngine {
  name = 'BasicDeterministicForecastEngine';

  async generateForecast(
    transactions: Transaction[],
    currentBalance: number,
    declaredMonthlyIncome: number = 45000
  ): Promise<ForecastResult> {
    const now = new Date();

    // 1. Determine Months Count & Confidence Tier
    const monthsSet = new Set<string>();
    transactions.forEach((tx) => {
      monthsSet.add(tx.date.toISOString().slice(0, 7));
    });
    const dataMonthsCount = monthsSet.size;

    let confidenceScore = 80;
    let confidenceTier: 'High' | 'Standard' | 'Low' | 'Insufficient Data' = 'Standard';

    if (dataMonthsCount < 1) {
      confidenceScore = 15;
      confidenceTier = 'Insufficient Data';
    } else if (dataMonthsCount <= 2) {
      confidenceScore = 50;
      confidenceTier = 'Low';
    } else if (dataMonthsCount >= 5) {
      confidenceScore = 92;
      confidenceTier = 'High';
    }

    // 2. Identify Recurring Obligations
    const recurringObligations = this.detectRecurringObligations(transactions);

    // 3. Compute Weighted Historical Inflow and Outflow
    const sortedMonths = Array.from(monthsSet).sort();
    const monthlyIncomeMap = new Map<string, number>();
    const monthlyExpenseMap = new Map<string, number>();

    transactions.forEach((tx) => {
      const m = tx.date.toISOString().slice(0, 7);
      if (tx.type === 'INCOME') {
        monthlyIncomeMap.set(m, (monthlyIncomeMap.get(m) || 0) + tx.amount);
      } else if (tx.type === 'EXPENSE') {
        monthlyExpenseMap.set(m, (monthlyExpenseMap.get(m) || 0) + tx.amount);
      }
    });

    // Recent 3 months weighting: M-1 (0.5), M-2 (0.3), M-3 (0.2)
    let expectedMonthlyIncome = declaredMonthlyIncome;
    let expectedMonthlyExpense = 35000;

    if (sortedMonths.length >= 1) {
      const recentMonths = sortedMonths.slice(-3).reverse();
      const weights = recentMonths.length === 3 ? [0.5, 0.3, 0.2] : recentMonths.length === 2 ? [0.65, 0.35] : [1.0];

      let weightedInc = 0;
      let weightedExp = 0;

      recentMonths.forEach((m, idx) => {
        const w = weights[idx];
        weightedInc += (monthlyIncomeMap.get(m) || declaredMonthlyIncome) * w;
        weightedExp += (monthlyExpenseMap.get(m) || 30000) * w;
      });

      expectedMonthlyIncome = Math.round(weightedInc);
      expectedMonthlyExpense = Math.round(weightedExp);
    }

    const expectedMonthlyNet = expectedMonthlyIncome - expectedMonthlyExpense;

    // Daily discretionary expense (non-recurring baseline)
    const totalMonthlyRecurringExpense = recurringObligations.reduce((acc, curr) => acc + curr.expectedAmount, 0);
    const discretionaryMonthlyExpense = Math.max(5000, expectedMonthlyExpense - totalMonthlyRecurringExpense);
    const dailyDiscretionaryExpense = discretionaryMonthlyExpense / 30;

    // 4. Generate 7-Day, 30-Day, and 90-Day Projection Points
    const sevenDayPoints = this.simulateProjectionTimeline(
      7,
      currentBalance,
      expectedMonthlyIncome,
      dailyDiscretionaryExpense,
      recurringObligations
    );

    const thirtyDayPoints = this.simulateProjectionTimeline(
      30,
      currentBalance,
      expectedMonthlyIncome,
      dailyDiscretionaryExpense,
      recurringObligations
    );

    const ninetyDayPoints = this.simulateLongTermTimeline(
      90,
      currentBalance,
      expectedMonthlyIncome,
      expectedMonthlyExpense,
      recurringObligations
    );

    // 5. Detect Cash-Flow Risks
    const identifiedRisks = this.detectRisks(
      currentBalance,
      thirtyDayPoints,
      recurringObligations,
      monthlyExpenseMap,
      sortedMonths
    );

    const assumptions = [
      `Income estimated via weighted recent history (baseline ৳${expectedMonthlyIncome.toLocaleString()}/mo).`,
      `Identified ${recurringObligations.length} recurring financial commitments totaling ~৳${totalMonthlyRecurringExpense.toLocaleString()}/mo.`,
      `Estimated discretionary daily spending pace: ~৳${Math.round(dailyDiscretionaryExpense).toLocaleString()}/day.`,
    ];

    return {
      confidenceScore,
      confidenceTier,
      dataMonthsCount,
      currentBalance,
      expectedMonthlyIncome,
      expectedMonthlyExpense,
      expectedMonthlyNet,
      sevenDays: {
        points: sevenDayPoints,
        totalProjectedIncome: sevenDayPoints.reduce((acc, p) => acc + p.projectedIncome, 0),
        totalProjectedExpense: sevenDayPoints.reduce((acc, p) => acc + p.projectedExpense, 0),
        endingBalance: sevenDayPoints[sevenDayPoints.length - 1]?.projectedBalance || currentBalance,
      },
      thirtyDays: {
        points: thirtyDayPoints,
        totalProjectedIncome: thirtyDayPoints.reduce((acc, p) => acc + p.projectedIncome, 0),
        totalProjectedExpense: thirtyDayPoints.reduce((acc, p) => acc + p.projectedExpense, 0),
        endingBalance: thirtyDayPoints[thirtyDayPoints.length - 1]?.projectedBalance || currentBalance,
      },
      ninetyDays: {
        points: ninetyDayPoints,
        totalProjectedIncome: ninetyDayPoints.reduce((acc, p) => acc + p.projectedIncome, 0),
        totalProjectedExpense: ninetyDayPoints.reduce((acc, p) => acc + p.projectedExpense, 0),
        endingBalance: ninetyDayPoints[ninetyDayPoints.length - 1]?.projectedBalance || currentBalance,
      },
      recurringObligations,
      identifiedRisks,
      assumptions,
    };
  }

  private detectRecurringObligations(transactions: Transaction[]): RecurringObligation[] {
    // Group transactions by merchant or category to spot regular periodic commitments
    const groups = new Map<string, Transaction[]>();

    transactions.forEach((tx) => {
      const key = tx.merchant || tx.category;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(tx);
    });

    const obligations: RecurringObligation[] = [];
    let idCounter = 1;

    groups.forEach((txs, key) => {
      // Must have occurred at least twice or explicitly marked isRecurring
      const isExplicitRecurring = txs.some((t) => t.isRecurring);
      if (txs.length >= 2 || isExplicitRecurring) {
        const amounts = txs.map((t) => t.amount);
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;

        // Check date intervals if multiple
        let avgDayOfMonth = 5;
        if (txs.length >= 2) {
          const days = txs.map((t) => t.date.getDate());
          avgDayOfMonth = Math.round(days.reduce((a, b) => a + b, 0) / days.length);
        } else {
          avgDayOfMonth = txs[0].date.getDate();
        }

        // Calculate next expected occurrence
        const now = new Date();
        let nextDate = new Date(now.getFullYear(), now.getMonth(), avgDayOfMonth);
        if (nextDate < now) {
          nextDate = new Date(now.getFullYear(), now.getMonth() + 1, avgDayOfMonth);
        }

        const cat = txs[0].category;
        obligations.push({
          id: `rec-${idCounter++}`,
          name: key,
          category: cat,
          merchant: txs[0].merchant || undefined,
          expectedAmount: Math.round(avgAmount),
          frequency: 'MONTHLY',
          approximateDayOfMonth: avgDayOfMonth,
          nextExpectedDate: nextDate.toISOString().slice(0, 10),
          confidence: isExplicitRecurring ? 0.95 : 0.85,
        });
      }
    });

    return obligations.sort((a, b) => a.nextExpectedDate.localeCompare(b.nextExpectedDate));
  }

  private simulateProjectionTimeline(
    daysAhead: number,
    startingBalance: number,
    monthlyIncome: number,
    dailyDiscretionary: number,
    recurringObligations: RecurringObligation[]
  ): ForecastPointItem[] {
    const points: ForecastPointItem[] = [];
    let runningBalance = startingBalance;
    const now = new Date();

    for (let i = 1; i <= daysAhead; i++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + i);
      const dateStr = targetDate.toISOString().slice(0, 10);
      const dayOfMonth = targetDate.getDate();

      let dayIncome = 0;
      let dayExpense = Math.round(dailyDiscretionary);
      const events: string[] = [];

      // 1st of month: Standard corporate salary credit
      if (dayOfMonth === 1) {
        dayIncome += monthlyIncome;
        events.push(`Expected Monthly Salary Inflow (+৳${monthlyIncome.toLocaleString()})`);
      }

      // Check recurring obligations due on this date
      recurringObligations.forEach((obligation) => {
        if (obligation.approximateDayOfMonth === dayOfMonth) {
          dayExpense += obligation.expectedAmount;
          events.push(`Recurring Due: ${obligation.name} (৳${obligation.expectedAmount.toLocaleString()})`);
        }
      });

      const dayNet = dayIncome - dayExpense;
      runningBalance += dayNet;

      points.push({
        date: dateStr,
        dayLabel: targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        projectedIncome: dayIncome,
        projectedExpense: dayExpense,
        projectedNet: dayNet,
        projectedBalance: Math.round(runningBalance),
        scheduledEvents: events,
      });
    }

    return points;
  }

  private simulateLongTermTimeline(
    daysAhead: number,
    startingBalance: number,
    monthlyIncome: number,
    monthlyExpense: number,
    recurringObligations: RecurringObligation[]
  ): ForecastPointItem[] {
    const points: ForecastPointItem[] = [];
    let runningBalance = startingBalance;
    const now = new Date();
    const intervals = 6; // 6 checkpoints over 90 days (every 15 days)
    const stepDays = Math.floor(daysAhead / intervals);

    for (let step = 1; step <= intervals; step++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + step * stepDays);
      const dateStr = targetDate.toISOString().slice(0, 10);

      const periodFraction = stepDays / 30;
      const periodIncome = Math.round(monthlyIncome * periodFraction);
      const periodExpense = Math.round(monthlyExpense * periodFraction);
      const periodNet = periodIncome - periodExpense;
      runningBalance += periodNet;

      points.push({
        date: dateStr,
        dayLabel: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        projectedIncome: periodIncome,
        projectedExpense: periodExpense,
        projectedNet: periodNet,
        projectedBalance: Math.round(runningBalance),
        scheduledEvents: [`15-day projected surplus (+৳${periodNet.toLocaleString()})`],
      });
    }

    return points;
  }

  private detectRisks(
    currentBalance: number,
    thirtyDayPoints: ForecastPointItem[],
    recurringObligations: RecurringObligation[],
    monthlyExpenseMap: Map<string, number>,
    sortedMonths: string[]
  ): CashFlowRisk[] {
    const risks: CashFlowRisk[] = [];

    // Risk 1: Minimum Balance / Cash Shortage Warning
    const lowestPoint = thirtyDayPoints.reduce((min, p) => (p.projectedBalance < min.projectedBalance ? p : min), thirtyDayPoints[0]);

    if (lowestPoint && lowestPoint.projectedBalance < 10000) {
      const severity = lowestPoint.projectedBalance < 0 ? 'CRITICAL' : 'WARNING';
      risks.push({
        id: 'risk-shortage',
        type: 'SHORTAGE_WARNING',
        severity,
        title: 'Projected Liquidity Dip',
        message: `Your projected cash balance dips to ৳${lowestPoint.projectedBalance.toLocaleString()} on ${lowestPoint.date} due to upcoming recurring bills.`,
        projectedDate: lowestPoint.date,
        amountImpact: lowestPoint.projectedBalance,
        actionRecommendation:
          'Consider delaying non-essential discretionary purchases or keeping an extra liquidity cushion in your upay wallet.',
      });
    }

    // Risk 2: Month-over-Month Spending Acceleration
    if (sortedMonths.length >= 2) {
      const latestMonth = sortedMonths[sortedMonths.length - 1];
      const previousMonth = sortedMonths[sortedMonths.length - 2];
      const latestExp = monthlyExpenseMap.get(latestMonth) || 0;
      const prevExp = monthlyExpenseMap.get(previousMonth) || 0;

      if (prevExp > 0 && latestExp > prevExp * 1.15) {
        const increasePercent = Math.round(((latestExp - prevExp) / prevExp) * 100);
        risks.push({
          id: 'risk-spending-acceleration',
          type: 'SPENDING_ACCELERATION',
          severity: 'WARNING',
          title: 'Elevated Spending Pace Detected',
          message: `Recent expenses increased by ${increasePercent}% compared to the prior period, primarily in dining and discretionary categories.`,
          amountImpact: latestExp - prevExp,
          actionRecommendation:
            'Review active monthly budgets and cap dining out to maintain your target 25% savings rate.',
        });
      }
    }

    // Risk 3: Recurring Bill Concentration Warning
    const next7DaysBills = recurringObligations.filter((o) => {
      const diffDays = (new Date(o.nextExpectedDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    });

    if (next7DaysBills.length >= 2) {
      const totalDueSoon = next7DaysBills.reduce((acc, curr) => acc + curr.expectedAmount, 0);
      risks.push({
        id: 'risk-bill-concentration',
        type: 'UNUSUAL_OUTFLOW',
        severity: 'INFO',
        title: 'Upcoming Bill Cluster',
        message: `${next7DaysBills.length} recurring payments (totaling ৳${totalDueSoon.toLocaleString()}) are due within the next 7 days (${next7DaysBills.map((b) => b.name).join(', ')}).`,
        amountImpact: totalDueSoon,
        actionRecommendation:
          'Ensure your primary payment account or upay wallet has sufficient available balance to avoid late payment fees.',
      });
    }

    return risks;
  }
}
