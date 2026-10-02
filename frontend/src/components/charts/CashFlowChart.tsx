import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatBDT } from '../../utils/formatters';

interface CashFlowChartProps {
  data: {
    date: string;
    dayLabel?: string;
    income?: number;
    expense?: number;
    balance?: number;
    projectedIncome?: number;
    projectedExpense?: number;
    projectedBalance?: number;
  }[];
  height?: number;
  showForecastStyle?: boolean;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({
  data,
  height = 300,
  showForecastStyle = false,
}) => {
  const chartData = data.map((d) => ({
    label: d.dayLabel || d.date,
    income: d.income ?? d.projectedIncome ?? 0,
    expense: d.expense ?? d.projectedExpense ?? 0,
    balance: d.balance ?? d.projectedBalance ?? 0,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl glass-panel bg-slate-900/95 border border-slate-700 p-3 shadow-xl text-xs space-y-1">
          <p className="font-semibold text-white mb-1.5">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-semibold text-slate-100">
                {formatBDT(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `৳${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'rgba(255, 255, 255, 0.15)', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            name="Projected Balance"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorBalance)"
          />
          <Area
            type="monotone"
            dataKey="income"
            name="Inflow (Income)"
            stroke="#10b981"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#colorIncome)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            name="Outflow (Expense)"
            stroke="#f43f5e"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#colorExpense)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
