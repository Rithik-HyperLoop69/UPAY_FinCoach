import { Transaction } from '@prisma/client';
import { DetectedAnomaly, CategoryBaseline } from './analytics.types';

export class AnomalyDetector {
  /**
   * Run full statistical outlier and velocity anomaly detection across transactions
   */
  detectAnomalies(transactions: Transaction[]): DetectedAnomaly[] {
    const anomalies: DetectedAnomaly[] = [];
    const expenseTx = transactions.filter((t) => t.type === 'EXPENSE');

    if (expenseTx.length < 5) {
      return anomalies;
    }

    // 1. Calculate Category-Specific Baselines (Mean, StdDev, Median, IQR)
    const baselines = this.computeCategoryBaselines(expenseTx);

    // 2. Individual Transaction Outlier Detection (Z-Score + IQR Filter)
    const transactionAnomalies = this.detectAmountOutliers(expenseTx, baselines);
    anomalies.push(...transactionAnomalies);

    // 3. Category Velocity Spike Detection (Weekly acceleration vs. trailing 4-week mean)
    const velocityAnomalies = this.detectVelocitySurges(expenseTx);
    anomalies.push(...velocityAnomalies);

    // Sort by severity (CRITICAL first, then MODERATE, then MILD) and recency
    const severityRank = { CRITICAL: 3, MODERATE: 2, MILD: 1 };
    return anomalies.sort((a, b) => {
      const sDiff = severityRank[b.severity] - severityRank[a.severity];
      if (sDiff !== 0) return sDiff;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  /**
   * Compute robust parametric & non-parametric statistical metrics per category
   */
  computeCategoryBaselines(transactions: Transaction[]): Map<string, CategoryBaseline> {
    const map = new Map<string, CategoryBaseline>();
    const grouped = new Map<string, number[]>();

    transactions.forEach((tx) => {
      if (!grouped.has(tx.category)) grouped.set(tx.category, []);
      grouped.get(tx.category)!.push(tx.amount);
    });

    grouped.forEach((amounts, category) => {
      if (amounts.length === 0) return;

      const sorted = [...amounts].sort((a, b) => a - b);
      const count = sorted.length;
      const sum = sorted.reduce((a, b) => a + b, 0);
      const mean = sum / count;

      const variance =
        count > 1
          ? sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (count - 1)
          : 0;
      const stdDev = Math.sqrt(variance);

      // Quantiles
      const q1 = sorted[Math.floor(count * 0.25)];
      const median = sorted[Math.floor(count * 0.5)];
      const q3 = sorted[Math.floor(count * 0.75)];
      const iqr = Math.max(100, q3 - q1);

      // Robust Upper Bound: 2.5 standard deviations OR Tukey 1.5x IQR
      const normalUpperBound = Math.round(
        Math.max(mean + 2.2 * stdDev, q3 + 1.8 * iqr)
      );

      map.set(category, {
        category,
        mean: Math.round(mean),
        stdDev: Math.round(stdDev),
        median: Math.round(median),
        iqr: Math.round(iqr),
        sampleCount: count,
        normalUpperBound,
      });
    });

    return map;
  }

  /**
   * Identify single-transaction outliers that exceed category upper boundaries
   */
  private detectAmountOutliers(
    transactions: Transaction[],
    baselines: Map<string, CategoryBaseline>
  ): DetectedAnomaly[] {
    const anomalies: DetectedAnomaly[] = [];
    const knownRecurringKeywords = ['rent', 'desco', 'link3', 'electricity', 'broadband', 'dps', 'tuition'];

    transactions.forEach((tx) => {
      const baseline = baselines.get(tx.category);
      if (!baseline || baseline.sampleCount < 3) return;

      // Filter out known fixed monthly bills to avoid false alarms
      const descLower = (tx.description + ' ' + (tx.merchant || '')).toLowerCase();
      const isKnownRecurring = knownRecurringKeywords.some((kw) => descLower.includes(kw));
      if (isKnownRecurring && tx.category === 'Housing & Rent') return;

      // Check if transaction amount significantly exceeds normal upper bound
      if (tx.amount > baseline.normalUpperBound && tx.amount >= 2000) {
        const ratio = Number((tx.amount / Math.max(1, baseline.median)).toFixed(1));
        const zScore = baseline.stdDev > 0 ? (tx.amount - baseline.mean) / baseline.stdDev : 2;

        let severity: 'CRITICAL' | 'MODERATE' | 'MILD' = 'MILD';
        if (ratio >= 3.5 || zScore >= 3.2) {
          severity = 'CRITICAL';
        } else if (ratio >= 2.0 || zScore >= 2.2) {
          severity = 'MODERATE';
        }

        anomalies.push({
          id: `anom-outlier-${tx.id}`,
          transactionId: tx.id,
          category: tx.category,
          merchant: tx.merchant || 'Unknown Merchant',
          amount: tx.amount,
          expectedBaseline: baseline.median,
          deviationRatio: ratio,
          severity,
          anomalyType: 'AMOUNT_OUTLIER',
          date: tx.date.toISOString().slice(0, 10),
          explanation: `Transaction of ৳${tx.amount.toLocaleString()} is ${ratio}x higher than your typical ৳${baseline.median.toLocaleString()} spend in ${tx.category} (Z-Score: ${zScore.toFixed(1)}).`,
          actionAdvice:
            severity === 'CRITICAL'
              ? `Confirm if this was an authorized one-off expenditure and adjust your remaining ${tx.category} allowance accordingly.`
              : `Review this transaction to ensure your monthly category budget stays on track.`,
        });
      }
    });

    return anomalies;
  }

  /**
   * Detect velocity surges where category expenditure accelerated abruptly in recent 7 days
   */
  private detectVelocitySurges(transactions: Transaction[]): DetectedAnomaly[] {
    const anomalies: DetectedAnomaly[] = [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentSpend = new Map<string, number>();
    const priorSpend = new Map<string, number>();

    transactions.forEach((tx) => {
      const txTime = tx.date.getTime();
      if (txTime >= sevenDaysAgo.getTime()) {
        recentSpend.set(tx.category, (recentSpend.get(tx.category) || 0) + tx.amount);
      } else if (txTime >= thirtyDaysAgo.getTime()) {
        priorSpend.set(tx.category, (priorSpend.get(tx.category) || 0) + tx.amount);
      }
    });

    recentSpend.forEach((recentTotal, category) => {
      // Prior weekly average over the remaining ~23 days (~3.3 weeks)
      const priorWeeklyAvg = (priorSpend.get(category) || 0) / 3.3;

      if (priorWeeklyAvg > 800 && recentTotal > priorWeeklyAvg * 2.2) {
        const ratio = Number((recentTotal / priorWeeklyAvg).toFixed(1));
        anomalies.push({
          id: `anom-surge-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          category,
          amount: Math.round(recentTotal),
          expectedBaseline: Math.round(priorWeeklyAvg),
          deviationRatio: ratio,
          severity: ratio >= 3.0 ? 'CRITICAL' : 'MODERATE',
          anomalyType: 'VELOCITY_BURST',
          date: now.toISOString().slice(0, 10),
          explanation: `Your ${category} spending over the past 7 days (৳${Math.round(recentTotal).toLocaleString()}) is ${ratio}x your trailing weekly average (৳${Math.round(priorWeeklyAvg).toLocaleString()}).`,
          actionAdvice: `Pause non-essential ${category} expenses for the next 5 days to prevent cash-flow contraction.`,
        });
      }
    });

    return anomalies;
  }
}
