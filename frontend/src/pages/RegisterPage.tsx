import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react';
import { ShinyButton } from '@/components/ui/shiny-button';
import { useAuth } from '../context/AuthContext';
import { usePageTransition } from '../context/PageTransitionContext';
import Dither from '../components/ui/Dither';
import TechText from '../components/ui/TechText';
import BorderGlow from '../components/ui/BorderGlow';
import TiltedCard from '../components/ui/TiltedCard';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('55000');
  const [occupation, setOccupation] = useState('Professional / Consultant');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const { navigateWithShutter, navigateWithSquiggle } = usePageTransition();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigateWithShutter('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    window.history.pushState({ page: 'register-guard' }, '', window.location.href);
    const handlePopState = () => {
      navigateWithShutter('/');
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigateWithShutter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register({
        fullName,
        email,
        password,
        monthlyIncome: parseFloat(monthlyIncome) || 45000,
        occupation,
      });
      navigateWithSquiggle('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Animated Dither WebGL Background */}
      <div className="absolute inset-0 z-0">
        <Dither
          waveColor={[0.5, 0.5, 0.5]}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.3}
          colorNum={4}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.04}
          backgroundColor={[0.00784313725490196, 0.0196078431372549, 0.07058823529411765]}
        />
      </div>

      {/* Subtle Depth Vignette for Optimal Card Contrast */}
      <div className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-b from-black/40 via-transparent to-black/60 backdrop-blur-[0.5px]" />

      {/* Floating Top-Left Back Button to Landing Page */}
      <div className="fixed top-5 left-5 z-20">
        <button
          type="button"
          onClick={() => navigateWithShutter('/')}
          className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold backdrop-blur-md transition-all duration-200 shadow-lg hover:shadow-cyan-500/10 active:scale-95 cursor-pointer"
          aria-label="Back to Landing Page"
        >
          <ArrowLeft className="w-4 h-4 text-teal-400 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back to Landing Page</span>
        </button>
      </div>

      <div className="relative z-10 w-full max-w-[460px]">
        <div className="text-center mb-6">
          <button
            type="button"
            onClick={() => navigateWithShutter('/')}
            className="inline-flex items-center gap-2 mb-2 cursor-pointer focus:outline-none active:scale-95 transition-transform"
            aria-label="Return to home"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-xl shadow-xl shadow-blue-600/30">
              ৳
            </div>
          </button>

          {/* Interactive TechText Component from React Bits */}
          <div className="w-full h-[52px] sm:h-[60px] mx-auto my-1">
            <TechText
              text="Create a Fincoach Account"
              fontWeight={700}
              fontSize={54}
              letterSpacing={-0.03}
              reveal="letter"
              dashLength={4}
              dashGap={2}
              specks={15}
              accentColor="#38bdf8"
              color="#ffffff"
              speed={1.2}
            />
          </div>

          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-normal tracking-wide">
            Personalized cash-flow forecasting & AI health insights
          </p>
        </div>

        {/* Registration Box with 3D Interactive Spring Tilt & BorderGlow */}
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

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Tanvir Ahmed"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address *</label>
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
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Est. Monthly Income (৳)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Occupation</label>
                    <input
                      type="text"
                      placeholder="e.g. Engineer"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <ShinyButton
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 !py-3.5 !text-sm sm:!text-base font-semibold shadow-xl shadow-blue-900/30"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Completing Registration...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </ShinyButton>
              </form>
            </div>
          </BorderGlow>
        </TiltedCard>

        <p className="text-center text-xs sm:text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigateWithShutter('/login')}
            className="text-blue-400 hover:text-blue-300 hover:underline font-semibold bg-transparent border-none p-0 inline cursor-pointer transition-colors"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
