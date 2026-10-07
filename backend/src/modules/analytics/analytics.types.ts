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

export interface DetectedAnomaly {
  id: string;
  transactionId?: string;
  category: string;
  merchant?: string;
  amount: number;
  expectedBaseline: number;
  deviationRatio: number; // e.g. 2.4x
  severity: 'CRITICAL' | 'MODERATE' | 'MILD';
  anomalyType: 'AMOUNT_OUTLIER' | 'CATEGORY_SURGE' | 'VELOCITY_BURST';
  date: string;
  explanation: string;
  actionAdvice: string;
}

export interface CategoryBaseline {
  category: string;
  mean: number;
  stdDev: number;
  median: number;
  iqr: number;
  sampleCount: number;
  normalUpperBound: number;
}

export interface UserFinancialBehaviorProfile {
  userId: string;
  typicalSalaryDays: string; // e.g., "1st - 5th of month"
  averageDailyDiscretionaryBurn: number;
  peakSpendingDays: string[]; // e.g. ["Friday", "Saturday"]
  fixedCommitmentRatio: number; // % of income committed to recurring
  discretionaryRatio: number;
  incomeStabilityIndex: number; // 0 - 100
  expenseVolatilityIndex: number; // 0 - 100
  runwayMonths: number;
  primaryLifestyleCategory: string;
}

export interface BehavioralHealthPillar {
  name: string;
  score: number;
  max: number;
  weightPercent: number;
  status: 'EXCELLENT' | 'HEALTHY' | 'MODERATE' | 'VULNERABLE';
  metricValue: string;
  benchmark: string;
  impactExplanation: string;
}

export interface HealthScoreBreakdown {
  score: number; // 0 - 100
  tier: 'Excellent' | 'Strong' | 'Moderate' | 'Needs Attention';
  confidenceScore: number; // 0 - 100
  modelVersion: string;
  pillars: {
    incomeStability: BehavioralHealthPillar;
    spendingDiscipline: BehavioralHealthPillar;
    savingsBuffer: BehavioralHealthPillar;
    debtAndCommitmentBurden: BehavioralHealthPillar;
    budgetAdherence: BehavioralHealthPillar;
    emergencyRunway: BehavioralHealthPillar;
  };
  strengths: string[];
  vulnerabilities: string[];
  actionableRecommendations: string[];
  factors: {
    savingsBehavior: {
      score: number;
      max: number;
      description: string;
    };
    budgetAdherence: {
      score: number;
      max: number;
      description: string;
    };
    cashFlowStability: {
      score: number;
      max: number;
      description: string;
    };
    goalProgress: {
      score: number;
      max: number;
      description: string;
    };
  };
  disclaimer: string;
}
