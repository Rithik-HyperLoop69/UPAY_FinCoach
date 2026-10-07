export interface RecurringObligation {
  id: string;
  name: string;
  category: string;
  merchant?: string;
  expectedAmount: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  approximateDayOfMonth?: number;
  nextExpectedDate: string; // YYYY-MM-DD
  confidence: number; // 0.0 - 1.0
}

export interface ForecastPointItem {
  date: string; // YYYY-MM-DD
  dayLabel: string;
  projectedIncome: number;
  projectedExpense: number;
  projectedNet: number;
  projectedBalance: number;
  scheduledEvents: string[];
  p10Balance?: number;
  p90Balance?: number;
}

export interface ModelAccuracyMetrics {
  mae: number;   // Mean Absolute Error in BDT
  rmse: number;  // Root Mean Squared Error in BDT
  mape: number;  // Mean Absolute Percentage Error in %
  backtestWindowMonths: number;
  dataPointsUsed: number;
}

export interface CashFlowRisk {
  id: string;
  type: 'SHORTAGE_WARNING' | 'SPENDING_ACCELERATION' | 'SAVINGS_DECLINE' | 'UNUSUAL_OUTFLOW';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  projectedDate?: string;
  amountImpact?: number;
  actionRecommendation: string;
}

export interface ForecastResult {
  confidenceScore: number; // 0 - 100
  confidenceTier: 'High' | 'Standard' | 'Low' | 'Insufficient Data';
  dataMonthsCount: number;
  currentBalance: number;
  expectedMonthlyIncome: number;
  expectedMonthlyExpense: number;
  expectedMonthlyNet: number;
  modelVersion?: string;
  modelMetrics?: ModelAccuracyMetrics;
  shortfallProbability?: number; // 0.0 - 1.0
  quantileBounds?: {
    p10EndingBalance: number; // Conservative
    p50EndingBalance: number; // Expected median
    p90EndingBalance: number; // Stressed/volatile
  };
  sevenDays: {
    points: ForecastPointItem[];
    totalProjectedIncome: number;
    totalProjectedExpense: number;
    endingBalance: number;
  };
  thirtyDays: {
    points: ForecastPointItem[];
    totalProjectedIncome: number;
    totalProjectedExpense: number;
    endingBalance: number;
  };
  ninetyDays: {
    points: ForecastPointItem[];
    totalProjectedIncome: number;
    totalProjectedExpense: number;
    endingBalance: number;
  };
  recurringObligations: RecurringObligation[];
  identifiedRisks: CashFlowRisk[];
  assumptions: string[];
}
