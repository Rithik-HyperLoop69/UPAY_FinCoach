export interface StructuredFinancialContext {
  userId: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  currentBalance: number;
  financialHealthScore: number;
  healthTier: string;
  topSpendingCategories: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  forecast: {
    expectedMonthlyIncome: number;
    expectedMonthlyExpense: number;
    projectedNetCashFlow: number;
    confidenceTier: string;
  };
  statisticalForecast?: {
    modelName: string;
    mape: number;
    shortfallProbability: number;
    quantileBounds: {
      p10EndingBalance: number;
      p50EndingBalance: number;
      p90EndingBalance: number;
    };
  };
  anomalies?: {
    totalDetected: number;
    highSeverityCount: number;
    recentAnomalies: {
      category: string;
      amount: number;
      severity: string;
      reason: string;
    }[];
  };
  behaviorProfile?: {
    persona?: string;
    summary?: string;
    primaryStrength?: string;
    topRisk?: string;
    primaryLifestyleCategory?: string;
    peakSpendingDays?: string[];
    runwayMonths?: number;
    incomeStabilityIndex?: number;
    pillars?: {
      name: string;
      score: number;
      rating: string;
      weight: number;
    }[];
  };
  recurringObligations: {
    name: string;
    amount: number;
    nextExpectedDate: string;
  }[];
  activeBudgets: {
    month: string;
    totalLimit: number;
    totalSpent: number;
    percentageUsed: number;
  } | null;
  goals: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    progressPercent: number;
  }[];
  timestamp: string;
}

export interface CoachResponse {
  message: string;
  observed: string;
  forecast: string;
  suggestion: string;
  provider: 'gemini' | 'deterministic-fallback' | 'cached';
  contextSnapshot: StructuredFinancialContext;
  modelMetrics?: {
    tokensEstimated?: number;
    latencyMs?: number;
    cached?: boolean;
  };
}
