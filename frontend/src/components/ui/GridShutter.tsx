import React, { useEffect, useRef, useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import gsap from 'gsap';
import './GridShutter.css';

export interface GridShutterHandle {
  playTransition: (onCover: () => void, onComplete?: () => void) => boolean;
  isTransitioning: () => boolean;
}

interface GridShutterProps {
  onTransitionStart?: () => void;
  onTransitionEnd?: () => void;
}

const ROWS = 4;
const COLS = 16;

export const GridShutter = forwardRef<GridShutterHandle, GridShutterProps>(({
  onTransitionStart,
  onTransitionEnd,
}, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const blocksRef = useRef<HTMLDivElement[]>([]);
  const isTransitioningRef = useRef<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isCovered, setIsCovered] = useState<boolean>(false);
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Helper to slice row blocks
  const getRowBlocks = useCallback((row: number): HTMLDivElement[] => {
    return blocksRef.current.slice(row * COLS, row * COLS + COLS);
  }, []);

  // Grid builder: 4 rows × 16 columns (64 blocks total)
  const createTransitionGrid = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Kill any active tweens on previous blocks
    if (activeTimelineRef.current) {
      activeTimelineRef.current.kill();
      activeTimelineRef.current = null;
    }
    if (blocksRef.current.length > 0) {
      gsap.killTweensOf(blocksRef.current);
    }

    // Remove existing block elements
    const existingBlocks = container.querySelectorAll('.transition-block');
    existingBlocks.forEach((el) => el.remove());
    blocksRef.current = [];

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const blockWidth = viewportW / COLS;
    const blockHeight = viewportH / ROWS;

    const newBlocks: HTMLDivElement[] = [];

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const block = document.createElement('div');
        block.className = 'transition-block';

        // +1.5px overlap prevents sub-pixel gaps on any display scale/DPI
        block.style.width = `${blockWidth + 1.5}px`;
        block.style.height = `${blockHeight + 1.5}px`;
        block.style.left = `${col * blockWidth}px`;
        block.style.top = `${row * blockHeight}px`;

        // Even rows (0, 2) anchor to LEFT edge; Odd rows (1, 3) anchor to RIGHT edge
        block.style.transformOrigin = `${row % 2 === 0 ? 'left' : 'right'} center`;

        container.appendChild(block);
        newBlocks.push(block);
      }
    }

    blocksRef.current = newBlocks;

    // Blocks start collapsed (scaleX: 0)
    gsap.set(newBlocks, { scaleX: 0 });
  }, []);

  // animateIn: shutter CLOSED (covers viewport)
  const animateIn = useCallback((onComplete?: () => void) => {
    if (blocksRef.current.length === 0) {
      createTransitionGrid();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsCovered(true);
        if (onComplete) onComplete();
      },
    });

    [0, 1, 2, 3].forEach((row) => {
      const rowBlocks = getRowBlocks(row);
      tl.to(
        rowBlocks,
        {
          scaleX: 1,
          duration: 0.6,
          ease: 'power3.inOut',
          stagger: {
            each: 0.025,
            from: row % 2 === 0 ? 'start' : 'end',
          },
        },
        '<'
      );
    });

    activeTimelineRef.current = tl;
    return tl;
  }, [createTransitionGrid, getRowBlocks]);

  // animateOut: shutter OPEN (reveals new page)
  const animateOut = useCallback((onComplete?: () => void) => {
    setIsCovered(false);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsActive(false);
        isTransitioningRef.current = false;
        activeTimelineRef.current = null;
        if (onTransitionEnd) onTransitionEnd();
        if (onComplete) onComplete();
      },
    });

    [0, 1, 2, 3].forEach((row) => {
      const rowBlocks = getRowBlocks(row);
      tl.to(
        rowBlocks,
        {
          scaleX: 0,
          duration: 0.6,
          ease: 'power3.inOut',
          stagger: {
            each: 0.025,
            from: row % 2 === 0 ? 'start' : 'end',
          },
        },
        '<'
      );
    });

    activeTimelineRef.current = tl;
    return tl;
  }, [getRowBlocks, onTransitionEnd]);

  // Master execution flow
  const playTransition = useCallback((onCover: () => void, onComplete?: () => void): boolean => {
    if (isTransitioningRef.current) return false;

    isTransitioningRef.current = true;
    setIsActive(true);
    if (onTransitionStart) onTransitionStart();

    // 1. Shutter covers viewport
    animateIn(() => {
      // 2. Perform page content swap / router navigation while 100% covered
      try {
        onCover();
      } catch (err) {
        console.error('Error during transition cover swap:', err);
      }

      // 3. Small RAF to ensure React has painted the new view underneath
      requestAnimationFrame(() => {
        animateOut(() => {
          if (onComplete) onComplete();
        });
      });
    });

    return true;
  }, [animateIn, animateOut, onTransitionStart]);

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    playTransition,
    isTransitioning: () => isTransitioningRef.current,
  }), [playTransition]);

  // Build grid on mount, rebuild on resize
  useEffect(() => {
    createTransitionGrid();

    const handleResize = () => {
      if (!isTransitioningRef.current) {
        createTransitionGrid();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
      }
      if (blocksRef.current.length > 0) {
        gsap.killTweensOf(blocksRef.current);
      }
      const container = containerRef.current;
      if (container) {
        const blocks = container.querySelectorAll('.transition-block');
        blocks.forEach((el) => el.remove());
      }
      blocksRef.current = [];
    };
  }, [createTransitionGrid]);

  return (
    <div
      ref={containerRef}
      className={`transition-grid ${isActive ? 'is-active' : ''} ${isCovered ? 'is-covered' : ''}`}
      aria-hidden="true"
    >
      {/* Texture grain overlay */}
      <div className="transition-grid-grain" />

      {/* Atmospheric cyan/indigo glow */}
      <div className="transition-grid-glow" />

      {/* Emblem shown at peak coverage */}
      <div className="transition-grid-emblem">
        <div className="transition-grid-logo">
          <span className="transition-grid-dot" />
          <span>upay<span style={{ color: '#38bdf8' }}>.ai</span></span>
        </div>
      </div>
    </div>
  );
});

GridShutter.displayName = 'GridShutter';
export default GridShutter;
