import { ForecastRepository } from './forecast.repository';
import { ForecastEngine } from './engines/forecastEngine.interface';
import { AdaptiveForecastingEngine } from './engines/adaptiveForecastEngine';
import { ForecastResult } from './forecast.types';

export class ForecastService {
  private repo: ForecastRepository;
  private engine: ForecastEngine;

  constructor(engine?: ForecastEngine) {
    this.repo = new ForecastRepository();
    this.engine = engine || new AdaptiveForecastingEngine();
  }

  async getForecast(userId: string): Promise<ForecastResult> {
    const transactions = await this.repo.getTransactions(userId);
    const profile = await this.repo.getFinancialProfile(userId);

    // Calculate current net liquid balance
    let currentBalance = 0;
    transactions.forEach((tx) => {
      if (tx.type === 'INCOME') currentBalance += tx.amount;
      else if (tx.type === 'EXPENSE') currentBalance -= tx.amount;
    });

    const declaredIncome = profile?.monthlyIncome || 45000;
    const forecast = await this.engine.generateForecast(transactions, currentBalance, declaredIncome);

    // Persist forecast points for 30D horizon
    if (forecast.thirtyDays.points.length > 0) {
      await this.repo.saveForecastPoints(
        userId,
        '30D',
        forecast.thirtyDays.points.map((p) => ({
          date: new Date(p.date),
          projectedIncome: p.projectedIncome,
          projectedExpense: p.projectedExpense,
          projectedNet: p.projectedNet,
          projectedBalance: p.projectedBalance,
          confidence: forecast.confidenceScore / 100,
        }))
      );
    }

    // Auto-generate alerts for high-severity risks
    for (const risk of forecast.identifiedRisks) {
      if (risk.severity === 'CRITICAL' || risk.severity === 'WARNING') {
        await this.repo.createAlertIfNotExists(
          userId,
          risk.title,
          risk.message,
          risk.severity,
          'CASH_FLOW_SHORTAGE'
        );
      }
    }

    return forecast;
  }

  async getRisks(userId: string) {
    const forecast = await this.getForecast(userId);
    return {
      risks: forecast.identifiedRisks,
      confidenceScore: forecast.confidenceScore,
      recurringObligations: forecast.recurringObligations,
    };
  }
}
