export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  avatarUrl?: string;
  upayWalletNumber?: string;
  upayConnected: boolean;
  profile?: FinancialProfile;
}

export interface FinancialProfile {
  id: string;
  monthlyIncome: number;
  primaryIncomeSource: string;
  riskTolerance: string;
  savingsTargetPercent: number;
  occupation: string;
  primaryCurrency: string;
  financialHealthScore: number;
  financialPersona: string;
  emergencyFundMonths: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  category: string;
  description: string;
  date: string;
  merchant?: string;
  paymentMethod: string;
  status: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  notes?: string;
  metadata?: string;
}

export interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

export interface Budget {
  id: string;
  month: string;
  totalLimit: number;
  totalSpent: number;
  totalRemaining: number;
  totalPercentage: number;
  items: BudgetItem[];
}

export interface BudgetItem {
  id: string;
  category: string;
  limitAmount: number;
  actualAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  status: 'SAFE' | 'MODERATE' | 'WARNING' | 'CRITICAL' | 'EXCEEDED';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  category: string;
  isCompleted: boolean;
  notes?: string;
  remainingAmount: number;
  progressPercent: number;
  estimatedMonthsRemaining: number | null;
  estimatedCompletionDate: string | null;
}

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

export interface HealthScoreData {
  score: number;
  tier: 'Excellent' | 'Strong' | 'Moderate' | 'Needs Attention';
  confidenceScore?: number;
  modelVersion?: string;
  pillars?: {
    incomeStability: BehavioralHealthPillar;
    spendingDiscipline: BehavioralHealthPillar;
    savingsBuffer: BehavioralHealthPillar;
    debtAndCommitmentBurden: BehavioralHealthPillar;
    budgetAdherence: BehavioralHealthPillar;
    emergencyRunway: BehavioralHealthPillar;
  };
  strengths?: string[];
  vulnerabilities?: string[];
  actionableRecommendations?: string[];
  factors: {
    savingsBehavior: { score: number; max: number; description: string };
    budgetAdherence: { score: number; max: number; description: string };
    cashFlowStability: { score: number; max: number; description: string };
    goalProgress: { score: number; max: number; description: string };
  };
  disclaimer: string;
}

export interface ForecastPoint {
  date: string;
  dayLabel: string;
  projectedIncome: number;
  projectedExpense: number;
  projectedNet: number;
  projectedBalance: number;
  p10Balance?: number;
  p90Balance?: number;
  varianceDelta?: number;
  scheduledEvents: string[];
}

export interface ForecastResult {
  confidenceScore: number;
  confidenceTier: string;
  dataMonthsCount: number;
  currentBalance: number;
  expectedMonthlyIncome: number;
  expectedMonthlyExpense: number;
  expectedMonthlyNet: number;
  modelVersion?: string;
  modelMetrics?: {
    mae: number;
    rmse: number;
    mape: number;
    backtestWindowMonths?: number;
  };
  shortfallProbability?: number;
  quantileBounds?: {
    p10EndingBalance: number;
    p50EndingBalance: number;
    p90EndingBalance: number;
  };
  sevenDays: { points: ForecastPoint[]; totalProjectedIncome: number; totalProjectedExpense: number; endingBalance: number };
  thirtyDays: { points: ForecastPoint[]; totalProjectedIncome: number; totalProjectedExpense: number; endingBalance: number };
  ninetyDays: { points: ForecastPoint[]; totalProjectedIncome: number; totalProjectedExpense: number; endingBalance: number };
  recurringObligations: {
    id: string;
    name: string;
    category: string;
    merchant?: string;
    expectedAmount: number;
    frequency: string;
    nextExpectedDate: string;
    confidence: number;
  }[];
  identifiedRisks: {
    id: string;
    type: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    title: string;
    message: string;
    projectedDate?: string;
    amountImpact?: number;
    actionRecommendation: string;
  }[];
  assumptions: string[];
}

export interface DetectedAnomaly {
  id: string;
  transactionId?: string;
  category: string;
  merchant?: string;
  amount: number;
  expectedBaseline: number;
  deviationRatio: number;
  severity: 'CRITICAL' | 'MODERATE' | 'MILD';
  anomalyType: 'AMOUNT_OUTLIER' | 'CATEGORY_SURGE' | 'VELOCITY_BURST';
  date: string;
  explanation: string;
  actionAdvice: string;
}

export interface UserBehaviorProfile {
  userId: string;
  typicalSalaryDays: string;
  averageDailyDiscretionaryBurn: number;
  peakSpendingDays: string[];
  fixedCommitmentRatio: number;
  discretionaryRatio: number;
  incomeStabilityIndex: number;
  expenseVolatilityIndex: number;
  runwayMonths: number;
  primaryLifestyleCategory: string;
}

export interface ModelCard {
  modelId: string;
  name: string;
  type: string;
  architecture: string;
  targetTask: string;
  metrics: Record<string, number | string>;
  datasetDetails: string;
  hyperparameters: Record<string, number | string>;
  limitations: string;
}

export interface SystemEvaluationReport {
  evaluationDate: string;
  environment: string;
  models: ModelCard[];
  aggregateSummary: {
    totalProprietaryEngines: number;
    forecastMape: string;
    anomalyF1Score: string;
    mfsExtractionAccuracy: string;
    offlineFallbackResilience: string;
  };
}

export interface AlertItem {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

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

export interface PilotImpactReport {
  publishedDate: string;
  location: string;
  survey: {
    sampleSize: number;
    demographics: {
      segment: string;
      percentage: number;
      description: string;
    }[];
    keyPainPoints: {
      finding: string;
      prevalence: number;
      localContext: string;
    }[];
  };
  pilotStudy: {
    cohortSize: number;
    studyDurationDays: number;
    prePostComparison: {
      metricName: string;
      baselinePreFinCoach: string;
      postFinCoachResult: string;
      percentageChange: string;
      statisticalSignificance: string;
    }[];
    retentionAndEngagement: {
      metric: string;
      value: string;
    }[];
    userSavingsImpact: {
      medianMonthlyFeeSavedBDT: number;
      medianEndMonthBufferIncreaseBDT: number;
      overdraftIncidentReductionPct: number;
    };
  };
  methodologyNote: string;
}
