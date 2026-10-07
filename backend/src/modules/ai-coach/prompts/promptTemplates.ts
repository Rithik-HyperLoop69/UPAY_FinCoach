import { StructuredFinancialContext } from '../ai.types';

export const buildPromptFromTemplate = (
  userMessage: string,
  context: StructuredFinancialContext
): string => {
  const contextStr = JSON.stringify(
    {
      financialKPIs: {
        currentBalance: `৳${context.currentBalance.toLocaleString()}`,
        monthlyIncome: `৳${context.monthlyIncome.toLocaleString()}`,
        monthlyExpenses: `৳${context.monthlyExpenses.toLocaleString()}`,
        savingsRate: `${context.savingsRate}%`,
        healthScore: `${context.financialHealthScore}/100 (${context.healthTier})`,
      },
      statisticalForecaster: context.statisticalForecast
        ? {
            engine: context.statisticalForecast.modelName,
            backtestedMape: `${context.statisticalForecast.mape}%`,
            shortfallProbability: `${Math.round(context.statisticalForecast.shortfallProbability * 100)}%`,
            quantileBounds30d: {
              p10Pessimistic: `৳${Math.round(context.statisticalForecast.quantileBounds.p10EndingBalance).toLocaleString()}`,
              p50Expected: `৳${Math.round(context.statisticalForecast.quantileBounds.p50EndingBalance).toLocaleString()}`,
              p90Optimistic: `৳${Math.round(context.statisticalForecast.quantileBounds.p90EndingBalance).toLocaleString()}`,
            },
          }
        : undefined,
      statisticalAnomalies: context.anomalies,
      behavioralPillars: context.behaviorProfile,
      topSpendingCategories: context.topSpendingCategories,
      upcomingRecurringObligations: context.recurringObligations,
      budgets: context.activeBudgets,
      savingsGoals: context.goals,
    },
    null,
    2
  );

  return `
[PROPRIETARY FINANCIAL INTELLIGENCE CONTEXT]
${contextStr}

[USER QUESTION / COACHING INQUIRY]
"${userMessage}"

[INSTRUCTIONS]
Provide an empathetic, high-precision coaching response strictly grounded in the intelligence context above.
Highlight observed facts, model forecast intervals, and practical coaching suggestions.
Follow the mandatory 3-section structure: **Observed:**, **Forecast:**, and **Suggestion:**.
`;
};
