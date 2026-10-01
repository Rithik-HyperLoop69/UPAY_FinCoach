import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { api } from '../api/client';
import { SavingsGoal } from '../types';
import { formatBDT, formatDate } from '../utils/formatters';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('5000');

  // New Goal form
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [category, setCategory] = useState('Emergency');
  const [notes, setNotes] = useState('');

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<SavingsGoal[]>('/goals');
      setGoals(res);
    } catch (e) {
      console.error('Failed to load goals:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/goals', {
        name: goalName,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0,
        category,
        notes,
      });
      setIsCreateModalOpen(false);
      setGoalName('');
      setTargetAmount('');
      setCurrentAmount('0');
      loadGoals();
    } catch (e) {
      alert('Failed to create goal');
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal) return;
    try {
      await api.post(`/goals/${depositModalGoal.id}/deposit`, {
        amount: parseFloat(depositAmount),
      });
      setDepositModalGoal(null);
      loadGoals();
    } catch (e) {
      alert('Deposit failed');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to remove this savings goal?')) return;
    try {
      await api.del(`/goals/${id}`);
      loadGoals();
    } catch (e) {
      alert('Failed to delete goal');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Evaluating savings targets & DPS progress..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Savings Goals & Digital DPS</h2>
          <p className="text-xs text-slate-400 mt-1">
            Build resilience with emergency cushions and automated upay savings schemes
          </p>
        </div>

        <Button
          variant="upay"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create New Target
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <Card key={goal.id} className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant={goal.isCompleted ? 'emerald' : 'blue'} size="sm">
                    {goal.category}
                  </Badge>
                  <h3 className="font-bold text-base text-white mt-1.5">{goal.name}</h3>
                </div>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                  title="Remove goal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress percentage */}
              <div className="mt-4 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-white font-mono">
                    {formatBDT(goal.currentAmount)}
                  </span>
                  <span className="text-xs font-mono font-bold text-teal-400">
                    {goal.progressPercent}% achieved
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      goal.isCompleted
                        ? 'bg-emerald-400'
                        : 'bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-slate-400 pt-1">
                  <span>Target: {formatBDT(goal.targetAmount)}</span>
                  <span>Remaining: {formatBDT(goal.remainingAmount)}</span>
                </div>
              </div>

              {/* Estimated Completion Date Notice */}
              <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  Estimated Completion:
                </div>
                <p className="text-[11px] text-slate-400">
                  {goal.isCompleted
                    ? '🎉 Target reached! Funds are secured.'
                    : goal.estimatedCompletionDate
                    ? `On track for ${formatDate(goal.estimatedCompletionDate)} (~${goal.estimatedMonthsRemaining} months based on recent net savings).`
                    : 'Requires active monthly savings contributions.'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => setDepositModalGoal(goal)}
                leftIcon={<ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />}
              >
                Deposit Funds
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Goal Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Establish New Savings Target"
        subtitle="Set up a dedicated fund or upay Digital DPS"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Target Goal Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Emergency Cushion, Umrah Tour, Tech Setup"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Amount (৳) *
              </label>
              <input
                type="number"
                placeholder="e.g. 100000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Starting Amount (৳)
              </label>
              <input
                type="number"
                placeholder="e.g. 10000"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="Emergency">Emergency Cushion</option>
              <option value="Tech & Career">Tech & Career Development</option>
              <option value="Travel">Travel & Rejuvenation</option>
              <option value="Family">Family Support</option>
              <option value="Investment">Investment & Real Estate</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="upay" size="sm">
              Save Target
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deposit to Goal Modal */}
      {depositModalGoal && (
        <Modal
          isOpen={true}
          onClose={() => setDepositModalGoal(null)}
          title={`Deposit Funds to "${depositModalGoal.name}"`}
          subtitle="Simulate transfer from upay Wallet to savings reserve"
        >
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Deposit Amount (BDT ৳) *
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-base focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
              Transfer source: <strong>upay High-Yield Digital DPS Wallet</strong>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDepositModalGoal(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="upay" size="sm">
                Confirm Deposit
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
