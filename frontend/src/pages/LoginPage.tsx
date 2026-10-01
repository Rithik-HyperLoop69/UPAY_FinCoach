import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import StrokeText from '../components/ui/StrokeText';
import BorderGlow from '../components/ui/BorderGlow';
import Ferrofluid from '../components/ui/Ferrofluid';
import TiltedCard from '../components/ui/TiltedCard';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
 
    try {
      await login(email, password);
      navigate('/dashboard');
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
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-blue-600/30">
              ৳
            </div>
          </Link>
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

                <Button
                  type="submit"
                  variant="upay"
                  className="w-full mt-2"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In to FinCoach
                </Button>
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

        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-blue-400 hover:underline font-semibold">
            Create Free Account
          </Link>
        </p>
      </div>
    </div>
  );
};
