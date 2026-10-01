import React, { useState, useEffect } from 'react';
import {
  LineChart as LineChartIcon,
  AlertTriangle,
  Calendar,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { CashFlowChart } from '../components/charts/CashFlowChart';
import { api } from '../api/client';
import { ForecastResult, ForecastPoint } from '../types';
import { formatBDT, formatDate } from '../utils/formatters';

export const ForecastPage: React.FC = () => {
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [horizon, setHorizon] = useState<'7D' | '30D' | '90D'>('30D');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadForecast = async () => {
    try {
      const res = await api.get<ForecastResult>('/forecast');
      setForecast(res);
    } catch (e) {
      console.error('Failed to load forecast:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, []);

  const handleRecalculate = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.post<ForecastResult>('/forecast/generate');
      setForecast(res);
    } catch (e) {
      console.error('Recalculate failed:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Calculating deterministic cash-flow projections..." />;
  }

  const activePoints: ForecastPoint[] =
    horizon === '7D'
      ? forecast?.sevenDays.points || []
      : horizon === '30D'
      ? forecast?.thirtyDays.points || []
      : forecast?.ninetyDays.points || [];

  const endingBalance =
    horizon === '7D'
      ? forecast?.sevenDays.endingBalance
      : horizon === '30D'
      ? forecast?.thirtyDays.endingBalance
      : forecast?.ninetyDays.endingBalance;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Cash-Flow Forecaster</h2>
            <Badge variant="blue">{forecast?.confidenceTier} Confidence</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explainable projections based on weighted historical averages & recurring obligations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Recompute Projections
          </Button>
        </div>
      </div>

      {/* Projection Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable>
          <div className="text-xs text-slate-400 mb-1">Current Liquid Balance</div>
          <p className="text-2xl font-extrabold text-white font-mono">
            {formatBDT(forecast?.currentBalance)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Starting baseline</p>
        </Card>

        <Card hoverable>
          <div className="text-xs text-slate-400 mb-1">Expected Monthly Inflow</div>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">
            {formatBDT(forecast?.expectedMonthlyIncome)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Weighted historical average</p>
        </Card>

        <Card hoverable>
          <div className="text-xs text-slate-400 mb-1">Expected Monthly Outflow</div>
          <p className="text-2xl font-extrabold text-rose-400 font-mono">
            {formatBDT(forecast?.expectedMonthlyExpense)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Fixed commitments + discretionary</p>
        </Card>

        <Card hoverable>
          <div className="text-xs text-slate-400 mb-1">Projected Horizon Ending</div>
          <p className="text-2xl font-extrabold text-teal-300 font-mono">
            {formatBDT(endingBalance)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">after {horizon} cash movement</p>
        </Card>
      </div>

      {/* Cash Flow Risk Alerts */}
      {forecast?.identifiedRisks && forecast.identifiedRisks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Detected Cash-Flow Risk Indicators
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forecast.identifiedRisks.map((risk) => (
              <div
                key={risk.id}
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  risk.severity === 'CRITICAL'
                    ? 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                    : risk.severity === 'WARNING'
                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                    : 'bg-blue-500/10 border-blue-500/25 text-blue-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    {risk.title}
                  </span>
                  <Badge
                    variant={
                      risk.severity === 'CRITICAL'
                        ? 'rose'
                        : risk.severity === 'WARNING'
                        ? 'amber'
                        : 'blue'
                    }
                    size="sm"
                  >
                    {risk.severity}
                  </Badge>
                </div>

                <p className="text-slate-200 leading-relaxed">{risk.message}</p>

                <div className="pt-2 border-t border-slate-700/60 flex items-start gap-1.5 text-slate-300">
                  <span className="font-semibold text-white shrink-0">Recommendation:</span>
                  <span>{risk.actionRecommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Interactive Forecast Chart */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white text-base">Projected Balance & Liquidity Curve</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulating cash inflows (salary, freelance) and outflows (bills, rent, everyday spending)
            </p>
          </div>

          <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
            {(['7D', '30D', '90D'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
                  horizon === h
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {h === '7D' ? 'Next 7 Days' : h === '30D' ? 'Next 30 Days' : 'Next 90 Days'}
              </button>
            ))}
          </div>
        </div>

        <CashFlowChart data={activePoints} height={320} showForecastStyle />

        {/* Forecast Assumptions Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Explainable Baseline Assumptions:
          </p>
          <ul className="text-xs text-slate-400 space-y-1">
            {forecast?.assumptions.map((asm, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {asm}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Two Column: Recurring Obligations & Timeline Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identified Recurring Obligations (1 col) */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="Detected Recurring Bills"
            subtitle="Auto-detected monthly commitments"
            icon={<Clock className="w-4 h-4 text-teal-400" />}
          />

          <div className="space-y-3">
            {forecast?.recurringObligations.map((bill) => (
              <div
                key={bill.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-white">{bill.name}</p>
                  <p className="text-[11px] text-slate-400">
                    Next Due: {formatDate(bill.nextExpectedDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-rose-400">
                    {formatBDT(bill.expectedAmount)}
                  </p>
                  <Badge variant="slate" size="sm">
                    {Math.round(bill.confidence * 100)}% match
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Projection Timeline Table (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Detailed Forecast Timeline"
            subtitle={`Milestones for the ${horizon} projection window`}
            icon={<Calendar className="w-4 h-4 text-purple-400" />}
          />

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold sticky top-0 bg-slate-900 z-10">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Projected Inflow</th>
                  <th className="py-2.5 px-3">Projected Outflow</th>
                  <th className="py-2.5 px-3">Net Impact</th>
                  <th className="py-2.5 px-3 text-right">Projected Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activePoints.map((point) => (
                  <tr key={point.date} className="hover:bg-slate-900/50">
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-white">{point.dayLabel}</span>
                      {point.scheduledEvents.length > 0 && (
                        <div className="text-[10px] text-teal-300 font-medium">
                          {point.scheduledEvents[0]}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-mono">
                      {point.projectedIncome > 0 ? `+${formatBDT(point.projectedIncome)}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-rose-400 font-mono">
                      -{formatBDT(point.projectedExpense)}
                    </td>
                    <td
                      className={`py-2.5 px-3 font-mono font-medium ${
                        point.projectedNet >= 0 ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {point.projectedNet >= 0 ? `+${formatBDT(point.projectedNet)}` : formatBDT(point.projectedNet)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                      {formatBDT(point.projectedBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
