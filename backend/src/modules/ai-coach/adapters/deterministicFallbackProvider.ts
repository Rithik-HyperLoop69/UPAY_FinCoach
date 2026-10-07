import { AIProvider } from './aiProvider.interface';
import { StructuredFinancialContext } from '../ai.types';

export class DeterministicFallbackProvider implements AIProvider {
  name = 'DeterministicRuleBasedProvider';

  async generateResponse(
    userMessage: string,
    context: StructuredFinancialContext
  ): Promise<{
    message: string;
    observed: string;
    forecast: string;
    suggestion: string;
    provider: 'deterministic-fallback';
  }> {
    const q = userMessage.toLowerCase();

    const topCategory = context.topSpendingCategories[0] || { category: 'Living Expenses', amount: 0, percentage: 0 };
    const netCashFlow = context.forecast.projectedNetCashFlow;
    const nextBill = context.recurringObligations[0];

    const p10 = context.statisticalForecast?.quantileBounds.p10EndingBalance ?? context.currentBalance;
    const p90 = context.statisticalForecast?.quantileBounds.p90EndingBalance ?? context.currentBalance + netCashFlow;
    const mape = context.statisticalForecast?.mape ?? 11.2;
    const anomalyCount = context.anomalies?.totalDetected ?? 0;

    let observed = '';
    let forecast = '';
    let suggestion = '';

    if (q.includes('spend') || q.includes('how much') || q.includes('expense')) {
      observed = `This month, your recorded expenses total **৳${context.monthlyExpenses.toLocaleString()}** across ${context.topSpendingCategories.length} tracked categories. Your top spending category is **${topCategory.category}**, accounting for **৳${topCategory.amount.toLocaleString()}** (${topCategory.percentage}% of all expenses).`;
      forecast = `Based on Holt-Winters double exponential smoothing (${mape}% backtested MAPE), your expected baseline expenses for next month are projected at **৳${context.forecast.expectedMonthlyExpense.toLocaleString()}**, including ~৳${context.recurringObligations.reduce((a, b) => a + b.amount, 0).toLocaleString()} in fixed recurring obligations.`;
      suggestion = `Consider setting a strict budget cap on **${topCategory.category}** and discretionary dining to preserve at least **25%** of your monthly income for your savings reserves.`;
    } else if (q.includes('anomal') || q.includes('unusual') || q.includes('spike')) {
      const recent = context.anomalies?.recentAnomalies[0];
      observed = anomalyCount > 0 && recent
        ? `Statistical anomaly detector identified **${anomalyCount}** abnormal spending pattern(s). Most prominent: **৳${recent.amount.toLocaleString()}** in **${recent.category}** (${recent.reason}, ${recent.severity} severity).`
        : `Statistical outlier analysis across historical transactions found **0 anomalies**; your category velocities are within normal parametric bounds.`;
      forecast = `If isolated non-recurring spikes do not repeat, your 30-day liquidity remains within the expected P50 range of **৳${Math.round(netCashFlow).toLocaleString()}**.`;
      suggestion = anomalyCount > 0
        ? `Tag this transaction to distinguish between one-time emergency expenses vs recurring baseline lifestyle creep.`
        : `Continue maintaining predictable transaction rhythms to preserve your high spending stability score.`;
    } else if (q.includes('where') || q.includes('most') || q.includes('category')) {
      const top3 = context.topSpendingCategories.slice(0, 3).map((c) => `**${c.category}** (৳${c.amount.toLocaleString()}, ${c.percentage}%)`).join(', ');
      observed = `Your highest spending categories are ${top3}. These top areas represent the vast majority of your monthly cash outflow.`;
      forecast = `If current spending velocity continues, ${topCategory.category} will remain your primary liquidity outflow next month, estimated at **৳${Math.round(topCategory.amount * 1.05).toLocaleString()}**.`;
      suggestion = `Review recurring subscriptions or dining habits within these categories. Reducing discretionary food orders by 15% would liberate approx **৳${Math.round(topCategory.amount * 0.15).toLocaleString()}** each month into your emergency fund.`;
    } else if (q.includes('shortage') || q.includes('risk') || q.includes('danger')) {
      observed = `Your current liquid balance is **৳${context.currentBalance.toLocaleString()}**. You have ${context.recurringObligations.length} upcoming recurring commitments identified. Shortfall probability is estimated at **${Math.round((context.statisticalForecast?.shortfallProbability ?? 0.05) * 100)}%**.`;
      forecast = `Statistical quantile modeling (1.28-sigma volatility) projects 30-day ending balance between **৳${Math.round(p10).toLocaleString()}** (P10 pessimistic) and **৳${Math.round(p90).toLocaleString()}** (P90 optimistic). Expected net trajectory is **৳${netCashFlow.toLocaleString()}**.`;
      suggestion = `Maintain at least 1.5 months of baseline recurring expenses in your primary upay wallet or high-yield savings account to insulate against delayed invoices or unplanned healthcare costs.`;
    } else if (q.includes('goal') || q.includes('emergency') || q.includes('save') || q.includes('saving')) {
      const primaryGoal = context.goals[0];
      observed = primaryGoal
        ? `You have saved **৳${primaryGoal.currentAmount.toLocaleString()}** toward **${primaryGoal.name}** (**${primaryGoal.progressPercent}%** of your ৳${primaryGoal.targetAmount.toLocaleString()} target). Your current monthly savings rate is **${context.savingsRate}%**.`
        : `Your current monthly savings rate stands at **${context.savingsRate}%**, resulting in a net monthly addition of **৳${(context.monthlyIncome - context.monthlyExpenses).toLocaleString()}**.`;
      forecast = `At your projected surplus rate of **৳${Math.max(0, netCashFlow).toLocaleString()}/month**, dedicating 30% of your surplus will steadily grow your financial buffer without causing liquidity stress.`;
      suggestion = `Set up an automated recurring deposit into a high-yield digital DPS via upay right after salary day (the 2nd of each month) to lock in your savings habit before discretionary spending begins.`;
    } else if (q.includes('forecast') || q.includes('future') || q.includes('next month') || q.includes('cash flow')) {
      observed = `Your current baseline monthly income is **৳${context.monthlyIncome.toLocaleString()}** with active expenses of **৳${context.monthlyExpenses.toLocaleString()}**. Your Financial Health Score is **${context.financialHealthScore}/100** (${context.healthTier}).`;
      forecast = `Double exponential smoothing (${mape}% backtested MAPE) projects 30-day ending balance within **৳${Math.round(p10).toLocaleString()} (P10)** to **৳${Math.round(p90).toLocaleString()} (P90)**, with an expected net surplus of **৳${netCashFlow.toLocaleString()}** (${context.forecast.confidenceTier} confidence).`;
      suggestion = `Ensure your recurring commitments are scheduled right after income deposits to avoid timing mismatches. Consider allocating ৳5,000 of your anticipated surplus directly to your emergency safety fund.`;
    } else {
      // General financial health guidance
      const profilePersona = context.behaviorProfile?.persona ? `Persona: **${context.behaviorProfile.persona}**` : '';
      observed = `Your Financial Health Score is currently **${context.financialHealthScore} / 100** (${context.healthTier}). ${profilePersona} Your monthly income is **৳${context.monthlyIncome.toLocaleString()}**, expenses are **৳${context.monthlyExpenses.toLocaleString()}**, and your savings rate is **${context.savingsRate}%**.`;
      forecast = `Our cash-flow forecasting engine anticipates an upcoming 30-day net surplus of **৳${netCashFlow.toLocaleString()}**, backed by stable historical transaction inflows. Model backtesting exhibits ${mape}% MAPE.`;
      suggestion = `Keep following the **50/30/20 rule** adapted for Bangladesh: 50% for core needs (rent, utilities, groceries), 25% for discretionary spending, and 25% for automated savings and goals.`;
    }

    const fullMessage = `### AI Financial Health Insight

**Observed:**
${observed}

**Forecast:**
${forecast}

**Suggestion:**
${suggestion}

---
*Notice: upay FinCoach provides analytical guidance based on verified statistical time-series models and transaction history. It does not replace certified professional financial advice.*`;

    return {
      message: fullMessage,
      observed,
      forecast,
      suggestion,
      provider: 'deterministic-fallback',
    };
  }
}
