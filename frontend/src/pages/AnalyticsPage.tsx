import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  PieChart as PieIcon,
  ShieldCheck,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  Cpu,
  CheckCircle,
  Zap,
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
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SpendingPieChart } from '../components/charts/SpendingPieChart';
import { ModelCardsModal } from '../components/ModelCardsModal';
import { api } from '../api/client';
import { FinancialSummary, HealthScoreData, DetectedAnomaly, UserBehaviorProfile } from '../types';
import { formatBDT, formatPercentage } from '../utils/formatters';

export const AnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScoreData | null>(null);
  const [spending, setSpending] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<DetectedAnomaly[]>([]);
  const [behaviorProfile, setBehaviorProfile] = useState<UserBehaviorProfile | null>(null);
  const [showModelCards, setShowModelCards] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [sumRes, healthRes, spendRes, trendsRes, anomRes, profileRes] = await Promise.all([
          api.get<FinancialSummary>('/analytics/summary'),
          api.get<HealthScoreData>('/analytics/health-score'),
          api.get<any[]>('/analytics/spending-breakdown'),
          api.get<any[]>('/analytics/trends'),
          api.get<DetectedAnomaly[]>('/analytics/anomalies').catch(() => []),
          api.get<UserBehaviorProfile>('/analytics/behavior-profile').catch(() => null),
        ]);

        setSummary(sumRes);
        setHealthScore(healthRes);
        setSpending(spendRes);
        setTrends(trendsRes);
        if (Array.isArray(anomRes)) setAnomalies(anomRes);
        if (profileRes) setBehaviorProfile(profileRes);
      } catch (e) {
        console.error('Failed to load analytics:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Evaluating multi-month financial analytics & ML baselines..." />;
  }

  const pillarsList = healthScore?.pillars ? Object.values(healthScore.pillars) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Financial Analytics & Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Empirical multi-pillar health score, Tukey IQR anomaly detection, and cash velocity profiles
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowModelCards(true)}
          leftIcon={<Cpu className="w-3.5 h-3.5 text-emerald-400" />}
          className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 cursor-pointer"
        >
          Model Specs & ML Evaluation
        </Button>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable>
          <div className="text-xs text-slate-400 mb-1">Monthly Inflow Growth</div>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">
            {formatPercentage(summary?.incomeGrowthRate)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">relative to previous month</p>
        </Card>

        <Card hoverable>
          <div className="text-xs text-slate-400 mb-1">Expense Outflow Velocity</div>
          <p className="text-2xl font-extrabold text-rose-400 font-mono">
            {formatPercentage(summary?.expenseGrowthRate)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">burn expansion / contraction</p>
        </Card>

        <Card hoverable>
          <div className="text-xs text-slate-400 mb-1">Daily Discretionary Burn</div>
          <p className="text-2xl font-extrabold text-white font-mono">
            {formatBDT(summary?.averageDailySpending)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">average daily liquidity burn</p>
        </Card>

        <Card hoverable>
          <div className="text-xs text-slate-400 mb-1">Net Monthly Margin</div>
          <p className="text-2xl font-extrabold text-teal-300 font-mono">
            {formatBDT(summary?.monthlyNetSavings)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Savings Rate: <strong className="text-white">{summary?.monthlySavingsRate}%</strong>
          </p>
        </Card>
      </div>

      {/* Statistical Anomaly Detection Section */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Statistical Outlier & Anomaly Auditor</h3>
                <Badge variant={anomalies.length > 0 ? 'amber' : 'emerald'} size="sm">
                  {anomalies.length} {anomalies.length === 1 ? 'Outlier' : 'Outliers'} Flagged
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Hybrid Category Parametric Z-Score (z &gt; 2.2) + Non-parametric Tukey IQR (1.75x) + 7-Day Velocity Tracking
              </p>
            </div>
          </div>
        </div>

        {anomalies.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>All recorded transactions fall within standard parametric category variances. Zero anomalies detected.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {anomalies.map((a) => (
              <div
                key={a.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-500/30 text-xs space-y-2 hover:border-amber-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{a.category}</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-amber-300 font-bold">{formatBDT(a.amount)}</span>
                    <Badge variant={a.severity === 'CRITICAL' ? 'rose' : 'amber'} size="sm">
                      {a.severity}
                    </Badge>
                  </div>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{a.explanation}</p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-300 flex items-start gap-1">
                  <span className="text-slate-400 shrink-0">Remediation:</span>
                  <span>{a.actionAdvice}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Multi-Month Trends Bar Chart */}
      <Card>
        <CardHeader
          title="Multi-Month Income vs Expense Dynamic"
          subtitle="Chronological transaction velocity comparing earnings against total burn"
          icon={<Activity className="w-4 h-4 text-blue-400" />}
        />
        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: '11px',
                }}
                formatter={(v: any) => formatBDT(Number(v))}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(val) => <span className="text-xs text-slate-300 font-medium">{val}</span>}
              />
              <Bar dataKey="income" name="Inflow (Income)" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="Outflow (Expense)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Two Column Section: Category Distribution & 6-Pillar Health Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Category Breakdown */}
        <Card>
          <CardHeader
            title="Category Spending Distribution"
            subtitle="Breakdown of actual outflow by category"
            icon={<PieIcon className="w-4 h-4 text-teal-400" />}
          />
          <SpendingPieChart data={spending} height={220} />
          <div className="space-y-2 mt-4 max-h-56 overflow-y-auto">
            {spending.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 text-xs border border-slate-800/60"
              >
                <div className="flex items-center gap-2">
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

        {/* 6-Pillar Financial Wellness Engine */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">6-Pillar Financial Wellness Model</h3>
                  <p className="text-xs text-slate-400">MCDA behavioral assessment with factor attribution</p>
                </div>
              </div>
              <Badge variant="blue">{healthScore?.tier}</Badge>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Composite Wellness Index</span>
                <span className="text-4xl font-black text-white font-mono">
                  {healthScore?.score}
                </span>
                <span className="text-slate-400 font-bold text-sm"> / 100</span>
              </div>
              <div className="text-right text-xs">
                {behaviorProfile && (
                  <span className="text-emerald-400 font-semibold block">
                    Runway: {behaviorProfile.runwayMonths} months
                  </span>
                )}
                <span className="text-slate-400 text-[11px]">
                  Salary Window: {behaviorProfile?.typicalSalaryDays || '1st-5th'}
                </span>
              </div>
            </div>

            {/* Render 6 Pillars if available, else default factors */}
            <div className="space-y-3 text-xs max-h-72 overflow-y-auto pr-1">
              {pillarsList.length > 0 ? (
                pillarsList.map((p) => (
                  <div key={p.name} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between font-semibold text-white">
                      <span>{p.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-emerald-400">
                          {p.score}/{p.max}
                        </span>
                        <Badge
                          variant={
                            p.status === 'EXCELLENT'
                              ? 'emerald'
                              : p.status === 'HEALTHY'
                              ? 'blue'
                              : p.status === 'MODERATE'
                              ? 'amber'
                              : 'rose'
                          }
                          size="sm"
                        >
                          {p.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${(p.score / p.max) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">{p.impactExplanation}</p>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex justify-between font-semibold text-white mb-1">
                      <span>Savings Behavior</span>
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
                      <span>Budget Adherence</span>
                      <span className="text-blue-400 font-mono">
                        {healthScore?.factors.budgetAdherence.score} / 25
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      {healthScore?.factors.budgetAdherence.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-800/80">
            {healthScore?.disclaimer ||
              'upay FinCoach calculates behavioral health from verified historical transactions.'}
          </p>
        </Card>
      </div>

      <ModelCardsModal isOpen={showModelCards} onClose={() => setShowModelCards(false)} />
    </div>
  );
};
