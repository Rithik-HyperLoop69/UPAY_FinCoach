import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, ArrowRight, Sparkles, TrendingUp, ShieldCheck, LineChart, Cpu, RotateCw } from 'lucide-react';
import GlowCursor from '../components/ui/GlowCursor';
import Dock, { DockItemData } from '../components/ui/Dock';
import FlipCard from '../components/ui/FlipCard';
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
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<FeatureModalInfo | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // 1. One-click instant login into demo account
  const handleQuickDemo = async (targetRoute = '/dashboard') => {
    try {
      setIsLoggingIn(true);
      await login('demo@upay.com', 'Password123!');
      navigate(targetRoute);
    } catch {
      navigate('/login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 2. Desktop Single-Viewport Lock on >= 901px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 901) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.height = '100%';
        document.body.style.height = '100%';
        setIsMenuOpen(false);
        document.body.classList.remove('landing-menu-open');
      } else {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.documentElement.style.height = '';
        document.body.style.height = '';
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
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

  const dockItems: DockItemData[] = [
    {
      label: 'Benefits',
      icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />,
      onClick: (e) => handlePillClick('benefits', e),
      href: '#benefits',
    },
    {
      label: 'Forecaster',
      icon: <LineChart className="w-3.5 h-3.5 text-sky-400" />,
      onClick: (e) => handlePillClick('forecaster', e),
      href: '#forecast',
    },
    {
      label: 'AI Coach',
      icon: <Cpu className="w-3.5 h-3.5 text-purple-400" />,
      onClick: (e) => handlePillClick('coach', e),
      href: '#coach',
    },
    {
      label: 'Health Score',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />,
      onClick: (e) => handlePillClick('healthScore', e),
      href: '#health-score',
    },
  ];

  return (
    <div className="landing-root">
      <GlowCursor
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
        pulseSpeed={1.1}
        noiseStrength={0.035}
        idleFade={true}
        idleTimeout={700}
        fadeDuration={900}
        blendMode="screen"
        className="landing-glow-wrapper"
      >
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
          <Link to="/" className="landing-logo appear appear--scale" aria-label="upay.ai" style={{ ['--d' as any]: '0.08s' }}>
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
              <Link
                to="/login"
                className="landing-btn landing-hero-btn landing-hero-ghost appear appear--side"
                style={{ ['--d' as any]: '1.10s' }}
              >
                Sign In / Register
              </Link>
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
      </div>
      </GlowCursor>

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
