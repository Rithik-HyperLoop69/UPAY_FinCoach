import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api } from '../../api/client';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [type, setType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food & Groceries');
  const [description, setDescription] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('upay');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringFrequency, setRecurringFrequency] = useState<string>('MONTHLY');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const categoriesByType = {
    EXPENSE: [
      'Food & Groceries',
      'Dining Out & Cafes',
      'Rent & Housing',
      'Transportation & Fuel',
      'Bills & Utilities',
      'Internet & Mobile',
      'Entertainment & Subs',
      'Healthcare & Pharmacy',
      'Family & Transfers',
      'Other',
    ],
    INCOME: ['Salary', 'Freelance & Consulting', 'Investment Returns', 'Bonus & Gifts', 'Other'],
    TRANSFER: ['Savings & DPS', 'Bank Transfer', 'Wallet Transfer'],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please provide a valid transaction amount.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.post('/transactions', {
        type,
        amount: parseFloat(amount),
        category,
        description: description.trim(),
        date: new Date().toISOString(),
        merchant: merchant.trim() || undefined,
        paymentMethod,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
      });

      // Reset form
      setAmount('');
      setDescription('');
      setMerchant('');
      setIsRecurring(false);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to record transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Financial Transaction" subtitle="Simulate upay wallet, banking, or cash movement">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            {error}
          </div>
        )}

        {/* Type Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
          {(['EXPENSE', 'INCOME', 'TRANSFER'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCategory(categoriesByType[t][0]);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === t
                  ? t === 'EXPENSE'
                    ? 'bg-rose-600 text-white shadow'
                    : t === 'INCOME'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Amount (BDT ৳) *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold">
              ৳
            </span>
            <input
              type="number"
              step="any"
              placeholder="e.g. 1500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm font-semibold"
              required
            />
          </div>
        </div>

        {/* Description & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 text-xs"
            >
              {categoriesByType[type].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 text-xs"
            >
              <option value="upay">upay (Simulated MFS)</option>
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Bank">Bank Transfer (BEFTN/NPSB)</option>
              <option value="Card">Credit/Debit Card</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Description *
          </label>
          <input
            type="text"
            placeholder="e.g. Weekly grocery refill or Client consultation"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
            required
          />
        </div>

        {/* Merchant / Vendor */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Merchant / Counterparty (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Shwapno, DESCO, Pathao, Employer"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
          />
        </div>

        {/* Recurring Toggle */}
        <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-300 font-medium">
              Mark as Regular Recurring Obligation (Bill / Rent / Sub)
            </span>
          </label>

          {isRecurring && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Frequency:</span>
              <select
                value={recurringFrequency}
                onChange={(e) => setRecurringFrequency(e.target.value)}
                className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="DAILY">Daily</option>
              </select>
            </div>
          )}
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="upay" size="sm" isLoading={isLoading}>
            Record & Sync
          </Button>
        </div>
      </form>
    </Modal>
  );
};
