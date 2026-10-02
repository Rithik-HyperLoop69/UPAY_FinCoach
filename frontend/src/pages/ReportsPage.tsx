import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { api } from '../api/client';
import { FinancialSummary, HealthScoreData, ForecastResult } from '../types';
import { formatBDT, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScoreData | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [spending, setSpending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const [sumRes, healthRes, foreRes, spendRes] = await Promise.all([
          api.get<FinancialSummary>('/analytics/summary'),
          api.get<HealthScoreData>('/analytics/health-score'),
          api.get<ForecastResult>('/forecast'),
          api.get<any[]>('/analytics/spending-breakdown'),
        ]);

        setSummary(sumRes);
        setHealthScore(healthRes);
        setForecast(foreRes);
        setSpending(spendRes);
      } catch (e) {
        console.error('Failed to load report data:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <LoadingSpinner message="Generating executive financial health statement..." />;
  }

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto print:bg-white print:text-black">
      {/* Action Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Financial Health Statement
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Printable & exportable financial summary and cash-flow outlook
          </p>
        </div>

        <Button
          variant="upay"
          size="sm"
          onClick={handlePrint}
          leftIcon={<Printer className="w-4 h-4" />}
        >
          Print / Export PDF
        </Button>
      </div>

      {/* Printable Report Document */}
      <div className="rounded-3xl glass-panel bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 p-8 sm:p-10 space-y-8 shadow-2xl print:border-none print:shadow-none print:p-0 print:bg-white">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-2xl">
              ৳
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">upay FinCoach</h1>
              <p className="text-xs text-slate-400">Monthly Financial Health & Forecast Report</p>
            </div>
          </div>

          <div className="text-right text-xs">
            <p className="font-semibold text-white">{user?.fullName || 'Tanvir Ahmed'}</p>
            <p className="text-slate-400">{user?.email}</p>
            <p className="text-slate-400 font-mono mt-0.5">{currentDate}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div>
            <span className="text-slate-400 text-xs block">Health Score</span>
            <span className="text-2xl font-black text-white font-mono">{healthScore?.score}</span>
            <span className="text-xs text-emerald-400 font-semibold block mt-0.5">
              {healthScore?.tier}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-xs block">Monthly Inflow</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {formatBDT(summary?.monthlyIncome)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-xs block">Monthly Outflow</span>
            <span className="text-2xl font-black text-rose-400 font-mono">
              {formatBDT(summary?.monthlyExpenses)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-xs block">Savings Rate</span>
            <span className="text-2xl font-black text-teal-300 font-mono">
              {summary?.monthlySavingsRate}%
            </span>
          </div>
        </div>

        {/* Health Factors */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
            Health Indicator Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <span className="font-semibold text-white block mb-0.5">
                Savings Behavior: {healthScore?.factors.savingsBehavior.score}/25
              </span>
              <p className="text-slate-400">{healthScore?.factors.savingsBehavior.description}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <span className="font-semibold text-white block mb-0.5">
                Budget Adherence: {healthScore?.factors.budgetAdherence.score}/25
              </span>
              <p className="text-slate-400">{healthScore?.factors.budgetAdherence.description}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <span className="font-semibold text-white block mb-0.5">
                Cash-Flow Stability: {healthScore?.factors.cashFlowStability.score}/25
              </span>
              <p className="text-slate-400">{healthScore?.factors.cashFlowStability.description}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <span className="font-semibold text-white block mb-0.5">
                Goal Progress: {healthScore?.factors.goalProgress.score}/25
              </span>
              <p className="text-slate-400">{healthScore?.factors.goalProgress.description}</p>
            </div>
          </div>
        </div>

        {/* Top Spending Distribution */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
            Monthly Spending by Category
          </h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2">Category</th>
                <th className="py-2 text-center">Transactions</th>
                <th className="py-2 text-right">Amount (BDT)</th>
                <th className="py-2 text-right">Proportion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {spending.map((s) => (
                <tr key={s.category}>
                  <td className="py-2 font-medium text-white">{s.category}</td>
                  <td className="py-2 text-center text-slate-400">{s.transactionCount}</td>
                  <td className="py-2 text-right font-mono font-bold text-white">
                    {formatBDT(s.amount)}
                  </td>
                  <td className="py-2 text-right text-slate-400">{s.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 30-Day Forecast Outlook */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
            30-Day Cash Flow Projection Outlook
          </h3>
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs space-y-2 leading-relaxed">
            <p className="text-slate-300">
              Based on weighted historical inflows and detected recurring obligations, your net
              surplus for the upcoming month is projected at{' '}
              <strong className="text-teal-400 font-mono">
                +{formatBDT(forecast?.expectedMonthlyNet)}
              </strong>
              .
            </p>
            <p className="text-slate-400">
              {forecast?.recurringObligations.length} fixed commitments are scheduled, totaling ~
              {formatBDT(
                forecast?.recurringObligations.reduce((a, b) => a + b.expectedAmount, 0)
              )}
              .
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 leading-normal">
          <p>
            CONFIDENTIAL • Generated by upay FinCoach Prototype. This statement is for personal
            planning and educational purposes only. It does not replace professional auditing,
            tax, or investment services.
          </p>
        </div>
      </div>
    </div>
  );
};
