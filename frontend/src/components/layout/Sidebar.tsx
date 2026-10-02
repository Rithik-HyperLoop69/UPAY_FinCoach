import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  LineChart,
  PieChart,
  Target,
  Sparkles,
  Bell,
  FileText,
  User,
  LogOut,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePageTransition } from '../../context/PageTransitionContext';
import { formatBDT } from '../../utils/formatters';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { playSquiggleTransition } = usePageTransition();
  const navigate = useNavigate();

  const handleLogout = () => {
    playSquiggleTransition(() => {
      logout(() => {
        navigate('/login');
      });
    });
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { label: 'Analytics', path: '/analytics', icon: TrendingUp },
    { label: 'Cash Flow Forecast', path: '/forecast', icon: LineChart },
    { label: 'Budgets', path: '/budgets', icon: PieChart },
    { label: 'Savings Goals', path: '/goals', icon: Target },
    { label: 'AI Financial Coach', path: '/coach', icon: Sparkles, badge: 'AI' },
    { label: 'Alerts', path: '/alerts', icon: Bell },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Profile & Settings', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/30">
              ৳
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">upay</span>
                <span className="font-semibold text-xs text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                  FinCoach
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">AI Cash-Flow Platform</p>
            </div>
          </NavLink>
        </div>

        {/* Upay Wallet Card Mini */}
        <div className="px-4 py-3 mx-4 my-3 rounded-2xl bg-gradient-to-br from-blue-900/40 via-slate-800/60 to-slate-900/80 border border-blue-500/20 shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-blue-400" />
              upay Wallet
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs text-slate-300 font-mono">
            {user?.upayWalletNumber || '01712345678'}
          </p>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-slate-400">Monthly Net</span>
            <span className="font-semibold text-emerald-400">
              {formatBDT(user?.profile?.monthlyIncome || 65000)}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 uppercase tracking-wider">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-blue-400">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-white truncate">{user?.fullName || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
