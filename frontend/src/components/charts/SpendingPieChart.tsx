import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { formatBDT } from '../../utils/formatters';

interface SpendingPieChartProps {
  data: {
    category: string;
    amount: number;
    percentage: number;
    color?: string;
  }[];
  height?: number;
}

export const SpendingPieChart: React.FC<SpendingPieChartProps> = ({
  data,
  height = 260,
}) => {
  const defaultColors = [
    '#f43f5e',
    '#3b82f6',
    '#f59e0b',
    '#10b981',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#64748b',
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-xl glass-panel bg-slate-900/95 border border-slate-700 p-2.5 shadow-xl text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color || '#3b82f6' }}
            />
            <span className="font-semibold text-white">{item.category}</span>
          </div>
          <p className="font-mono text-slate-300">
            {formatBDT(item.amount)} ({item.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="amount"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || defaultColors[index % defaultColors.length]}
                stroke="#0f172a"
                strokeWidth={2}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
