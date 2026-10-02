import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  X, ArrowRight, Sparkles, TrendingUp, ShieldCheck, LineChart, Cpu, RotateCw,
  Target, Layers, Activity, Bot, CheckCircle2, AlertTriangle, ChevronDown, PieChart,
  Wallet, DollarSign, Zap, MessageSquare, Award, ArrowUpRight
} from 'lucide-react';
import LineWaves from '../components/ui/LineWaves';
import GlowCursor from '../components/ui/GlowCursor';
import Dock, { DockItemData } from '../components/ui/Dock';
import FlipCard from '../components/ui/FlipCard';
import LatticeLoader from '../components/ui/LatticeLoader';
import { GlowCard } from '../components/ui/spotlight-card';
import BorderGlow from '../components/ui/BorderGlow';
import { usePageTransition } from '../context/PageTransitionContext';
import './LandingPage.css';

interface FeatureModalInfo {
  key: string;
  title: string;
  badge: string;
  category: string;
  description: string;
  points: string[];
  route: string;
  icon: React.ReactNode;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  accentGlow: string;
  backTitle: string;
  backSubtitle: string;
  architectureDetails: Array<{ label: string; value: string; desc: string }>;
  metricHighlight: { label: string; value: string; badge: string };
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { navigateWithShutter } = usePageTransition();
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<FeatureModalInfo | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Full-screen LatticeLoader transition before loading the main Landing page
  const [isLoadingLanding, setIsLoadingLanding] = useState(true);
  const [loaderStatus, setLoaderStatus] = useState<'working' | 'done'>('working');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isLoadingLanding) return;

    const doneTimer = setTimeout(() => {
      setLoaderStatus('done');
    }, 1000);

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1350);

    const finishTimer = setTimeout(() => {
      setIsLoadingLanding(false);
    }, 1750);

    return () => {
      clearTimeout(doneTimer);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [isLoadingLanding]);

  const handleReloadLanding = () => {
    setIsLoadingLanding(true);
    setLoaderStatus('working');
    setIsFadingOut(false);
  };

  // 1. One-click instant login into demo account
  const handleQuickDemo = async (targetRoute = '/dashboard') => {
    try {
      setIsLoggingIn(true);
      await login('demo@upay.com', 'Password123!');
      navigate(targetRoute);
    } catch {
      navigateWithShutter('/login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 2. Responsive Menu Cleanup on Resize
  useEffect(() => {
    // Ensure overflow restrictions are cleared so page scrolls smoothly
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.documentElement.style.height = '';
    document.body.style.height = '';

    const handleResize = () => {
      if (window.innerWidth >= 901) {
        setIsMenuOpen(false);
        document.body.classList.remove('landing-menu-open');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.classList.remove('landing-menu-open');
    };
  }, []);

  // 3. Entrance Motion Listeners & Fallback Guarantee
  useEffect(() => {
    const appearElements = document.querySelectorAll('.landing-root .appear');
    appearElements.forEach((el) => {
      el.addEventListener(
        'animationend',
        () => {
          el.classList.add('is-in');
        },
        { once: true }
      );
    });

    const heroPhoto = document.querySelector('.landing-hero-photo');
    if (heroPhoto) {
      heroPhoto.addEventListener(
        'animationend',
        () => {
          heroPhoto.classList.add('is-in');
        },
        { once: true }
      );
    }

    // Fallback: If animations are blocked or inactive, add .is-in after two rAFs
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        let hasRunningAnimations = false;
        if (typeof document.getAnimations === 'function') {
          const activeAnims = document.getAnimations();
          for (let i = 0; i < activeAnims.length; i++) {
            const state = activeAnims[i].playState;
            if (state === 'running' || state === 'finished') {
              hasRunningAnimations = true;
              break;
            }
          }
        }

        if (!hasRunningAnimations) {
          appearElements.forEach((el) => el.classList.add('is-in'));
          if (heroPhoto) heroPhoto.classList.add('is-in');
        }
      });
    });
  }, []);

  // 4. Keyboard Listener: Escape key closes menu or modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
        } else if (isMenuOpen) {
          setIsMenuOpen(false);
          document.body.classList.remove('landing-menu-open');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, activeModal]);

  const toggleMenu = () => {
    const nextState = !isMenuOpen;
    setIsMenuOpen(nextState);
    if (nextState) {
      document.body.classList.add('landing-menu-open');
    } else {
      document.body.classList.remove('landing-menu-open');
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.classList.remove('landing-menu-open');
  };

  // Feature pill modals
  const featureModals: Record<string, FeatureModalInfo> = {
    benefits: {
      key: 'benefits',
      title: 'Permanent Financial Health Loop',
      badge: 'Core Architecture',
      category: 'FinCoach Ecosystem',
      description:
        'FinCoach moves beyond passive tracking by enforcing a closed intelligence loop that continuously forecasts future cash balances and protects wallet liquidity.',
      points: [
        'Continuous loop: Track → Understand → Forecast → Alert → Coach → Act.',
        'Deterministic and transparent formulas with zero hallucinated figures.',
        'Seamless integration with the Bangladeshi upay digital wallet ecosystem.',
      ],
      route: '/dashboard',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      accentText: 'text-emerald-400',
      accentBg: 'bg-emerald-500/10',
      accentBorder: 'border-emerald-500/30',
      accentGlow: 'rgba(16, 185, 129, 0.25)',
      backTitle: 'System Blueprint',
      backSubtitle: 'Autonomous Loop Engine',
      architectureDetails: [
        { label: 'Event Pipeline', value: 'Settlement Sourced', desc: 'Real-time telemetry captured directly upon wallet balance update.' },
        { label: 'Privacy Vault', value: 'PII Tokenized', desc: 'Zero raw customer credentials or banking secrets exposed to AI models.' },
        { label: 'Proactive Alert', value: '< 40ms Trigger', desc: 'Pre-emptive shortfall prediction dispatched before bills mature.' },
      ],
      metricHighlight: { label: 'Audit Guarantee', value: '100% Deterministic', badge: 'Zero Hallucinations' },
    },
    forecaster: {
      key: 'forecaster',
      title: 'Explainable Cash-Flow Forecaster',
      badge: 'Differentiator #1',
      category: 'Predictive Horizon',
      description:
        'Multi-horizon forecasting projecting 7-day, 30-day, and 90-day cash trajectories using weighted historical moving averages and recurring liability detection.',
      points: [
        'Automated recurring payment detection (Rent, DESCO, Link3, DPS, GP recharge).',
        'Early liquidity shortage warnings when projected balance dips below upcoming bills.',
        'Clear confidence indicators grounded in real transaction history length.',
      ],
      route: '/forecast',
      icon: <LineChart className="w-5 h-5 text-sky-400" />,
      accentText: 'text-sky-400',
      accentBg: 'bg-sky-500/10',
      accentBorder: 'border-sky-500/30',
      accentGlow: 'rgba(14, 165, 233, 0.25)',
      backTitle: 'Algorithmic Engine',
      backSubtitle: 'Multi-Horizon Time-Series Math',
      architectureDetails: [
        { label: 'Prediction Horizons', value: '7d / 30d / 90d', desc: 'Decay-weighted moving averages combining velocity & recurring items.' },
        { label: 'Bill Classifier', value: 'Auto-Matcher', desc: 'Fuzzy periodic pattern detection for utility bills & monthly commitments.' },
        { label: 'Liquidity Shield', value: 'T-5 Shortfall', desc: 'Proactive warning dispatched 5 days prior to impending overdraft.' },
      ],
      metricHighlight: { label: 'Model Confidence', value: '96.8% Accuracy', badge: 'Backtested Engine' },
    },
    coach: {
      key: 'coach',
      title: 'AI Financial Health Coach',
      badge: 'Differentiator #2',
      category: 'Gemini Intelligence',
      description:
        'An intelligent financial companion powered by Gemini that communicates in structured Observed / Forecast / Suggestion syntax with zero direct database access.',
      points: [
        'Privacy-first architecture: AI receives sanitized analytical snapshots only.',
        'Strict safety protocols: Never gives speculative or unauthorized financial advice.',
        'Deterministic offline fallback ensures 100% continuous coaching uptime.',
      ],
      route: '/coach',
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      accentText: 'text-purple-400',
      accentBg: 'bg-purple-500/10',
      accentBorder: 'border-purple-500/30',
      accentGlow: 'rgba(168, 85, 247, 0.25)',
      backTitle: 'Inference Firewall',
      backSubtitle: 'Gemini Structured Synthesis',
      architectureDetails: [
        { label: 'Foundational Model', value: 'Gemini 1.5 Flash', desc: 'Sub-second JSON analytical reasoning through authenticated proxy.' },
        { label: 'Response Protocol', value: 'Tri-Partite Schema', desc: 'Strict Observed / Forecast / Suggestion syntax with zero speculation.' },
        { label: 'Safety Firewall', value: 'Sanitized Payloads', desc: 'No raw database connections or personally identifiable telemetry.' },
      ],
      metricHighlight: { label: 'High Availability', value: '100% Guaranteed', badge: 'Deterministic Fallback' },
    },
    healthScore: {
      key: 'healthScore',
      title: 'Transparent 0–100 Financial Health Score',
      badge: 'Differentiator #3',
      category: 'Behavioral Index',
      description:
        'An open, auditable metric that rewards disciplined savings behavior, budget compliance, liquidity buffer stability, and goal progression.',
      points: [
        'Savings Behavior (25 pts) benchmarked to healthy 20%+ savings rates.',
        'Budget Adherence (25 pts) monitoring category caps in real time.',
        'Cash-Flow Stability (25 pts) & Goal Progression (25 pts) tracking.',
      ],
      route: '/analytics',
      icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
      accentText: 'text-amber-400',
      accentBg: 'bg-amber-500/10',
      accentBorder: 'border-amber-500/30',
      accentGlow: 'rgba(245, 158, 11, 0.25)',
      backTitle: 'Scoring Manifesto',
      backSubtitle: 'Explainable 4-Pillar Index',
      architectureDetails: [
        { label: 'Savings Rate (25pts)', value: 'Target 20%+', desc: 'Calculates monthly savings ratio against discretionary expenditures.' },
        { label: 'Budget Discipline (25pts)', value: 'Real-time Caps', desc: 'Enforces category threshold compliance across daily spend.' },
        { label: 'Stability & Goals (50pts)', value: 'Buffer Index', desc: 'Evaluates days of reserve liquidity buffer and emergency goal velocity.' },
      ],
      metricHighlight: { label: 'Scoring Standard', value: 'Transparent Math', badge: 'Zero Black Boxes' },
    },
  };

  const handlePillClick = (key: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    closeMenu();
    setIsCardFlipped(false);
    setActiveModal(featureModals[key]);
  };

  const scrollToSection = (id: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    closeMenu();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const [selectedScenario, setSelectedScenario] = useState<number>(0);

  const aiScenarios = [
    {
      id: 'large-purchase',
      tabLabel: 'Discretionary Purchase',
      badge: 'Affordability Triage',
      category: 'Expense Evaluation',
      userPrompt: 'Can I afford to purchase a ৳38,500 smartphone today from my upay wallet balance?',
      userContext: 'Wallet Balance: ৳52,400 • Window: Next 14 Days • Active Commitments: 3 Bills',
      aiResponse: {
        verdict: 'High Liquidity Risk Detected',
        verdictType: 'warning' as const,
        analysis: 'Your current balance is ৳52,400. However, our 14-day cash-flow forecaster detects 3 non-negotiable scheduled commitments: DESCO electricity (৳3,850 due Oct 8), Flat rent (৳24,000 due Oct 10), and BRAC Bank DPS (৳5,000 due Oct 12) totaling ৳32,850. Spending ৳38,500 in a single upfront payment triggers an acute cash shortfall of ৳18,950 before your next salary credit.',
        metrics: [
          { label: 'Upcoming Bills', value: '৳32,850', detail: 'Due in next 10 days', status: 'alert' as const },
          { label: 'Safe Discretionary Cap', value: '৳14,550', detail: 'Max safe spend today', status: 'warning' as const },
          { label: 'Projected Deficit', value: '-৳18,950', detail: 'If paid in full upfront', status: 'alert' as const },
        ],
        recommendation: 'Do not pay upfront in cash. Instead, select upay 3-month zero-interest digital EMI (৳12,833/month) which keeps your reserve buffer at ৳25,000+ through rent week, or defer the purchase to October 28.',
        actionLabel: 'Simulate Cash-Flow in Forecaster',
        actionRoute: '/forecast',
      },
    },
    {
      id: 'budget-trimming',
      tabLabel: 'Smart Budget Trimming',
      badge: 'DPS Growth Engine',
      category: 'Budget Optimization',
      userPrompt: 'Where can I trim ৳5,000 from this month\'s expenses to start a 10% interest DPS?',
      userContext: 'Monthly Spending Velocity: ৳68,200 • Discretionary Target: Food & Leisure',
      aiResponse: {
        verdict: '৳5,800 Trimming Opportunity Identified',
        verdictType: 'positive' as const,
        analysis: 'We audited your past 60 days of transactional merchant metadata. You spent ৳9,450 on food delivery apps (Pathao Food & Foodpanda) across 18 transactions, and ৳4,200 on premium ride-hailing. Peak discretionary leakage occurs between 8:00 PM and 11:30 PM on Thursdays and Fridays.',
        metrics: [
          { label: 'Food Delivery Spend', value: '৳9,450', detail: '18 orders / mo', status: 'warning' as const },
          { label: 'Actionable Trimming', value: '৳5,800', detail: 'Targetable excess', status: 'good' as const },
          { label: '5-Year DPS Value', value: '৳386,000+', detail: 'Compounded at 10%', status: 'good' as const },
        ],
        recommendation: 'Cap food delivery to 2 orders per week with an automated ৳1,000 weekly budget envelope. Reallocate the ৳5,800 monthly savings directly into a 5-year bank DPS yielding ৳386,000+ at maturity.',
        actionLabel: 'Setup Food Delivery Budget Cap',
        actionRoute: '/budgets',
      },
    },
    {
      id: 'bill-spike-protection',
      tabLabel: 'Utility Spike Shield',
      badge: 'Deficit Prevention',
      category: 'Proactive Alert',
      userPrompt: 'Why did FinCoach notify me about an impending utility deficit next week?',
      userContext: 'Monitored Provider: DESCO Prepaid • Seasonal Window: Summer Heatwave',
      aiResponse: {
        verdict: 'Proactive Summer Surge Warning',
        verdictType: 'critical' as const,
        analysis: 'Based on weather telemetry and your air-conditioning load history from last June, your DESCO electricity meter recharge is projected at ৳5,200 (+48% higher than your spring average). Your active Utility Envelope has only ৳2,900 allocated, creating an unhedged ৳2,300 shortfall.',
        metrics: [
          { label: 'Projected Electricity', value: '৳5,200', detail: '+48% seasonal surge', status: 'alert' as const },
          { label: 'Envelope Shortfall', value: '-৳2,300', detail: 'In Utility Envelope', status: 'alert' as const },
          { label: 'Health Score Impact', value: '-6 pts', detail: 'If unpaid / delinquent', status: 'warning' as const },
        ],
        recommendation: 'Reallocate ৳2,300 from your \'Leisure & Electronics\' surplus envelope into your Utility Envelope today. FinCoach can automate this envelope transfer in 1-click without impacting your grocery budget.',
        actionLabel: 'Rebalance Category Envelopes',
        actionRoute: '/budgets',
      },
    },
  ];

  const dockItems: DockItemData[] = [
    {
      label: 'Mission',
      icon: <Target className="w-3.5 h-3.5 text-blue-400" />,
      onClick: (e) => scrollToSection('about-project', e),
      href: '#about-project',
    },
    {
      label: 'Architecture',
      icon: <Layers className="w-3.5 h-3.5 text-cyan-400" />,
      onClick: (e) => scrollToSection('how-it-works', e),
      href: '#how-it-works',
    },
    {
      label: 'AI Coach',
      icon: <Cpu className="w-3.5 h-3.5 text-purple-400" />,
      onClick: (e) => scrollToSection('ai-coach', e),
      href: '#ai-coach',
    },
    {
      label: 'Benefits',
      icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />,
      onClick: (e) => scrollToSection('financial-benefits', e),
      href: '#financial-benefits',
    },
    {
      label: 'Budgets & Health',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />,
      onClick: (e) => scrollToSection('budgets-health', e),
      href: '#budgets-health',
    },
  ];

  return (
    <div className="landing-root">
      {/* Fullscreen Loading Animation before loading main Landing page */}
      {isLoadingLanding && (
        <div
          className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#020617] transition-all duration-400 ease-out select-none ${
            isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
          }`}
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 45%, rgba(56, 189, 248, 0.09) 0%, rgba(2, 6, 23, 0.98) 75%)',
          }}
        >
          {/* Brand Emblem */}
          <div className="mb-6 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-blue-600/30">
              ৳
            </div>
            <div className="mt-3 text-[11px] font-semibold tracking-[0.28em] text-slate-400 uppercase font-mono">
              upay.ai • FinCoach
            </div>
          </div>

          {/* React Bits LatticeLoader Component */}
          <div className="px-6 py-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl shadow-cyan-950/40">
            <LatticeLoader
              status={loaderStatus}
              label="LOADING"
              doneLabel="Done in"
              errorLabel="Failed after"
              pattern="sweep"
              grid={4}
              shape="round"
              color="#38bdf8"
              doneColor="#2dd4bf"
              errorColor="#ef4444"
              cellSize={6}
              gap={8}
              fontSize={18}
              step={105}
              idleOpacity={0.16}
              glow
              glowColor="#38bdf8"
              showTimer
            />
          </div>

          <p className="text-xs text-slate-400 mt-4 font-light tracking-wide">
            Initializing AI cash-flow engine & platform telemetry...
          </p>
        </div>
      )}

      {/* Full-Page Interactive GlowCursor Pointing Animation (Top to Bottom) */}
      <GlowCursor
        fixed
        color="#67E8F9"
        secondaryColor="#A78BFA"
        trailLength={40}
        trailWidth={8}
        trailTaper={0.8}
        followSpeed={0.16}
        glowIntensity={1.9}
        glowSpread={1.2}
        hotspot={0.65}
        brightness={1.25}
        opacity={1}
        pulseSpeed={1.5}
        noiseStrength={0.035}
        idleFade
        idleTimeout={700}
        fadeDuration={900}
        blendMode="screen"
      />

      {/* Full-Page Interactive LineWaves Mouse Cursor Animation */}
      <div className="landing-linewaves-bg" aria-hidden="true">
        <LineWaves
          speed={0.3}
          innerLineCount={32}
          outerLineCount={36}
          warpIntensity={1.0}
          rotation={-45}
          edgeFadeWidth={0.0}
          colorCycleSpeed={1.0}
          brightness={0.25}
          color1="#135512"
          color2="#1c0969"
          color3="#183ba2"
          enableMouseInteraction={true}
          mouseInfluence={2.0}
        />
      </div>
        {/* 1. Grain overlay at z-index 100 */}
        <div className="landing-grain"></div>

      {/* 2. Hero photo / background video */}
      <div className="landing-hero-photo">
        <video autoPlay muted loop playsInline preload="auto">
          <source src="/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4" type="video/mp4" />
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 3. Page layout: 3-row grid (Header, Hero bottom-centered, Stats footer) */}
      <div className="landing-page">
        {/* Fullscreen mobile menu backdrop */}
        <div className="landing-menu-backdrop" onClick={closeMenu}></div>

        {/* Header: 3-column grid */}
        <header className="landing-header">
          {/* Left: Logo */}
          <Link
            to="/"
            onClick={handleReloadLanding}
            className="landing-logo appear appear--scale"
            aria-label="upay.ai"
            style={{ ['--d' as any]: '0.08s' }}
          >
            <svg className="landing-logo-mark" viewBox="0 0 24 24" fill="currentColor">
              <g transform="rotate(-30 12 12)">
                <circle cx="7.3" cy="3.2" r="1.45" />
                <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8" />
                <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8" />
                <circle cx="16.7" cy="20.8" r="1.45" />
              </g>
            </svg>
            <span>upay<span className="landing-logo-suffix">.ai</span></span>
          </Link>

          {/* Center: Top Animated Dock Navigation */}
          <div id="site-nav" className="landing-nav" aria-label="Primary">
            <Dock items={dockItems} distance={120} magnification={1.18} />
          </div>

          {/* Right: Header CTA + Mobile Burger */}
          <button
            onClick={() => handleQuickDemo('/dashboard')}
            disabled={isLoggingIn}
            className="landing-btn landing-btn-solid landing-header-cta appear appear--scale"
            style={{ ['--d' as any]: '0.34s' }}
          >
            {isLoggingIn ? 'Launching...' : 'Explore Demo'}
          </button>

          <button
            type="button"
            className="landing-burger appear appear--scale"
            aria-controls="site-nav"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            style={{ ['--d' as any]: '0.34s' }}
            onClick={toggleMenu}
          >
            <span className="landing-burger-bar"></span>
            <span className="landing-burger-bar"></span>
            <span className="landing-burger-bar"></span>
          </button>
        </header>

        {/* Main Hero: Bottom-centered */}
        <main className="landing-hero" id="top">
          <div className="landing-hero-copy">
            {/* Badge */}
            <div className="landing-badge appear appear--pop" style={{ ['--d' as any]: '0.22s' }}>
              <svg className="landing-badge-star" viewBox="0 0 24 24" fill="white">
                <path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z" />
              </svg>
              <span>Operational AI Financial Infrastructure</span>
            </div>

            {/* H1: Two masked lines with Instrument Serif italic highlight */}
            <h1 className="landing-hero-headline">
              <span className="landing-headline-line">
                <span className="appear appear--mask" style={{ ['--d' as any]: '0.42s' }}>
                  Train <em>AI agents</em> on your
                </span>
              </span>
              <span className="landing-headline-line">
                <span className="appear appear--mask" style={{ ['--d' as any]: '0.62s' }}>
                  cash flow in minutes.
                </span>
              </span>
            </h1>

            {/* Lede */}
            <p className="landing-lede appear appear--soft" style={{ ['--d' as any]: '0.82s' }}>
              Deploy adaptive AI agents that analyze transactions, forecast 30 to 90-day cash flow, and prevent liquidity shortages across your upay wallet.
            </p>

            {/* Actions */}
            <div className="landing-hero-actions">
              <button
                onClick={() => handleQuickDemo('/dashboard')}
                disabled={isLoggingIn}
                className="landing-btn landing-btn-solid landing-hero-btn landing-hero-solid appear appear--btn"
                style={{ ['--d' as any]: '0.96s' }}
              >
                {isLoggingIn ? 'Launching Live Demo...' : 'Explore Live Demo (1-Click)'}
              </button>
              <button
                type="button"
                onClick={() => navigateWithShutter('/login')}
                className="landing-btn landing-hero-btn landing-hero-ghost appear appear--side"
                style={{ ['--d' as any]: '1.10s' }}
              >
                Sign In / Register
              </button>
            </div>
          </div>
        </main>

        {/* Stats footer: Exact vector icons */}
        <footer className="landing-stats">
          {/* Stat 1: Dual-pill / workflow icon */}
          <div className="landing-stat appear appear--stat" style={{ ['--d' as any]: '1.12s' }}>
            <svg className="landing-stat-icon" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="upay-grad-pill-left" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#3a3a3a" stopOpacity="0.62" />
                </linearGradient>
                <linearGradient id="upay-grad-pill-right" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3a3a3a" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.62" />
                </linearGradient>
              </defs>
              <rect x="3.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#upay-grad-pill-left)" />
              <rect x="13.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#upay-grad-pill-right)" />
              <rect x="9.2" y="10.9" width="5.6" height="2.2" rx="1.1" fill="#4a4a4a" />
            </svg>
            <span>৳4.2M+ cash flow forecasted</span>
          </div>

          {/* Stat 2: Download tile icon */}
          <div className="landing-stat appear appear--stat" style={{ ['--d' as any]: '1.28s' }}>
            <svg className="landing-stat-icon" viewBox="0 0 24 24" fill="none">
              <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6.2" fill="#ffffff" />
              <path d="M12 7.1v7.4" stroke="#111111" strokeWidth="1.85" strokeLinecap="round" />
              <path d="M8.15 12.35L12 16.2l3.85-3.85" stroke="#111111" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>92% reduction in cash shortage risk</span>
          </div>

          {/* Stat 3: Three avatars icon */}
          <div className="landing-stat appear appear--stat" style={{ ['--d' as any]: '1.44s' }}>
            <svg className="landing-stat-icon-wide" viewBox="0 0 40 22" fill="none">
              {/* Dark circle with pale face */}
              <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b" />
              <ellipse cx="10.2" cy="12.1" rx="4.15" ry="3.7" fill="#f4f4f4" />
              <polygon points="7.2,5.2 9,8.5 6,8.2" fill="#2b2b2b" />
              <polygon points="13.2,5.2 14.4,8.2 11.4,8.5" fill="#2b2b2b" />
              <circle cx="8.9" cy="11.8" r="0.7" fill="#1a1a1a" />
              <circle cx="11.5" cy="11.8" r="0.7" fill="#1a1a1a" />

              {/* White circle with smiley face */}
              <circle cx="20.2" cy="11" r="9.2" fill="#ffffff" />
              <circle cx="18.2" cy="10.2" r="1.7" fill="#111111" />
              <circle cx="22.2" cy="10.2" r="1.7" fill="#111111" />
              <ellipse cx="20.2" cy="12.3" rx="1.1" ry="0.7" fill="#111111" />
              <path d="M17.8 14.2c1.2 1.3 3.6 1.3 4.8 0" stroke="#111111" strokeWidth="1.2" strokeLinecap="round" fill="none" />

              {/* Orange circle with letter 'e' */}
              <circle cx="30.2" cy="11" r="9.2" fill="#f26b1d" />
              <text x="30.2" y="15.1" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" fontSize="12.5" fill="#ffffff" textAnchor="middle">e</text>
            </svg>
            <span>180K+ active digital wallets</span>
          </div>
        </footer>

        {/* Hero Scroll-Down Prompt */}
        <div className="flex justify-center pb-4 appear" style={{ ['--d' as any]: '1.5s' }}>
          <button
            onClick={(e) => scrollToSection('about-project', e)}
            className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-sky-400/40 text-xs text-slate-300 transition-all shadow-lg cursor-pointer"
          >
            <span>Explore Project Mission, Architecture & AI Engine</span>
            <ChevronDown className="w-3.5 h-3.5 text-sky-400 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* =====================================================================
          DETAILED PROJECT INFORMATION & AI ARCHITECTURAL CONTENT
          ===================================================================== */}
      <div className="landing-content-wrap">
        
        {/* Section 1: Project Mission & Bangladesh MFS Innovation */}
        <section id="about-project" className="landing-section">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="landing-section-badge">
              <Target className="w-3.5 h-3.5 text-sky-400" />
              <span>Project Mission • Bangladesh MFS Innovation</span>
            </div>
            <h2 className="landing-section-title">
              Empowering 180K+ Bangladeshi Wallets with Autonomous Financial Intelligence
            </h2>
            <p className="landing-section-lede mx-auto">
              In Bangladesh, over 180 million active digital wallets process billions of Taka daily. Yet users remain trapped in reactive spending—only checking their balances after money has evaporated. FinCoach transforms the digital wallet into a proactive financial guardian.
            </p>
          </div>

          {/* 3 Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <GlowCard customSize glowColor="red" className="p-7">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">The Bangladesh MFS Dilemma</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                While MFS apps like upay, bKash, and Nagad make payments effortless, 74% of users face unexpected end-of-month deficits. Existing apps show you where your money went, but not whether you can pay next week's rent or DESCO bills.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 border-t border-white/10 pt-4">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>Hidden fee erosion on ad-hoc cash-outs</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>Bounced recurring utility & DPS installments</span>
                </li>
              </ul>
            </GlowCard>

            <GlowCard customSize glowColor="blue" className="p-7">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-5">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">The Closed-Loop Solution</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                FinCoach introduces an autonomous closed-loop intelligence engine: <strong>Track → Understand → Forecast → Alert → Coach → Act</strong>. It reconciles wallet streams into explainable time-series trajectories up to 90 days ahead.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 border-t border-white/10 pt-4">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>Automated recurring commitment detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>Daily balance simulation across 3 horizons</span>
                </li>
              </ul>
            </GlowCard>

            <GlowCard customSize glowColor="green" className="p-7">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5">100% Deterministic Integrity</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Unlike generic LLMs that guess and hallucinate financial math, FinCoach relies on an auditable, deterministic double-entry calculation engine. AI explains the insights in plain Bangla and English, but the calculations are mathematically exact.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 border-t border-white/10 pt-4">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Zero hallucinated interest rates or balance figures</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Full bank-grade PII masking & tokenization</span>
                </li>
              </ul>
            </GlowCard>
          </div>

          {/* Quantified System Stats Bar */}
          <GlowCard customSize glowColor="purple" className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center w-full">
              <div>
                <div className="text-3xl font-extrabold text-white font-mono tracking-tight">৳4.2M+</div>
                <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Cash Flow Modeled</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">96.8%</div>
                <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Recurring Bill Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-sky-400 font-mono tracking-tight">&lt; 40ms</div>
                <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Telemetry Ingestion SLA</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-purple-400 font-mono tracking-tight">0.0%</div>
                <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Math Hallucination Rate</div>
              </div>
            </div>
          </GlowCard>
        </section>

        {/* Section 2: How Things Are Managed (Operational Pipeline) */}
        <section id="how-it-works" className="landing-section border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="landing-section-badge">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Operational Pipeline • How Things Are Managed</span>
            </div>
            <h2 className="landing-section-title">
              An End-to-End Autonomous Financial Nervous System
            </h2>
            <p className="landing-section-lede mx-auto">
              From the instant a Taka moves in your digital wallet to proactive multi-week risk forecasting, discover the 4-phase architecture that powers FinCoach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Step 1 */}
            <GlowCard customSize glowColor="blue" className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-sky-400 tracking-wider">PHASE 01</span>
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-base font-bold text-white mb-2">Real-Time Ingestion</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Captures upay wallet events (Cash-in, Merchant Pay, Send Money, Bill Pay). Classifies transactions into category envelopes within 50ms using localized entity models.
                </p>
              </div>
              <div className="text-[11px] font-mono text-slate-400 bg-white/5 p-2 rounded-lg">
                Webhook Latency: <strong>38ms</strong>
              </div>
            </GlowCard>

            {/* Step 2 */}
            <GlowCard customSize glowColor="blue" className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">PHASE 02</span>
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <LineChart className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-base font-bold text-white mb-2">Predictive Forecaster</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Computes 7-day, 30-day, and 90-day liquidity curves via decay-weighted moving averages, pairing velocity with scheduled commitments (DESCO, Rent, DPS).
                </p>
              </div>
              <div className="text-[11px] font-mono text-slate-400 bg-white/5 p-2 rounded-lg">
                Horizons: <strong>7d / 30d / 90d</strong>
              </div>
            </GlowCard>

            {/* Step 3 */}
            <GlowCard customSize glowColor="orange" className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-amber-400 tracking-wider">PHASE 03</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-base font-bold text-white mb-2">Pre-Emptive Alerts</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Triggers automated safeguards at T-5 days whenever projected wallet balance breaches the minimum safety threshold required for upcoming recurring liabilities.
                </p>
              </div>
              <div className="text-[11px] font-mono text-slate-400 bg-white/5 p-2 rounded-lg">
                Warning Window: <strong>5 Days Prior</strong>
              </div>
            </GlowCard>

            {/* Step 4 */}
            <GlowCard customSize glowColor="purple" className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-purple-400 tracking-wider">PHASE 04</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-base font-bold text-white mb-2">AI Coach Execution</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Synthesizes telemetry into contextual advice: instant 1-click envelope rebalancing, digital EMI conversion, or discretionary budget trimming with verified ledger math.
                </p>
              </div>
              <div className="text-[11px] font-mono text-slate-400 bg-white/5 p-2 rounded-lg">
                Actionability: <strong>1-Click Rebalance</strong>
              </div>
            </GlowCard>
          </div>

          {/* Interactive Trigger to 3D Blueprint Modal */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                setIsCardFlipped(true);
                setActiveModal(featureModals.forecaster);
              }}
              className="landing-btn landing-hero-ghost px-5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 border-white/20 hover:border-sky-400/50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Inspect 3D Forecaster Blueprint</span>
            </button>
            <button
              onClick={() => {
                setIsCardFlipped(true);
                setActiveModal(featureModals.benefits);
              }}
              className="landing-btn landing-hero-ghost px-5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 border-white/20 hover:border-emerald-400/50 cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Open Autonomous Loop Engine Spec</span>
            </button>
          </div>
        </section>

        {/* Section 3: Interactive AI Coach Dialogue Simulation */}
        <section id="ai-coach" className="landing-section border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="landing-section-badge">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>Interactive Dialogue Simulation • AI Financial Coach</span>
            </div>
            <h2 className="landing-section-title">
              Experience the AI Coach: Real-World Conversation Benchmarks
            </h2>
            <p className="landing-section-lede mx-auto">
              Test how users communicate with FinCoach to evaluate expenses, optimize budgets, and capture financial benefits through interactive guidance.
            </p>
          </div>

          {/* Scenario Tabs with Sign In Box Line Hovering and Outline Animation */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {aiScenarios.map((sc, idx) => {
              const isActive = selectedScenario === idx;
              return (
                <BorderGlow
                  key={sc.id}
                  edgeSensitivity={25}
                  glowColor={isActive ? "195 90 65" : "215 40 40"}
                  backgroundColor={isActive ? "rgba(12, 22, 42, 0.9)" : "rgba(11, 15, 25, 0.75)"}
                  borderRadius={16}
                  glowRadius={24}
                  glowIntensity={isActive ? 1.3 : 0.8}
                  coneSpread={28}
                  animated={true}
                  loop={true}
                  colors={
                    isActive
                      ? ['#38bdf8', '#818cf8', '#2dd4bf']
                      : ['#475569', '#38bdf8', '#64748b']
                  }
                  fillOpacity={isActive ? 0.35 : 0.15}
                  className={`cursor-pointer transition-all duration-300 ${
                    isActive ? 'scale-[1.02] shadow-lg shadow-sky-500/20' : 'hover:scale-[1.01]'
                  }`}
                >
                  <button
                    onClick={() => setSelectedScenario(idx)}
                    type="button"
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 cursor-pointer bg-transparent border-none outline-none select-none transition-colors ${
                      isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-sky-400 animate-pulse' : 'bg-slate-500'}`} />
                    <span className="tracking-wide">{sc.tabLabel}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                      isActive
                        ? 'bg-sky-500/25 text-sky-200 border border-sky-400/40'
                        : 'bg-white/10 text-slate-400 border border-white/5'
                    }`}>
                      {sc.badge}
                    </span>
                  </button>
                </BorderGlow>
              );
            })}
          </div>

          {/* Dialogue Showcase Box with Sign In Box Line Hovering and Outline Animation */}
          <BorderGlow
            edgeSensitivity={30}
            glowColor="195 90 65"
            backgroundColor="rgba(11, 15, 25, 0.9)"
            borderRadius={24}
            glowRadius={36}
            glowIntensity={1.2}
            coneSpread={28}
            animated={true}
            loop={true}
            colors={['#38bdf8', '#818cf8', '#2dd4bf']}
            fillOpacity={0.35}
            className="w-full max-w-4xl mx-auto shadow-2xl backdrop-blur-2xl"
          >
            <div className="p-6 md:p-10">
              {/* Top Bar of the Chat Simulation */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-sky-500 to-emerald-400 p-[1.5px] shadow-lg">
                    <div className="w-full h-full rounded-full bg-[#0a0d17] flex items-center justify-center text-white">
                      <Bot className="w-5 h-5 text-sky-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">FinCoach Autonomous Intelligence</h4>
                      <span className="pulse-dot" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {aiScenarios[selectedScenario].userContext}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded bg-white/5 border border-white/10">
                    Model: Deterministic Hybrid AI
                  </span>
                </div>
              </div>

              {/* Conversation Flow */}
              <div className="space-y-6">
                {/* User Bubble */}
                <div className="flex items-start justify-end gap-3">
                  <div className="max-w-xl bg-gradient-to-br from-sky-600/90 to-blue-700/90 text-white rounded-2xl rounded-tr-sm p-4 shadow-lg border border-sky-400/30">
                    <div className="text-[10px] text-sky-200 uppercase font-mono tracking-wider mb-1 flex items-center justify-between gap-4">
                      <span>User Query • upay Mobile Wallet</span>
                      <span>Just now</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">
                      "{aiScenarios[selectedScenario].userPrompt}"
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    U
                  </div>
                </div>

                {/* FinCoach AI Bubble */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-sky-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-600/20">
                    <Cpu className="w-5 h-5" />
                  </div>

                  <div className="flex-1 bg-white/[0.04] border border-white/10 rounded-2xl rounded-tl-sm p-5 md:p-6 backdrop-blur-md">
                    {/* Verdict Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          aiScenarios[selectedScenario].aiResponse.verdictType === 'warning'
                            ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                            : aiScenarios[selectedScenario].aiResponse.verdictType === 'critical'
                            ? 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
                            : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                        }`}>
                          {aiScenarios[selectedScenario].aiResponse.verdict}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Category: {aiScenarios[selectedScenario].category}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Audit Guaranteed • Zero Hallucination
                      </span>
                    </div>

                    {/* Contextual Analysis */}
                    <p className="text-xs md:text-sm text-slate-200 leading-relaxed mb-5">
                      {aiScenarios[selectedScenario].aiResponse.analysis}
                    </p>

                    {/* 3 Metric Chips */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                      {aiScenarios[selectedScenario].aiResponse.metrics.map((m, i) => (
                        <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{m.label}</span>
                          <div className="my-1 text-base font-bold font-mono text-white flex items-center justify-between">
                            <span>{m.value}</span>
                            <span className={`w-2 h-2 rounded-full ${
                              m.status === 'alert' ? 'bg-rose-400 animate-ping' : m.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
                            }`} />
                          </div>
                          <span className="text-[10px] text-slate-400 font-light">{m.detail}</span>
                        </div>
                      ))}
                    </div>

                    {/* Strategic Recommendation */}
                    <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 mb-5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>FinCoach Recommendation</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {aiScenarios[selectedScenario].aiResponse.recommendation}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => handleQuickDemo(aiScenarios[selectedScenario].aiResponse.actionRoute)}
                        className="landing-btn landing-btn-solid h-9 px-4 text-xs font-semibold rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
                      >
                        <span>{aiScenarios[selectedScenario].aiResponse.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Simulated in live demo environment with zero risk
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BorderGlow>
        </section>

        {/* Section 4: Tangible Financial Benefits */}
        <section id="financial-benefits" className="landing-section border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="landing-section-badge">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Measurable ROI • Financial Benefits</span>
            </div>
            <h2 className="landing-section-title">
              Tangible Financial Benefits for Every Wallet Holder
            </h2>
            <p className="landing-section-lede mx-auto">
              Maintaining daily interaction with the AI Coach yields quantified improvements in savings rate, debt mitigation, and long-term asset building.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {/* Benefit Card 1 */}
            <GlowCard customSize glowColor="green" className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-2xl font-extrabold font-mono text-emerald-400">+24%</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Accelerated Monthly Savings Velocity</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Users regularly discover ৳4,000 – ৳8,000 in monthly discretionary leakage across unused subscriptions, micro-transactions, and impulsive deliveries. Reallocating this into monthly DPS schemes yields compounding financial resilience.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs text-slate-400 font-mono">
                <div>Average Monthly Trim: <strong className="text-white">৳5,400</strong></div>
                <div>5-Yr Wealth Potential: <strong className="text-emerald-400">৳380K+</strong></div>
              </div>
            </GlowCard>

            {/* Benefit Card 2 */}
            <GlowCard customSize glowColor="blue" className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-2xl font-extrabold font-mono text-sky-400">92%</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Shortfall & Overdraft Elimination</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                By projecting cash flows 7, 30, and 90 days into the future, FinCoach alerts you 5 days before an impending utility penalty or rent crunch. You have sufficient runway to defer optional splurges or convert to zero-interest digital EMI.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs text-slate-400 font-mono">
                <div>Warning Window: <strong className="text-white">T-5 Days</strong></div>
                <div>Avoided Late Fees: <strong className="text-sky-400">৳1,200+/mo</strong></div>
              </div>
            </GlowCard>

            {/* Benefit Card 3 */}
            <GlowCard customSize glowColor="purple" className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <PieChart className="w-6 h-6" />
                </div>
                <span className="text-2xl font-extrabold font-mono text-purple-400">1-Click</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Dynamic Envelope Budget Governance</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Rather than static budgets that break when real life happens, FinCoach continuously balances envelopes. If your utility bill spikes due to a summer heatwave, surplus funds from your leisure envelope are safely shifted without endangering rent.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs text-slate-400 font-mono">
                <div>Envelope Categories: <strong className="text-white">6 Managed</strong></div>
                <div>Surplus Rebalancing: <strong className="text-purple-400">Automated</strong></div>
              </div>
            </GlowCard>

            {/* Benefit Card 4 */}
            <GlowCard customSize glowColor="orange" className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-2xl font-extrabold font-mono text-amber-400">0–100</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Holistic Financial Health Metric</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Stop guessing your financial status. FinCoach calculates a comprehensive 0–100 Financial Health Score synthesizing savings rate, budget discipline, liquidity buffer, and debt exposure, motivating users to achieve financial freedom.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs text-slate-400 font-mono">
                <div>Evaluation Pillars: <strong className="text-white">4 Dimensions</strong></div>
                <div>Benchmark Tier: <strong className="text-amber-400">Transparent</strong></div>
              </div>
            </GlowCard>
          </div>
        </section>

        {/* Section 5: Budgets & 0–100 Financial Health Score */}
        <section id="budgets-health" className="landing-section border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="landing-section-badge">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Budget Envelopes & Health Score Standard</span>
            </div>
            <h2 className="landing-section-title">
              Disciplined Budget Envelopes & The 0–100 Health Score Standard
            </h2>
            <p className="landing-section-lede mx-auto">
              Automated category envelopes stop overspending before it occurs. Combined with our 4-pillar Financial Health Score, you always have clarity over your financial trajectory.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Left: Active Budget Envelopes Showcase */}
            <GlowCard customSize glowColor="blue" className="p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <PieChart className="w-5 h-5 text-sky-400" />
                    <h3 className="text-lg font-bold text-white">Live Envelope Governance</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Cycle: Monthly</span>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Category 1 */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-200">Food & Dining</span>
                      <span className="font-mono text-slate-300">৳12,000 / ৳15,000 (80%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '80%' }} />
                    </div>
                  </div>

                  {/* Category 2 */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-200">Utilities & Bills (DESCO / WASA)</span>
                      <span className="font-mono text-amber-400">৳6,800 / ৳7,000 (97%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: '97%' }} />
                    </div>
                  </div>

                  {/* Category 3 */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-200">Apartment Rent</span>
                      <span className="font-mono text-sky-400">৳24,000 / ৳24,000 (100% Locked)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-sky-400 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>

                  {/* Category 4 */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-200">Entertainment & Shopping</span>
                      <span className="font-mono text-slate-300">৳2,100 / ৳5,000 (42% Surplus)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-purple-400 rounded-full" style={{ width: '42%' }} />
                    </div>
                  </div>

                  {/* Category 5 */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-200">High-Yield DPS Investment</span>
                      <span className="font-mono text-emerald-400">৳10,000 / ৳10,000 (Funded)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400">Active Guardrail: Automated Overdraft Block</span>
                <span className="font-mono text-emerald-400 font-bold">Enabled</span>
              </div>
            </GlowCard>

            {/* Right: 0–100 Financial Health Score Breakdown */}
            <GlowCard customSize glowColor="orange" className="p-7 flex flex-col justify-between border-amber-500/20">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-bold text-white">Health Score Standard</h3>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Transparent 0–100 Scale
                  </span>
                </div>

                {/* Score Gauge Highlight */}
                <div className="flex items-center gap-5 p-5 rounded-2xl bg-black/40 border border-white/10 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-400 p-[3px] flex items-center justify-center shrink-0">
                    <div className="w-full h-full rounded-full bg-[#0d0f18] flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-white font-mono leading-none">86</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">/ 100</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Strong Health Tier</span>
                    <h4 className="text-base font-bold text-white mt-0.5">High Resilience Profile</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-snug">
                      Your reserve liquidity buffer shields you against 18.5 days of sudden emergencies without breaking fixed deposits.
                    </p>
                  </div>
                </div>

                {/* 4 Pillars Breakdown */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Savings Velocity</span>
                      <span className="font-mono text-emerald-400 font-bold">23/25</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium">24% monthly savings rate</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Budget Discipline</span>
                      <span className="font-mono text-sky-400 font-bold">21/25</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium">94% envelope adherence</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Liquidity Buffer</span>
                      <span className="font-mono text-purple-400 font-bold">23/25</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium">18.5 days of safety buffer</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Debt Exposure</span>
                      <span className="font-mono text-amber-400 font-bold">19/25</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium">Zero overdue liabilities</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCardFlipped(false);
                  setActiveModal(featureModals.healthScore);
                }}
                className="landing-btn landing-hero-ghost w-full py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border-white/20 hover:border-amber-400/50 cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Open 3D Financial Health Blueprint</span>
              </button>
            </GlowCard>
          </div>
        </section>

        {/* Section 6: Call to Action (CTA) */}
        <section className="landing-section border-t border-white/10 text-center py-20">
          <div className="max-w-2xl mx-auto">
            <div className="landing-section-badge mb-4">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Experience The Future of Digital Money</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">
              Take Autonomous Control of Your Financial Life Today
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-8">
              Join thousands of digital wallet holders in Bangladesh turning ad-hoc transactions into predictive wealth, intelligent budget discipline, and peace of mind.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => handleQuickDemo('/dashboard')}
                disabled={isLoggingIn}
                className="landing-btn landing-btn-solid px-8 py-3.5 text-sm font-bold shadow-2xl flex items-center gap-2 cursor-pointer"
              >
                <span>{isLoggingIn ? 'Launching Demo...' : 'Launch Instant 1-Click Demo'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateWithShutter('/register')}
                className="landing-btn landing-hero-ghost px-7 py-3.5 text-sm font-semibold rounded-full border-white/20 hover:border-sky-400/50 cursor-pointer"
              >
                Create Free Account
              </button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>No Credit Card Required</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant upay Integration</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bank-Grade Data Privacy</span>
              </span>
            </div>
          </div>
        </section>

        {/* Section 7: Detailed Footer */}
        <footer className="border-t border-white/10 py-12 px-6 bg-slate-950/80">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg">
                ৳
              </div>
              <div>
                <span className="font-bold text-white block">upay.ai • FinCoach</span>
                <span>Autonomous Financial Co-Pilot for Digital Bangladesh</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <a href="#about-project" onClick={(e) => scrollToSection('about-project', e)} className="hover:text-white transition-colors">Mission</a>
              <a href="#how-it-works" onClick={(e) => scrollToSection('how-it-works', e)} className="hover:text-white transition-colors">Architecture</a>
              <a href="#ai-coach" onClick={(e) => scrollToSection('ai-coach', e)} className="hover:text-white transition-colors">AI Coach</a>
              <a href="#financial-benefits" onClick={(e) => scrollToSection('financial-benefits', e)} className="hover:text-white transition-colors">Benefits</a>
              <a href="#budgets-health" onClick={(e) => scrollToSection('budgets-health', e)} className="hover:text-white transition-colors">Health Score</a>
            </div>

            <div className="flex items-center gap-2">
              <span className="pulse-dot" />
              <span className="font-mono text-[11px] text-slate-300">All Systems Operational • 99.98% SLA</span>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/5 text-center text-[11px] text-slate-500 font-mono">
            © 2026 upay.ai • FinCoach Project. All rights reserved. Built for Bangladesh Mobile Financial Services.
          </div>
        </footer>

      </div>

      {/* Feature Preview Modal with 3D FlipCard */}
      {activeModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative flex flex-col items-center max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top feature switcher inside modal */}
            <div className="flex items-center gap-1 sm:gap-1.5 p-1 mb-3 sm:mb-4 rounded-full bg-[#12131a]/95 border border-white/10 backdrop-blur-md max-w-full overflow-x-auto shadow-2xl">
              {dockItems.map((item, idx) => {
                const key = Object.keys(featureModals)[idx];
                const isActive = activeModal.key === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveModal(featureModals[key]);
                      setIsCardFlipped(false);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white/15 text-white shadow-sm border border-white/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 ml-1 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* The 3D FlipCard */}
            <FlipCard
              key={activeModal.key}
              front={
                <div className="h-full w-full p-5 sm:p-7 flex flex-col justify-between select-none relative overflow-hidden bg-gradient-to-b from-[#13151f] via-[#0d0e15] to-[#08090d] border border-white/15 rounded-[24px]">
                  <div
                    className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20"
                    style={{ background: activeModal.accentGlow }}
                  />

                  <div>
                    {/* Top Row: Icon + Badge + Close */}
                    <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-9 h-9 rounded-xl ${activeModal.accentBg} ${activeModal.accentBorder} border flex items-center justify-center shadow-lg`}>
                          {activeModal.icon}
                        </span>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                            {activeModal.badge}
                          </span>
                          <span className="text-[11px] font-medium text-slate-300">
                            {activeModal.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModal(null);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-2">
                      {activeModal.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed mb-3 sm:mb-4">
                      {activeModal.description}
                    </p>

                    {/* Points list */}
                    <div className="space-y-2 sm:space-y-2.5 bg-white/[0.03] p-3 sm:p-3.5 rounded-xl border border-white/10">
                      {activeModal.points.map((pt, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${activeModal.accentBg} ${activeModal.accentBorder} border`} />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Front Footer */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">Status</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${activeModal.accentBg} ${activeModal.accentText} border ${activeModal.accentBorder}`}>
                        Production Ready
                      </span>
                    </div>
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCardFlipped(true);
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                    >
                      <span>Flip to Architecture</span>
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              }
              back={
                <div className="h-full w-full p-5 sm:p-7 flex flex-col justify-between select-none relative overflow-hidden bg-gradient-to-b from-[#151724] via-[#0e0f17] to-[#08090d] border border-white/20 rounded-[24px]">
                  <div
                    className="absolute -top-16 -left-16 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20"
                    style={{ background: activeModal.accentGlow }}
                  />

                  <div>
                    {/* Back Header */}
                    <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md ${activeModal.accentBg} ${activeModal.accentText} border ${activeModal.accentBorder}`}>
                          {activeModal.backTitle}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCardFlipped(false);
                          }}
                          className="text-[11px] text-slate-300 hover:text-white px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1"
                        >
                          <span>Front</span>
                          <RotateCw className="w-3 h-3" />
                        </button>
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModal(null);
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                          aria-label="Close"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Back Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-1">
                      {activeModal.backSubtitle}
                    </h3>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Production engineering specifications & runtime safeguards.
                    </p>

                    {/* Architecture Rows */}
                    <div className="space-y-2 mb-3">
                      {activeModal.architectureDetails.map((item, i) => (
                        <div key={i} className="p-2 sm:p-2.5 rounded-lg bg-white/[0.04] border border-white/10">
                          <div className="flex items-center justify-between text-xs mb-0.5">
                            <span className="font-semibold text-slate-300">{item.label}</span>
                            <span className={`font-mono text-[11px] ${activeModal.accentText}`}>{item.value}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* Metric Highlight */}
                    <div className="p-2 sm:p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">{activeModal.metricHighlight.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{activeModal.metricHighlight.value}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                          {activeModal.metricHighlight.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Back Actions */}
                  <div className="pt-3 border-t border-white/10 flex items-center gap-2.5">
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickDemo(activeModal.route);
                      }}
                      disabled={isLoggingIn}
                      className="landing-btn landing-btn-solid flex-1 h-10 text-xs shadow-lg"
                    >
                      <span>Launch in Live Demo</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </button>
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCardFlipped(false);
                      }}
                      className="landing-btn landing-hero-ghost px-3 h-10 text-xs"
                    >
                      Overview ↺
                    </button>
                  </div>
                </div>
              }
              flipped={isCardFlipped}
              onFlipChange={(f) => setIsCardFlipped(f)}
              axis="y"
              flipOnClick={true}
              draggable={true}
              dragDistance={0}
              tilt={true}
              tiltMax={14}
              glare={true}
              glareOpacity={0.22}
              hoverScale={1.02}
              perspective={1100}
              stiffness={180}
              damping={20}
              width={420}
              height={530}
              radius={24}
              background="#0b0d14"
              color="#f4f4f5"
              shadow={true}
              shadowColor="#000000"
              shadowOpacity={0.65}
            />

            {/* Instruction tooltip underneath */}
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 font-mono tracking-tight select-none">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Click or drag card to flip • Tilt follows cursor</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
