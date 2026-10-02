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

        {/* Upay Wallet Card Mini with Auto-Glowing Glassmorphism Animation */}
        <div
          className="group isolate relative mx-4 my-3 overflow-hidden rounded-2xl p-[1px] shadow-[0_4px_24px_rgba(56,189,248,0.15)] transition-all duration-300 hover:shadow-[0_0_30px_6px_rgba(56,189,248,0.25)]"
          style={
            {
              '--spread': '90deg',
              '--shimmer-color': 'rgba(56, 189, 248, 0.75)',
              '--speed': '4s',
            } as React.CSSProperties
          }
        >
          {/* Conic Rotating Shimmer Gradient */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-[-200%] w-[400%] h-[400%]"
              style={{ animation: 'rotate-gradient 4s linear infinite' }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'conic-gradient(from 225deg, transparent 0, var(--shimmer-color) var(--spread), transparent var(--spread))',
                }}
              />
            </div>
          </div>

          {/* Rotating Border Beam Linear Gradient */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: '200%',
              height: '200%',
              background:
                'linear-gradient(90deg, transparent, rgba(56,189,248,0.35), rgba(45,212,191,0.35), rgba(129,140,248,0.35), transparent)',
              animation: 'borderBeamRotation 4s infinite linear',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Inner Dark Glass Panel Backdrop */}
          <div
            className="absolute rounded-[15px] pointer-events-none"
            style={{
              inset: '1px',
              background: 'rgba(11, 15, 25, 0.88)',
              backdropFilter: 'blur(12px)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 px-4 py-3 rounded-[15px]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <Wallet className="w-3.5 h-3.5 text-blue-400" />
                upay Wallet
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>
            <p className="text-xs text-slate-300 font-mono tracking-wide">
              {user?.upayWalletNumber || '01712345678'}
            </p>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-400">Monthly Net</span>
              <span className="font-semibold text-emerald-400">
                {formatBDT(user?.profile?.monthlyIncome || 65000)}
              </span>
            </div>
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
