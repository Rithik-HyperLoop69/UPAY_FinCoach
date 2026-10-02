import React, { createContext, useContext, useRef, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GridShutter, GridShutterHandle } from '../components/ui/GridShutter';
import { SvgStrokeTransition, SvgStrokeTransitionHandle } from '../components/ui/SvgStrokeTransition';

interface PageTransitionContextValue {
  navigateWithShutter: (to: string) => void;
  playShutter: (onCover: () => void, onComplete?: () => void) => boolean;
  navigateWithSquiggle: (to: string) => void;
  playSquiggleTransition: (onCover: () => void, onComplete?: () => void) => boolean;
  isTransitioning: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextValue>({
  navigateWithShutter: () => {},
  playShutter: () => false,
  navigateWithSquiggle: () => {},
  playSquiggleTransition: () => false,
  isTransitioning: false,
});

export const usePageTransition = () => useContext(PageTransitionContext);

export const PageTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const shutterRef = useRef<GridShutterHandle | null>(null);
  const squiggleRef = useRef<SvgStrokeTransitionHandle | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const playShutter = useCallback((onCover: () => void, onComplete?: () => void): boolean => {
    if (!shutterRef.current) {
      onCover();
      if (onComplete) onComplete();
      return true;
    }
    return shutterRef.current.playTransition(onCover, onComplete);
  }, []);

  const navigateWithShutter = useCallback((to: string) => {
    if (location.pathname === to) return;
    if (shutterRef.current?.isTransitioning() || squiggleRef.current?.isTransitioning()) return;

    playShutter(() => {
      navigate(to);
    });
  }, [location.pathname, navigate, playShutter]);

  const playSquiggleTransition = useCallback((onCover: () => void, onComplete?: () => void): boolean => {
    if (!squiggleRef.current) {
      onCover();
      if (onComplete) onComplete();
      return true;
    }
    return squiggleRef.current.playTransition(onCover, onComplete);
  }, []);

  const navigateWithSquiggle = useCallback((to: string) => {
    if (location.pathname === to) return;
    if (shutterRef.current?.isTransitioning() || squiggleRef.current?.isTransitioning()) return;

    playSquiggleTransition(() => {
      navigate(to);
    });
  }, [location.pathname, navigate, playSquiggleTransition]);

  return (
    <PageTransitionContext.Provider
      value={{
        navigateWithShutter,
        playShutter,
        navigateWithSquiggle,
        playSquiggleTransition,
        isTransitioning,
      }}
    >
      <GridShutter
        ref={shutterRef}
        onTransitionStart={() => setIsTransitioning(true)}
        onTransitionEnd={() => setIsTransitioning(false)}
      />
      <SvgStrokeTransition
        ref={squiggleRef}
        onTransitionStart={() => setIsTransitioning(true)}
        onTransitionEnd={() => setIsTransitioning(false)}
      />
      {children}
    </PageTransitionContext.Provider>
  );
};

