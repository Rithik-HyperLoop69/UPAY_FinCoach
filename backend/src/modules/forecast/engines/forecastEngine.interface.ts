import { Transaction } from '@prisma/client';
import { ForecastResult } from '../forecast.types';

export interface ForecastEngine {
  name: string;
  generateForecast(
    transactions: Transaction[],
    currentBalance: number,
    declaredMonthlyIncome?: number
  ): Promise<ForecastResult>;
}
