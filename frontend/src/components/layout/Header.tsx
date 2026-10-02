import React, { useState } from 'react';
import { Menu, Bell, Sparkles, Plus, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
  onAddTransactionClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  title = 'Financial Dashboard',
  onAddTransactionClick,
}) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-slate-400 hover:text-white rounded-xl lg:hidden hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-xs text-slate-400 hidden sm:block">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Ask AI Coach */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/coach')}
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-teal-400" />}
          className="hidden sm:inline-flex border-blue-500/30 text-blue-300 hover:bg-blue-950/40"
        >
          Ask Coach
        </Button>

        {/* Quick Add Transaction */}
        {onAddTransactionClick && (
          <Button
            variant="upay"
            size="sm"
            onClick={onAddTransactionClick}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Record</span> Action
          </Button>
        )}

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel bg-slate-900/95 border border-slate-800 p-4 shadow-2xl z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Financial Notifications
                </span>
                <Link
                  to="/alerts"
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Emergency Cushion Milestone
                  </p>
                  <p className="text-slate-400 mt-1 text-[11px]">
                    Your Emergency Safety Cushion officially reached 56% milestone.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <p className="font-semibold text-amber-300">Dining Budget Notice</p>
                  <p className="text-slate-400 mt-1 text-[11px]">
                    Dining out spending is at 85% with 12 days remaining this month.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
