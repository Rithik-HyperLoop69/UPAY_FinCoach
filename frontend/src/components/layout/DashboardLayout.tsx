import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AddTransactionModal } from '../transactions/AddTransactionModal';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const location = useLocation();

  // Dynamic titles based on route
  const getPageTitle = (path: string): string => {
    if (path.includes('/transactions')) return 'Transaction Ledger';
    if (path.includes('/analytics')) return 'Financial Analytics & Insights';
    if (path.includes('/forecast')) return 'Cash-Flow Forecaster (30-90D)';
    if (path.includes('/budgets')) return 'Monthly Budget Planner';
    if (path.includes('/goals')) return 'Savings Goals & DPS';
    if (path.includes('/coach')) return 'AI Financial Health Coach';
    if (path.includes('/alerts')) return 'Financial Alerts & Notifications';
    if (path.includes('/reports')) return 'Monthly Financial Health Report';
    if (path.includes('/profile')) return 'Account & Upay Preferences';
    return 'Financial Health Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={getPageTitle(location.pathname)}
          onAddTransactionClick={() => setIsAddTxModalOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Quick Add Transaction Modal accessible globally */}
      <AddTransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => setIsAddTxModalOpen(false)}
        onSuccess={() => {
          setIsAddTxModalOpen(false);
          // Trigger window event so any active page queries can refresh
          window.dispatchEvent(new Event('transaction-created'));
        }}
      />
    </div>
  );
};
