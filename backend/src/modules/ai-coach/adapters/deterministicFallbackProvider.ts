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

    let observed = '';
    let forecast = '';
    let suggestion = '';

    if (q.includes('spend') || q.includes('how much') || q.includes('expense')) {
      observed = `This month, your recorded expenses total **৳${context.monthlyExpenses.toLocaleString()}** across ${context.topSpendingCategories.length} tracked categories. Your top spending category is **${topCategory.category}**, accounting for **৳${topCategory.amount.toLocaleString()}** (${topCategory.percentage}% of all expenses).`;
      forecast = `Based on weighted historical trends, your expected baseline expenses for next month are projected at **৳${context.forecast.expectedMonthlyExpense.toLocaleString()}**, including ~৳${context.recurringObligations.reduce((a, b) => a + b.amount, 0).toLocaleString()} in fixed recurring obligations.`;
      suggestion = `Consider setting a strict budget cap on **${topCategory.category}** and discretionary dining to preserve at least **25%** of your monthly income for your savings reserves.`;
    } else if (q.includes('where') || q.includes('most') || q.includes('category')) {
      const top3 = context.topSpendingCategories.slice(0, 3).map((c) => `**${c.category}** (৳${c.amount.toLocaleString()}, ${c.percentage}%)`).join(', ');
      observed = `Your highest spending categories are ${top3}. These top areas represent the vast majority of your monthly cash outflow.`;
      forecast = `If current spending velocity continues, ${topCategory.category} will remain your primary liquidity outflow next month, estimated at **৳${Math.round(topCategory.amount * 1.05).toLocaleString()}**.`;
      suggestion = `Review recurring subscriptions or dining habits within these categories. Reducing discretionary food orders by 15% would liberate approx **৳${Math.round(topCategory.amount * 0.15).toLocaleString()}** each month into your emergency fund.`;
    } else if (q.includes('shortage') || q.includes('risk') || q.includes('danger')) {
      observed = `Your current liquid balance is **৳${context.currentBalance.toLocaleString()}**. You have ${context.recurringObligations.length} upcoming recurring commitments identified.`;
      forecast = nextBill
        ? `Upcoming commitment **${nextBill.name}** (৳${nextBill.amount.toLocaleString()}) is scheduled for **${nextBill.nextExpectedDate}**. The 30-day forecast anticipates net liquidity of **৳${netCashFlow.toLocaleString()}**, indicating manageable liquidity provided unexpected one-off outflows do not occur.`
        : `Your 30-day forecast projects an expected net cash surplus of **৳${netCashFlow.toLocaleString()}**.`;
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
      forecast = `For next month, our deterministic weighted forecasting engine estimates incoming cash flow of **৳${context.forecast.expectedMonthlyIncome.toLocaleString()}** and expected outflows of **৳${context.forecast.expectedMonthlyExpense.toLocaleString()}**, yielding a projected net surplus of **৳${netCashFlow.toLocaleString()}** (${context.forecast.confidenceTier} confidence).`;
      suggestion = `Ensure your recurring commitments are scheduled right after income deposits to avoid timing mismatches. Consider allocating ৳5,000 of your anticipated surplus directly to your emergency safety fund.`;
    } else {
      // General financial health guidance
      observed = `Your Financial Health Score is currently **${context.financialHealthScore} / 100** (${context.healthTier}). Your monthly income is **৳${context.monthlyIncome.toLocaleString()}**, expenses are **৳${context.monthlyExpenses.toLocaleString()}**, and your savings rate is **${context.savingsRate}%**.`;
      forecast = `Our cash-flow forecasting engine anticipates an upcoming 30-day net surplus of **৳${netCashFlow.toLocaleString()}**, backed by stable historical transaction inflows.`;
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
*Notice: upay FinCoach provides analytical guidance based on your observed transaction patterns. It does not replace certified professional financial advice.*`;

    return {
      message: fullMessage,
      observed,
      forecast,
      suggestion,
      provider: 'deterministic-fallback',
    };
  }
}
