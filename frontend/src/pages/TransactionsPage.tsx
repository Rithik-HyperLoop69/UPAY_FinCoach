import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Calendar,
  Trash2,
  Plus,
  RefreshCw,
  Zap,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AddTransactionModal } from '../components/transactions/AddTransactionModal';
import { UpaySmsModal } from '../components/transactions/UpaySmsModal';
import { api } from '../api/client';
import { Transaction } from '../types';
import { formatBDT, formatDate } from '../utils/formatters';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const loadTransactions = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get<{ transactions: Transaction[]; pagination: any }>('/transactions', {
        page,
        limit: 15,
        type: typeFilter || undefined,
        search: search.trim() || undefined,
      });
      setTransactions(res.transactions);
      setPagination(res.pagination);
    } catch (e) {
      console.error('Failed to load transactions:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions(1);
  }, [typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTransactions(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      await api.del(`/transactions/${id}`);
      loadTransactions(pagination.page);
    } catch (e) {
      alert('Failed to delete transaction');
    }
  };

  const handleSyncUpay = async () => {
    setIsSyncing(true);
    setSyncNotice(null);
    try {
      const res = await api.post<{ syncedCount: number; message: string }>('/transactions/upay/sync');
      setSyncNotice(res.message);
      await loadTransactions(1);
      window.dispatchEvent(new CustomEvent('transaction-created'));
      setTimeout(() => setSyncNotice(null), 6000);
    } catch (err: any) {
      setSyncNotice('Failed to sync with upay wallet.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Transaction Ledger</h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete record of inflows, outflows, and auto-tracked upay activities
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncUpay}
            isLoading={isSyncing}
            leftIcon={<Zap className="w-3.5 h-3.5 text-teal-400" />}
            className="border-teal-500/30 text-teal-300 hover:bg-teal-950/40"
          >
            Auto-Sync upay
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSmsModalOpen(true)}
            leftIcon={<MessageSquare className="w-3.5 h-3.5 text-sky-400" />}
            className="border-sky-500/30 text-sky-300 hover:bg-sky-950/40"
          >
            Paste SMS
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadTransactions(pagination.page)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="upay"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Record Transaction
          </Button>
        </div>
      </div>

      {/* Auto-Sync Notification Banner */}
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

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search merchant, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
            />
          </form>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { label: 'All Types', value: '' },
              { label: 'Expenses', value: 'EXPENSE' },
              { label: 'Income', value: 'INCOME' },
              { label: 'Transfers', value: 'TRANSFER' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setTypeFilter(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  typeFilter === tab.value
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Fetching transactions..." />
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <ArrowLeftRight className="w-10 h-10 mx-auto mb-3 opacity-30 text-blue-400" />
            <p className="font-semibold text-white">No transactions found</p>
            <p className="text-xs mt-1">Try adjusting your search criteria or record a new transaction.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Transaction / Merchant</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Channel / Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount (BDT)</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            tx.type === 'INCOME'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : tx.type === 'EXPENSE'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-blue-500/10 text-blue-400'
                          }`}
                        >
                          {tx.type === 'INCOME' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : tx.type === 'EXPENSE' ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowLeftRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs">{tx.description}</p>
                          <p className="text-[11px] text-slate-400">
                            {tx.merchant ? tx.merchant : tx.type}
                            {tx.isRecurring && (
                              <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">
                                Recurring
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-medium">{tx.category}</td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          tx.paymentMethod === 'upay'
                            ? 'blue'
                            : tx.paymentMethod === 'Bank'
                            ? 'purple'
                            : 'slate'
                        }
                        size="sm"
                      >
                        {tx.paymentMethod}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">{formatDate(tx.date)}</td>

                    <td
                      className={`py-3.5 px-4 text-right font-mono font-bold text-xs ${
                        tx.type === 'INCOME'
                          ? 'text-emerald-400'
                          : tx.type === 'EXPENSE'
                          ? 'text-rose-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : ''}
                      {formatBDT(tx.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {transactions.length} of {pagination.total} records
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => loadTransactions(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="font-semibold text-white px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadTransactions(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          loadTransactions(1);
        }}
      />

      <UpaySmsModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        onSuccess={(msg) => {
          setSyncNotice(msg);
          loadTransactions(1);
          window.dispatchEvent(new CustomEvent('transaction-created'));
          setTimeout(() => setSyncNotice(null), 6000);
        }}
      />
    </div>
  );
};
