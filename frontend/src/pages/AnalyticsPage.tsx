import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  PieChart as PieIcon,
  ShieldCheck,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SpendingPieChart } from '../components/charts/SpendingPieChart';
import { api } from '../api/client';
import { FinancialSummary, HealthScoreData } from '../types';
import { formatBDT, formatPercentage } from '../utils/formatters';

export const AnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScoreData | null>(null);
  const [spending, setSpending] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [sumRes, healthRes, spendRes, trendsRes] = await Promise.all([
          api.get<FinancialSummary>('/analytics/summary'),
          api.get<HealthScoreData>('/analytics/health-score'),
          api.get<any[]>('/analytics/spending-breakdown'),
          api.get<any[]>('/analytics/trends'),
        ]);

        setSummary(sumRes);
        setHealthScore(healthRes);
        setSpending(spendRes);
        setTrends(trendsRes);
      } catch (e) {
        console.error('Failed to load analytics:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Evaluating multi-month financial analytics..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Financial Analytics & Intelligence
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Historical trend analysis, spending distribution, and transparent health indicators
        </p>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable>
          <div className="text-xs text-slate-400 mb-1">Monthly Inflow Growth</div>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">
            {formatPercentage(summary?.incomeGrowthRate)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">compared to previous month</p>
        </Card>

        <Card hoverable>
          <div className="text-xs text-slate-400 mb-1">Monthly Outflow Pace</div>
          <p className="text-2xl font-extrabold text-rose-400 font-mono">
            {formatPercentage(summary?.expenseGrowthRate)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">compared to previous month</p>
        </Card>

        <Card hoverable>
          <div className="text-xs text-slate-400 mb-1">Daily Average Spending</div>
          <p className="text-2xl font-extrabold text-white font-mono">
            {formatBDT(summary?.averageDailySpending)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">per day in current month</p>
        </Card>

        <Card hoverable>
          <div className="text-xs text-slate-400 mb-1">Active Savings Rate</div>
          <p className="text-2xl font-extrabold text-teal-300 font-mono">
            {summary?.monthlySavingsRate}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">target healthy rate: 20-25%</p>
        </Card>
      </div>

      {/* Monthly Inflow vs Outflow Trend Chart */}
      <Card>
        <CardHeader
          title="Monthly Income vs Outflow Trends"
          subtitle="Multi-month historical inflow, outflow, and net savings"
          icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
        />
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={trends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `৳${Math.round(val / 1000)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl glass-panel bg-slate-900/95 border border-slate-700 p-3 shadow-xl text-xs space-y-1">
                        <p className="font-semibold text-white mb-1.5">{label}</p>
                        {payload.map((entry: any, index: number) => (
                          <div key={index} className="flex justify-between gap-4">
                            <span style={{ color: entry.color }}>{entry.name}:</span>
                            <span className="font-mono font-semibold text-white">
                              {formatBDT(entry.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Bar dataKey="income" name="Income Inflow" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="Expense Outflow" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="netSavings" name="Net Savings" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Two Column: Category Distribution & Transparent Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader
            title="Spending Proportion by Category"
            subtitle="Current monthly expenditure share"
            icon={<PieIcon className="w-4 h-4 text-purple-400" />}
          />
          <SpendingPieChart data={spending} height={220} />
          <div className="mt-4 divide-y divide-slate-800/80">
            {spending.map((item) => (
              <div key={item.category} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color || '#3b82f6' }}
                  />
                  <span className="font-medium text-slate-200">{item.category}</span>
                  <span className="text-[10px] text-slate-500">
                    ({item.transactionCount} entries)
                  </span>
                </div>
                <div className="font-mono text-right">
                  <span className="font-semibold text-white">{formatBDT(item.amount)}</span>
                  <span className="text-slate-400 ml-2">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Health Score Methodology */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Health Score Methodology</h3>
                  <p className="text-xs text-slate-400">Documented, transparent components</p>
                </div>
              </div>
              <Badge variant="blue">{healthScore?.tier}</Badge>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Composite Score</span>
                <span className="text-4xl font-black text-white font-mono">
                  {healthScore?.score}
                </span>
                <span className="text-slate-400 font-bold text-sm"> / 100</span>
              </div>
              <p className="text-xs text-slate-300 max-w-xs text-right leading-relaxed">
                Reflects overall discipline, positive cash margin, and adherence to savings goals.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between font-semibold text-white mb-1">
                  <span>1. Savings Behavior (0 - 25 pts)</span>
                  <span className="text-emerald-400 font-mono">
                    {healthScore?.factors.savingsBehavior.score} / 25
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  {healthScore?.factors.savingsBehavior.description}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between font-semibold text-white mb-1">
                  <span>2. Budget Adherence (0 - 25 pts)</span>
                  <span className="text-blue-400 font-mono">
                    {healthScore?.factors.budgetAdherence.score} / 25
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  {healthScore?.factors.budgetAdherence.description}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between font-semibold text-white mb-1">
                  <span>3. Cash-Flow Stability (0 - 25 pts)</span>
                  <span className="text-teal-400 font-mono">
                    {healthScore?.factors.cashFlowStability.score} / 25
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  {healthScore?.factors.cashFlowStability.description}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between font-semibold text-white mb-1">
                  <span>4. Goal Progress (0 - 25 pts)</span>
                  <span className="text-purple-400 font-mono">
                    {healthScore?.factors.goalProgress.score} / 25
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  {healthScore?.factors.goalProgress.description}
                </p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-6 pt-3 border-t border-slate-800/80">
            {healthScore?.disclaimer}
          </p>
        </Card>
      </div>
    </div>
  );
};
