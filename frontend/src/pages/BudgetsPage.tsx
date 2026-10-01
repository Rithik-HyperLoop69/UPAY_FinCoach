import React, { useState, useEffect } from 'react';
import {
  PieChart as PieIcon,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { api } from '../api/client';
import { Budget } from '../types';
import { formatBDT } from '../utils/formatters';

export const BudgetsPage: React.FC = () => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form state
  const [totalLimit, setTotalLimit] = useState<string>('52000');
  const [items, setItems] = useState<{ category: string; limitAmount: string }[]>([
    { category: 'Rent & Housing', limitAmount: '22000' },
    { category: 'Food & Groceries', limitAmount: '13000' },
    { category: 'Transportation & Fuel', limitAmount: '5000' },
    { category: 'Dining Out & Cafes', limitAmount: '4000' },
    { category: 'Bills & Utilities', limitAmount: '5000' },
    { category: 'Entertainment & Subs', limitAmount: '3000' },
  ]);

  const loadBudget = async (monthStr: string) => {
    setIsLoading(true);
    try {
      const res = await api.get<Budget>(`/budgets?month=${monthStr}`);
      setBudget(res);
      if (res) {
        setTotalLimit(res.totalLimit.toString());
        setItems(
          res.items.map((i) => ({
            category: i.category,
            limitAmount: i.limitAmount.toString(),
          }))
        );
      }
    } catch (e) {
      console.error('Failed to load budget:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBudget(selectedMonth);
  }, [selectedMonth]);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedItems = items
        .filter((i) => parseFloat(i.limitAmount) > 0)
        .map((i) => ({
          category: i.category,
          limitAmount: parseFloat(i.limitAmount),
        }));

      await api.post('/budgets', {
        month: selectedMonth,
        totalLimit: parseFloat(totalLimit) || 50000,
        items: formattedItems,
      });

      setIsEditModalOpen(false);
      loadBudget(selectedMonth);
    } catch (e) {
      alert('Failed to save budget');
    }
  };

  const getStatusBadge = (status: string, percentage: number) => {
    if (status === 'EXCEEDED' || percentage >= 100) {
      return <Badge variant="rose">100%+ Exceeded</Badge>;
    }
    if (status === 'CRITICAL' || percentage >= 90) {
      return <Badge variant="rose">90%+ Critical</Badge>;
    }
    if (status === 'WARNING' || percentage >= 75) {
      return <Badge variant="amber">75%+ Warning</Badge>;
    }
    if (status === 'MODERATE' || percentage >= 50) {
      return <Badge variant="blue">50%+ Used</Badge>;
    }
    return <Badge variant="emerald">Safe</Badge>;
  };

  if (isLoading) {
    return <LoadingSpinner message="Calculating budget utilization & category limits..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Monthly Budget Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Track spending against limits and avoid month-end cash shortages
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
          />

          <Button
            variant="upay"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Adjust Budget
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {budget ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card hoverable>
            <div className="text-xs text-slate-400 mb-1">Total Monthly Budget Limit</div>
            <p className="text-3xl font-extrabold text-white font-mono">
              {formatBDT(budget.totalLimit)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Target spending ceiling</p>
          </Card>

          <Card hoverable>
            <div className="text-xs text-slate-400 mb-1">Total Amount Spent</div>
            <p className="text-3xl font-extrabold text-rose-400 font-mono">
              {formatBDT(budget.totalSpent)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono font-bold text-white">
                {budget.totalPercentage}%
              </span>
              <span className="text-[11px] text-slate-400">utilized</span>
            </div>
          </Card>

          <Card hoverable>
            <div className="text-xs text-slate-400 mb-1">Remaining Safe Spending</div>
            <p className="text-3xl font-extrabold text-emerald-400 font-mono">
              {formatBDT(budget.totalRemaining)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Available for remainder of month</p>
          </Card>
        </div>
      ) : (
        <Card className="text-center p-8">
          <p className="text-white font-semibold">No budget established for {selectedMonth}</p>
          <Button
            variant="upay"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="mt-3"
          >
            Create {selectedMonth} Budget Plan
          </Button>
        </Card>
      )}

      {/* Category Budget Items Grid */}
      {budget && budget.items.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Category Utilization & Alerts</h3>
            <span className="text-xs text-slate-400">{budget.items.length} categories monitored</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budget.items.map((item) => (
              <Card key={item.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{item.category}</span>
                  {getStatusBadge(item.status, item.percentageUsed)}
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.percentageUsed >= 100
                        ? 'bg-rose-500'
                        : item.percentageUsed >= 90
                        ? 'bg-rose-400'
                        : item.percentageUsed >= 75
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, item.percentageUsed)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Spent: <strong className="text-white">{formatBDT(item.actualAmount)}</strong> (
                    {item.percentageUsed}%)
                  </span>
                  <span>
                    Limit: <strong className="text-slate-300">{formatBDT(item.limitAmount)}</strong>
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Remaining headroom:</span>
                  <span
                    className={`font-mono font-semibold ${
                      item.remainingAmount === 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {formatBDT(item.remainingAmount)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Adjust Budget Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Configure Budget for ${selectedMonth}`}
        subtitle="Establish monthly ceilings to prevent cash shortages"
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Overall Total Budget Limit (BDT ৳) *
            </label>
            <input
              type="number"
              value={totalLimit}
              onChange={(e) => setTotalLimit(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-slate-300">
              Category Limits (BDT ৳)
            </label>

            {items.map((item, index) => (
              <div key={item.category} className="flex items-center gap-3">
                <span className="text-xs text-slate-300 w-44 truncate">{item.category}</span>
                <input
                  type="number"
                  value={item.limitAmount}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].limitAmount = e.target.value;
                    setItems(newItems);
                  }}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="upay" size="sm">
              Save Budget Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
