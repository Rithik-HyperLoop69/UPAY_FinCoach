import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AddTransactionModal } from '../transactions/AddTransactionModal';
import MoltenMetal from '../ui/MoltenMetal';
import DotField from '../ui/DotField';
import Galaxy from '../ui/Galaxy';
import LineWaves from '../ui/LineWaves';
import { SvgStrokeTransition, SvgStrokeTransitionHandle } from '../ui/SvgStrokeTransition';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const location = useLocation();
  const currentOutlet = useOutlet();

  const [displayedOutlet, setDisplayedOutlet] = useState<React.ReactNode>(currentOutlet);
  const [displayedPath, setDisplayedPath] = useState(location.pathname);
  const transitionRef = useRef<SvgStrokeTransitionHandle | null>(null);
  const prevPathRef = useRef(location.pathname);
  const pendingOutletRef = useRef(currentOutlet);
  pendingOutletRef.current = currentOutlet;

  // Sections where MoltenMetal fluid background is replaced by specialized backgrounds
  const isUnnecessarySection = ['/budgets', '/reports', '/profile'].includes(displayedPath);
  const showMoltenBackground = !isUnnecessarySection;
  const isReportsSection = displayedPath.includes('/reports');
  const isProfileSection = displayedPath.includes('/profile');
  const isBudgetsSection = displayedPath.includes('/budgets');

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

  // Trigger textured SVG stroke wipe transition when switching sections
  useEffect(() => {
    if (location.pathname === prevPathRef.current) return;
    prevPathRef.current = location.pathname;

    if (transitionRef.current) {
      transitionRef.current.playTransition(
        () => {
          // At peak wipe coverage: swap visible section and reset scroll
          setDisplayedOutlet(pendingOutletRef.current);
          setDisplayedPath(location.pathname);
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        },
        () => {
          // Transition complete
        }
      );
    } else {
      setDisplayedOutlet(currentOutlet);
      setDisplayedPath(location.pathname);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [location.pathname, currentOutlet]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative">
      {/* Dynamic MoltenMetal fluid background only in visual showcase sections */}
      {showMoltenBackground && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <MoltenMetal
            color1="#4327ff"
            color2="#2d1acc"
            color3="#FFFFFF"
            speed={0.45}
            scale={4}
            detail={3}
            glow={1.6}
            coreSize={0.1}
            swirl={1}
            fold={-0.2}
            blackPoint={0.05}
            brightness={0.95}
            colorMode="molten"
            grain={true}
            grainIntensity={0.05}
            mouseInteraction={true}
            mouseStrength={0.3}
            opacity={0.88}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/45 to-slate-950/85 backdrop-blur-[1px]" />
        </div>
      )}

      {/* Interactive DotField background ONLY for "Reports" section */}
      {isReportsSection && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <DotField
            dotRadius={2}
            dotSpacing={14}
            bulgeStrength={67}
            glowRadius={110}
            sparkle={false}
            waveAmplitude={0}
            gradientFrom="#0b1be3"
            gradientTo="#377694"
            glowColor="#000000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/60 pointer-events-none" />
        </div>
      )}

      {/* Interactive Galaxy background ONLY for "Profile & Settings" section */}
      {isProfileSection && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <Galaxy
            mouseRepulsion={true}
            mouseInteraction={true}
            density={2}
            glowIntensity={0.2}
            saturation={0.8}
            hueShift={240}
            repulsionStrength={1}
            transparent={true}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/45 to-slate-950/80 pointer-events-none" />
        </div>
      )}

      {/* Interactive LineWaves background ONLY for "Budgets" section */}
      {isBudgetsSection && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <LineWaves
            speed={0.3}
            innerLineCount={32}
            outerLineCount={36}
            warpIntensity={1.0}
            rotation={-45}
            edgeFadeWidth={0.0}
            colorCycleSpeed={1.0}
            brightness={0.2}
            color1="#135512"
            color2="#1c0969"
            color3="#183ba2"
            enableMouseInteraction={true}
            mouseInfluence={2.0}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/45 to-slate-950/80 pointer-events-none" />
        </div>
      )}

      {/* Textured SVG Stroke Page Transition covering the FULL right side */}
      <SvgStrokeTransition
        ref={transitionRef}
        scope="right-side"
        duration={0.65}
      />

      {/* Sidebar Navigation (Left - NEVER covered by section transition) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area (Full Right Side) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 relative z-10">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={getPageTitle(displayedPath)}
          onAddTransactionClick={() => setIsAddTxModalOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {displayedOutlet}
        </main>
      </div>

      {/* Quick Add Transaction Modal accessible globally */}
      <AddTransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => setIsAddTxModalOpen(false)}
        onSuccess={() => {
          setIsAddTxModalOpen(false);
          window.dispatchEvent(new Event('transaction-created'));
        }}
      />
    </div>
  );
};
