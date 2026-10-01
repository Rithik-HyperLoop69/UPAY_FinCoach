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
  provider: 'gemini' | 'deterministic-fallback';
  contextSnapshot: StructuredFinancialContext;
}
