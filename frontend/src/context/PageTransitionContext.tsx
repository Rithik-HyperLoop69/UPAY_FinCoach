import React, { createContext, useContext, useRef, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GridShutter, GridShutterHandle } from '../components/ui/GridShutter';

interface PageTransitionContextValue {
  navigateWithShutter: (to: string) => void;
  playShutter: (onCover: () => void, onComplete?: () => void) => boolean;
  isTransitioning: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextValue>({
  navigateWithShutter: () => {},
  playShutter: () => false,
  isTransitioning: false,
});

export const usePageTransition = () => useContext(PageTransitionContext);

export const PageTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const shutterRef = useRef<GridShutterHandle | null>(null);
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
    // Prevent navigating to the exact same page while already on it
    if (location.pathname === to) return;
    if (shutterRef.current?.isTransitioning()) return;

    playShutter(() => {
      navigate(to);
    });
  }, [location.pathname, navigate, playShutter]);

  return (
    <PageTransitionContext.Provider
      value={{
        navigateWithShutter,
        playShutter,
        isTransitioning,
      }}
    >
      <GridShutter
        ref={shutterRef}
        onTransitionStart={() => setIsTransitioning(true)}
        onTransitionEnd={() => setIsTransitioning(false)}
      />
      {children}
    </PageTransitionContext.Provider>
  );
};
