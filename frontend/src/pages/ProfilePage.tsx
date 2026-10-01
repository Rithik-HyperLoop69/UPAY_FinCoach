import React, { useState } from 'react';
import {
  User as UserIcon,
  Shield,
  Wallet,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { formatBDT } from '../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [monthlyIncome, setMonthlyIncome] = useState(
    user?.profile?.monthlyIncome?.toString() || '65000'
  );
  const [primaryIncomeSource, setPrimaryIncomeSource] = useState(
    user?.profile?.primaryIncomeSource || 'Salary'
  );
  const [riskTolerance, setRiskTolerance] = useState(user?.profile?.riskTolerance || 'MODERATE');
  const [savingsTargetPercent, setSavingsTargetPercent] = useState(
    user?.profile?.savingsTargetPercent?.toString() || '25'
  );
  const [occupation, setOccupation] = useState(user?.profile?.occupation || 'Professional');

  // Upay Wallet Linkage
  const [upayWalletNumber, setUpayWalletNumber] = useState(
    user?.upayWalletNumber || '01712345678'
  );

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status feedback
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProfileMsg(null);

    try {
      await api.put('/auth/profile', {
        fullName,
        phone,
        upayWalletNumber,
        monthlyIncome: parseFloat(monthlyIncome),
        primaryIncomeSource,
        riskTolerance,
        savingsTargetPercent: parseFloat(savingsTargetPercent),
        occupation,
      });
      await refreshUser();
      setProfileMsg({ type: 'success', text: 'Financial profile updated successfully!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err?.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    try {
      await api.put('/auth/password', {
        currentPassword,
        newPassword,
      });
      setPassMsg({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassMsg({ type: 'error', text: err?.message || 'Password update failed' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Account & Preferences</h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal details, financial profile baseline, and upay wallet link
        </p>
      </div>

      {/* Upay Wallet Integration Status Card */}
      <Card className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-teal-950/40 border border-blue-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">upay Digital Wallet Linkage</h3>
                <Badge variant={user?.upayConnected ? 'emerald' : 'amber'}>
                  {user?.upayConnected ? 'Connected & Synced' : 'Simulated Link'}
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-mono">
                Linked Wallet: {user?.upayWalletNumber || '01712345678'} (UCB MFS Bangladesh)
              </p>
            </div>
          </div>

          <span className="text-xs text-slate-400">Prototype Simulator Mode</span>
        </div>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader
          title="Personal & Financial Profile"
          subtitle="Baseline variables used by Analytics and Cash-Flow Forecaster"
          icon={<UserIcon className="w-4 h-4 text-blue-400" />}
        />

        {profileMsg && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
              profileMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {profileMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Linked upay Wallet Number
              </label>
              <input
                type="text"
                value={upayWalletNumber}
                onChange={(e) => setUpayWalletNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Monthly Net Income (BDT ৳)
              </label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Target Savings Rate (%)
              </label>
              <input
                type="number"
                min="5"
                max="75"
                value={savingsTargetPercent}
                onChange={(e) => setSavingsTargetPercent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Risk Tolerance</label>
              <select
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                <option value="LOW">Conservative / Low</option>
                <option value="MODERATE">Disciplined / Moderate</option>
                <option value="HIGH">Aggressive Growth</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              variant="upay"
              size="sm"
              isLoading={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Updates
            </Button>
          </div>
        </form>
      </Card>

      {/* Security & Password */}
      <Card>
        <CardHeader
          title="Security & Password"
          subtitle="Update account authentication credentials"
          icon={<Lock className="w-4 h-4 text-purple-400" />}
        />

        {passMsg && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
              passMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {passMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">New Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="secondary" size="sm">
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Logout Action */}
      <div className="pt-4 flex justify-center">
        <Button variant="danger" size="sm" onClick={logout}>
          Sign Out of upay FinCoach
        </Button>
      </div>
    </div>
  );
};
