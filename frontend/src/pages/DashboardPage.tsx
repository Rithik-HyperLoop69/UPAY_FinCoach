import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Zap,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import TiltedCard from '../components/ui/TiltedCard';
import BorderGlow from '../components/ui/BorderGlow';
import { CashFlowChart } from '../components/charts/CashFlowChart';
import { SpendingPieChart } from '../components/charts/SpendingPieChart';
import { ModelCardsModal } from '../components/ModelCardsModal';
import { api } from '../api/client';
import {
  FinancialSummary,
  HealthScoreData,
  ForecastResult,
  AlertItem,
  SavingsGoal,
  DetectedAnomaly,
  UserBehaviorProfile,
} from '../types';
import { formatBDT, formatPercentage } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScoreData | null>(null);
  const [spending, setSpending] = useState<any[]>([]);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [anomalies, setAnomalies] = useState<DetectedAnomaly[]>([]);
  const [behaviorProfile, setBehaviorProfile] = useState<UserBehaviorProfile | null>(null);
  const [showModelCards, setShowModelCards] = useState<boolean>(false);
  const [horizon, setHorizon] = useState<'7D' | '30D' | '90D'>('30D');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const handleSyncWallet = async () => {
    setIsSyncing(true);
    setSyncNotice(null);
    try {
      const res = await api.post<{ syncedCount: number; message: string }>('/transactions/upay/sync');
      setSyncNotice(res.message);
      await loadDashboardData();
      setTimeout(() => setSyncNotice(null), 5000);
    } catch {
      setSyncNotice('Failed to sync wallet data.');
    } finally {
      setIsSyncing(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [sumRes, healthRes, spendRes, foreRes, goalsRes, anomRes, profileRes] = await Promise.all([
        api.get<FinancialSummary>('/analytics/summary'),
        api.get<HealthScoreData>('/analytics/health-score'),
        api.get<any[]>('/analytics/spending-breakdown'),
        api.get<ForecastResult>('/forecast'),
        api.get<SavingsGoal[]>('/goals'),
        api.get<DetectedAnomaly[]>('/analytics/anomalies').catch(() => []),
        api.get<UserBehaviorProfile>('/analytics/behavior-profile').catch(() => null),
      ]);

      setSummary(sumRes);
      setHealthScore(healthRes);
      setSpending(spendRes);
      setForecast(foreRes);
      setGoals(goalsRes);
      if (Array.isArray(anomRes)) setAnomalies(anomRes);
      if (profileRes) setBehaviorProfile(profileRes);

      // Check alerts
      const alertsRes = await api.get<AlertItem[]>('/alerts').catch(() => []);
      setAlerts(alertsRes.filter((a) => !a.isRead));
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Listen for transaction created event
    const handleTxCreated = () => loadDashboardData();
    window.addEventListener('transaction-created', handleTxCreated);
    return () => window.removeEventListener('transaction-created', handleTxCreated);
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Analyzing real-time financial health and forecasting cash flow..." />;
  }

  const chartPoints =
    horizon === '7D'
      ? forecast?.sevenDays.points || []
      : horizon === '30D'
      ? forecast?.thirtyDays.points || []
      : forecast?.ninetyDays.points || [];

  return (
    <div className="space-y-6">
        {/* Welcome Banner */}
        <TiltedCard
          containerWidth="100%"
          containerHeight="auto"
          imageWidth="100%"
          imageHeight="auto"
          rotateAmplitude={4}
          scaleOnHover={1.012}
          showMobileWarning={false}
          showTooltip={false}
          className="w-full"
        >
          <BorderGlow
            edgeSensitivity={30}
            glowColor="195 90 65"
            backgroundColor="#0b0f19"
            borderRadius={24}
            glowRadius={36}
            glowIntensity={1.2}
            coneSpread={28}
            animated={true}
            colors={['#38bdf8', '#818cf8', '#2dd4bf']}
            fillOpacity={0.35}
            className="w-full shadow-2xl"
          >
            <div className="p-6 lg:p-8">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Personalized Financial Intelligence
                    </span>
                    {user?.upayConnected && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        upay Connected
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                    Good day, {user?.fullName || 'Tanvir'}!
                  </h2>
                  <p className="text-sm text-slate-300 mt-1 max-w-xl">
                    Your cash-flow outlook is looking{' '}
                    <span className="text-emerald-400 font-semibold">stable with a projected surplus</span>.
                    Review your upcoming recurring obligations and AI coach guidance below.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setShowModelCards(true)}
                    leftIcon={<Cpu className="w-4 h-4 text-emerald-400" />}
                    className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 cursor-pointer"
                  >
                    Model Specs & ML
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleSyncWallet}
                    isLoading={isSyncing}
                    leftIcon={<Zap className="w-4 h-4 text-teal-400" />}
                    className="border-teal-500/40 text-teal-300 hover:bg-teal-950/40 cursor-pointer"
                  >
                    Sync upay
                  </Button>

                  <Button
                    variant="upay"
                    size="md"
                    onClick={() => navigate('/coach')}
                    leftIcon={<Sparkles className="w-4 h-4 text-teal-300" />}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Consult AI Coach
                  </Button>
                </div>
              </div>
            </div>
          </BorderGlow>
        </TiltedCard>

        {/* Statistical Anomalies Alert Banner */}
        {anomalies.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-100 text-sm">
                    {anomalies.length} Unusual Spending Outlier{anomalies.length > 1 ? 's' : ''} Detected
                  </span>
                  <Badge variant="amber" size="sm">Z-Score & Tukey Filter</Badge>
                </div>
                <p className="text-slate-300 mt-0.5">
                  Top outlier: {anomalies[0].category} ({formatBDT(anomalies[0].amount)}) — {anomalies[0].explanation}.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/analytics')}
              className="border-amber-500/40 text-amber-300 hover:bg-amber-950/40 shrink-0"
            >
              Inspect Outliers
            </Button>
          </div>
        )}

        {/* Sync Notification Banner */}
        {syncNotice && (
          <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-200 text-xs flex items-center justify-between shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{syncNotice}</span>
            </div>
            <button
              onClick={() => setSyncNotice(null)}
              className="text-[11px] text-teal-400 hover:text-white px-2 py-0.5 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Critical Risks / Active Alerts Banner */}
        {alerts.length > 0 && (
          <TiltedCard
            containerWidth="100%"
            containerHeight="auto"
            imageWidth="100%"
            imageHeight="auto"
            rotateAmplitude={4}
            scaleOnHover={1.01}
            showMobileWarning={false}
            showTooltip={false}
            className="w-full"
          >
            <div className="p-4 rounded-2xl liquid-glass liquid-glass-hover border-amber-500/35 bg-amber-500/[0.08] flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-200">{alerts[0].title}</p>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">{alerts[0].message}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/alerts')}
                className="border-amber-500/40 text-amber-300 hover:bg-amber-950/40 shrink-0 text-xs py-1 px-3"
              >
                Details
              </Button>
            </div>
          </TiltedCard>
        )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Balance */}
        <Card hoverable className="relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Net Liquid Balance</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-mono">
            {formatBDT(summary?.currentBalance)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <span className="text-blue-400 font-semibold">Available</span>
            <span>across accounts & upay</span>
          </div>
        </Card>

        {/* Monthly Income */}
        <Card hoverable>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>This Month Inflow</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl lg:text-3xl font-extrabold text-emerald-400 tracking-tight font-mono">
            {formatBDT(summary?.monthlyIncome)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className="font-semibold text-emerald-400">
              {formatPercentage(summary?.incomeGrowthRate)}
            </span>
            <span className="text-slate-400">vs previous month</span>
          </div>
        </Card>

        {/* Monthly Expenses */}
        <Card hoverable>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>This Month Outflow</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl lg:text-3xl font-extrabold text-rose-400 tracking-tight font-mono">
            {formatBDT(summary?.monthlyExpenses)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className="font-semibold text-slate-300">
              ~{formatBDT(summary?.averageDailySpending)}/day
            </span>
            <span className="text-slate-400">average pace</span>
          </div>
        </Card>

        {/* Net Savings & Savings Rate */}
        <Card hoverable>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Monthly Net Savings</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl lg:text-3xl font-extrabold text-teal-300 tracking-tight font-mono">
            {formatBDT(summary?.monthlyNetSavings)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className="px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-300 font-bold font-mono">
              {summary?.monthlySavingsRate}% Rate
            </span>
            <span className="text-slate-400">target: 25%</span>
          </div>
        </Card>
      </div>

      {/* Second Row: Health Score & Forecast Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transparent Financial Health Score (1 col) */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Financial Health</h3>
              </div>
              <Badge
                variant={
                  healthScore?.tier === 'Excellent' || healthScore?.tier === 'Strong'
                    ? 'emerald'
                    : 'amber'
                }
              >
                {healthScore?.tier}
              </Badge>
            </div>

            {/* Score Big Display */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-black text-white font-mono tracking-tight">
                {healthScore?.score}
              </span>
              <span className="text-slate-400 text-lg font-bold">/ 100</span>
            </div>

            {/* 4 Documented Factors */}
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Savings Behavior</span>
                  <span className="font-mono text-emerald-400">
                    {healthScore?.factors.savingsBehavior.score}/25
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${((healthScore?.factors.savingsBehavior.score || 0) / 25) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Budget Adherence</span>
                  <span className="font-mono text-blue-400">
                    {healthScore?.factors.budgetAdherence.score}/25
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${((healthScore?.factors.budgetAdherence.score || 0) / 25) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Cash-Flow Stability</span>
                  <span className="font-mono text-teal-400">
                    {healthScore?.factors.cashFlowStability.score}/25
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${((healthScore?.factors.cashFlowStability.score || 0) / 25) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Goal Progress</span>
                  <span className="font-mono text-purple-400">
                    {healthScore?.factors.goalProgress.score}/25
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${((healthScore?.factors.goalProgress.score || 0) / 25) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-6 pt-4 border-t border-slate-800 leading-normal">
            Analytical indicator computed deterministically. Not certified financial advice.
          </p>
        </Card>

        {/* Cash Flow Forecast & Running Balance (2 cols) */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-white text-base">Cash-Flow Forecast Timeline</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Projected net liquidity with recurring obligations & discretionary daily rate
                </p>
              </div>

              {/* Horizon Toggle */}
              <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                {(['7D', '30D', '90D'] as const).map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorizon(h)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      horizon === h
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <CashFlowChart data={chartPoints} height={250} />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400">
                Confidence: <strong className="text-emerald-400">{forecast?.confidenceScore}%</strong> ({forecast?.confidenceTier})
              </span>
              {forecast?.modelMetrics && (
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px] font-mono">
                  Holt-Winters MAPE: {forecast.modelMetrics.mape}%
                </span>
              )}
              {forecast?.quantileBounds && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px]">
                  P10–P90: {formatBDT(forecast.quantileBounds.p10EndingBalance)} – {formatBDT(forecast.quantileBounds.p90EndingBalance)}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/forecast')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Full Forecast Analysis
            </Button>
          </div>
        </Card>
      </div>

      {/* Third Row: Spending Breakdown & AI Coach Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Breakdown (1 col) */}
        <Card>
          <CardHeader
            title="Spending Distribution"
            subtitle="Top monthly expense categories"
            icon={<TrendingDown className="w-4 h-4 text-rose-400" />}
          />
          <SpendingPieChart data={spending} height={210} />
          <div className="space-y-2 mt-3 pt-3 border-t border-slate-800/80 max-h-40 overflow-y-auto">
            {spending.slice(0, 4).map((item) => (
              <div key={item.category} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color || '#3b82f6' }}
                  />
                  {item.category}
                </span>
                <span className="font-mono font-medium text-slate-200">
                  {formatBDT(item.amount)} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Financial Coach Prompt Card (2 cols) */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">upay AI Financial Coach</h3>
                  <p className="text-xs text-slate-400">
                    Context-aware guidance grounded in your financial data
                  </p>
                </div>
              </div>
              <Badge variant="purple">AI Assistant Active</Badge>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 mb-4">
              <p className="text-xs font-semibold text-teal-300 mb-1">Coach Observation:</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                "Your projected 30-day surplus is <strong>৳{forecast?.expectedMonthlyNet.toLocaleString()}</strong>.
                Upcoming recurring bills in the next 7 days total ৳
                {forecast?.recurringObligations
                  .slice(0, 2)
                  .reduce((a, b) => a + b.expectedAmount, 0)
                  .toLocaleString()}
                . Allocating an extra ৳3,000 to your Emergency Cushion would accelerate your goal by 25
                days without liquidity risk."
              </p>
            </div>

            {/* Quick Prompt Chips */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Questions for Coach:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Where am I spending the most?',
                  'Can I save more next month?',
                  'What could cause a cash shortage?',
                  'How close am I to my savings goal?',
                ].map((promptText) => (
                  <button
                    key={promptText}
                    onClick={() => navigate('/coach', { state: { initialPrompt: promptText } })}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-blue-600/30 border border-white/10 hover:border-blue-400/40 text-xs text-slate-200 hover:text-white transition-all text-left"
                  >
                    "{promptText}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Grounded exclusively in your sanitized financial snapshot
            </span>
            <Button
              variant="upay"
              size="sm"
              onClick={() => navigate('/coach')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Open Full AI Chat
            </Button>
          </div>
        </Card>
      </div>

      {/* Fourth Row: Savings Goals Preview */}
      <Card>
        <CardHeader
          title="Active Savings Targets & DPS"
          subtitle="Progress toward financial independence"
          icon={<Target className="w-4 h-4 text-emerald-400" />}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/goals')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-xs py-1 px-3"
            >
              Manage Goals
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all space-y-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-white">{goal.name}</span>
                <span className="text-xs font-mono font-bold text-teal-400">
                  {goal.progressPercent}%
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full"
                  style={{ width: `${goal.progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{formatBDT(goal.currentAmount)} saved</span>
                <span>Target: {formatBDT(goal.targetAmount)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <ModelCardsModal isOpen={showModelCards} onClose={() => setShowModelCards(false)} />
    </div>
  );
};
