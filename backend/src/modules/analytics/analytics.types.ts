export interface FinancialSummary {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNetSavings: number;
  monthlySavingsRate: number;
  incomeGrowthRate: number;
  expenseGrowthRate: number;
  averageDailySpending: number;
  currency: string;
}

export interface CategorySpendingBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  color?: string;
  icon?: string;
}

export interface MonthlyTrendPoint {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  netSavings: number;
  savingsRate: number;
}

export interface HealthScoreBreakdown {
  score: number; // 0 - 100
  tier: 'Excellent' | 'Strong' | 'Moderate' | 'Needs Attention';
  factors: {
    savingsBehavior: {
      score: number; // max 25
      max: 25;
      description: string;
    };
    budgetAdherence: {
      score: number; // max 25
      max: 25;
      description: string;
    };
    cashFlowStability: {
      score: number; // max 25
      max: 25;
      description: string;
    };
    goalProgress: {
      score: number; // max 25
      max: 25;
      description: string;
    };
  };
  disclaimer: string;
}
