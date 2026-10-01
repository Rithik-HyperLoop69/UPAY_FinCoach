import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  LineChart,
  ShieldCheck,
  ArrowRight,
  PieChart,
  Zap,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleQuickDemo = async () => {
    try {
      await login('demo@upay.com', 'Password123!');
      navigate('/dashboard');
    } catch (e) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-800/80 backdrop-blur-xl sticky top-0 z-50 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-blue-600/30">
              ৳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-white tracking-tight">upay</span>
                <span className="font-semibold text-xs text-blue-400 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                  FinCoach Concept
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                AI Financial Health Coach & Forecaster
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Button
              variant="upay"
              size="sm"
              onClick={handleQuickDemo}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Live Demo
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex-1 flex flex-col justify-center">
        {/* Glow ambient background */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Designed for Bangladesh Digital Finance Ecosystem
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
            Your Money, <br />
            <span className="gradient-text">Understood & Forecasted.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 font-normal max-w-2xl mx-auto mb-10 leading-relaxed">
            Move beyond passive expense tracking. Understand your spending behavior, forecast future
            cash flows across 30 to 90 days, identify liquidity shortages in advance, and receive
            actionable coaching tailored to Bangladesh.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="upay"
              size="lg"
              onClick={handleQuickDemo}
              className="w-full sm:w-auto text-base px-8 py-3.5 shadow-2xl shadow-blue-600/30"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Launch Live Demo (1-Click)
            </Button>
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-base px-8 py-3.5">
                Create Free Account
              </Button>
            </Link>
          </div>

          {/* Quick Features Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-12 border-t border-slate-800/80 text-left">
            <div className="p-4 rounded-2xl glass-panel">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-2">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-white">AI Health Coach</h4>
              <p className="text-xs text-slate-400 mt-1">
                Context-grounded guidance with Observed, Forecast, and Suggestion rules.
              </p>
            </div>

            <div className="p-4 rounded-2xl glass-panel">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-2">
                <LineChart className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-white">Cash-Flow Forecaster</h4>
              <p className="text-xs text-slate-400 mt-1">
                Explainable 7-day, 30-day, and 90-day cash projections & recurring bill detection.
              </p>
            </div>

            <div className="p-4 rounded-2xl glass-panel">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-white">Health Score 0-100</h4>
              <p className="text-xs text-slate-400 mt-1">
                100% transparent formula factoring savings behavior, budgets, and cash stability.
              </p>
            </div>

            <div className="p-4 rounded-2xl glass-panel">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-white">upay Integration</h4>
              <p className="text-xs text-slate-400 mt-1">
                Simulated digital wallet payments, mobile recharges, bills, and digital DPS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Product Loop */}
      <section className="py-20 border-t border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
            Continuous Intelligence Loop
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-2 mb-12">
            Built Around the FinCoach Permanent Loop
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
            {['TRACK', 'UNDERSTAND', 'FORECAST', 'ALERT', 'COACH', 'ACT', 'TRACK AGAIN'].map(
              (step, idx) => (
                <React.Fragment key={step}>
                  <div className="px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-200 shadow-md">
                    {step}
                  </div>
                  {idx < 6 && <span className="text-blue-500 font-bold text-base">→</span>}
                </React.Fragment>
              )
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4 text-center text-xs text-slate-500">
        <p>
          upay FinCoach Prototype • Built for fintech innovation demonstrations and research in
          Bangladesh.
        </p>
        <p className="mt-1">
          Not officially affiliated with UCB/upay unless authorized. All simulated transaction data
          is generated for demonstration.
        </p>
      </footer>
    </div>
  );
};
