import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import StrokeText from '../components/ui/StrokeText';
import BorderGlow from '../components/ui/BorderGlow';
import Ferrofluid from '../components/ui/Ferrofluid';
import TiltedCard from '../components/ui/TiltedCard';
import { useAuth } from '../context/AuthContext';
import { usePageTransition } from '../context/PageTransitionContext';
import SpecularButton from '../components/ui/SpecularButton';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { navigateWithShutter, navigateWithSquiggle } = usePageTransition();

  useEffect(() => {
    // 1. Keyboard shortcut: Escape returns to landing page
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // 2. Intercept browser back button (popstate)
    window.history.pushState({ page: 'login-guard' }, '', window.location.href);

    const handlePopState = () => {
      navigate('/');
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigateWithSquiggle('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@upay.com');
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-[#03010a] relative overflow-hidden flex flex-col justify-center items-center p-4">
      {/* Floating Top-Left Back Button to Landing Page */}
      <div className="fixed top-5 left-5 z-20">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold backdrop-blur-md transition-all duration-200 shadow-lg hover:shadow-cyan-500/10 active:scale-95 cursor-pointer"
          aria-label="Back to Landing Page"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back to Landing Page</span>
        </button>
      </div>

      {/* Animated Ferrofluid WebGL Background */}
      <div className="absolute inset-0 z-0">
        <Ferrofluid
          colors={['#38bdf8', '#818cf8', '#06b6d4']}
          speed={0.4}
          scale={1.35}
          turbulence={1.1}
          fluidity={0.12}
          rimWidth={0.22}
          sharpness={2.6}
          shimmer={1.3}
          glow={2.2}
          flowDirection="down"
          opacity={0.75}
          mouseInteraction={true}
          mouseStrength={1.2}
          mouseRadius={0.35}
          className="w-full h-full"
        />
      </div>

      {/* Subtle Depth Vignette for Optimal Contrast */}
      <div className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-b from-black/50 via-transparent to-black/70 backdrop-blur-[0.5px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 mb-2 cursor-pointer focus:outline-none"
            aria-label="Return to home"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-blue-600/30">
              ৳
            </div>
          </button>
          <div className="w-full max-w-[340px] mx-auto py-1">
            <StrokeText
              text="Welcome Back"
              strokeColor="#38bdf8"
              fillColor="#ffffff"
              strokeWidth={2}
              drawDuration={1.3}
              fillDelay={0.15}
              stagger={0.05}
              ease="power2.out"
              trigger="mount"
              fillMode="wipe"
              fontSize={58}
              fontWeight={900}
              letterSpacing={-2}
              className="w-full block"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Access your upay AI Financial Health Coach & Cash-Flow Forecaster
          </p>
        </div>

        {/* Whole Sign In Box with TiltedCard 3D Spring Tilt & BorderGlow */}
        <TiltedCard
          containerWidth="100%"
          containerHeight="auto"
          imageWidth="100%"
          imageHeight="auto"
          rotateAmplitude={10}
          scaleOnHover={1.015}
          showMobileWarning={false}
          showTooltip={false}
          className="w-full"
        >
          <BorderGlow
            edgeSensitivity={30}
            glowColor="195 90 65"
            backgroundColor="#0b0f19"
            borderRadius={24}
            glowRadius={36}
            glowIntensity={1.2}
            coneSpread={28}
            animated={true}
            colors={['#38bdf8', '#818cf8', '#2dd4bf']}
            fillOpacity={0.35}
            className="w-full shadow-2xl"
          >
            <div className="p-7 sm:p-8">
              {error && (
                <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <SpecularButton
                  type="submit"
                  size="md"
                  radius={14}
                  variant="upay"
                  textColor="#ffffff"
                  lineColor="#ffffff"
                  baseColor="#1d4ed8"
                  intensity={1.35}
                  shineSize={28}
                  shineFade={32}
                  thickness={1.1}
                  speed={0.85}
                  followMouse={true}
                  proximity={330}
                  autoAnimate={true}
                  disabled={isLoading}
                  className="w-full mt-2 font-semibold"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2">
                      Sign In to FinCoach
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </SpecularButton>
              </form>

              {/* 1-Click Demo Fill */}
              <div className="mt-6 pt-5 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 text-blue-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  Use Pre-Seeded Demo Account (demo@upay.com)
                </button>
              </div>
            </div>
          </BorderGlow>
        </TiltedCard>

        {/* Separate "Create Free Account" Button with SpecularButton from React Bits */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col items-center text-center">
          <div className="flex items-center gap-3 w-full max-w-[280px] mb-3.5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 font-mono">
              New to FinCoach?
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>

          <SpecularButton
            size="lg"
            radius={24}
            tint="#ffffff"
            tintOpacity={0}
            blur={0}
            textColor="#f5f5f5"
            lineColor="#ffffff"
            baseColor="#525252"
            intensity={1.3}
            shineSize={28}
            shineFade={32}
            thickness={1}
            speed={0.85}
            followMouse
            proximity={330}
            autoAnimate
            onClick={() => navigateWithShutter('/register')}
            className="w-full max-w-[320px] font-semibold"
          >
            Create Free Account
          </SpecularButton>

          <p className="text-[11px] text-slate-500 mt-2.5 font-medium tracking-tight">
            Instant setup in 2 minutes • No credit card required
          </p>
        </div>
      </div>
    </div>
  );
};
