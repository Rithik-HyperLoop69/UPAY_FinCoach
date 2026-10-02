import React, { useRef, useEffect, useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import gsap from 'gsap';
import './SvgStrokeTransition.css';

export interface SvgStrokeTransitionHandle {
  playTransition: (onCover: () => void, onComplete?: () => void) => boolean;
  isTransitioning: () => boolean;
}

export interface SvgStrokeTransitionProps {
  onTransitionStart?: () => void;
  onTransitionEnd?: () => void;
  scope?: 'fullscreen' | 'right-side';
  duration?: number;
}

export const SvgStrokeTransition = forwardRef<SvgStrokeTransitionHandle, SvgStrokeTransitionProps>(
  ({ onTransitionStart, onTransitionEnd, scope = 'fullscreen', duration = 0.8 }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const path1Ref = useRef<SVGPathElement | null>(null);
    const path2Ref = useRef<SVGPathElement | null>(null);

    const isTransitioningRef = useRef<boolean>(false);
    const [isActive, setIsActive] = useState<boolean>(false);
    const lengthsRef = useRef<number[]>([0, 0]);

    // Measure both paths and prime strokeDasharray / strokeDashoffset
    const primePaths = useCallback(() => {
      const p1 = path1Ref.current;
      const p2 = path2Ref.current;
      if (!p1 || !p2) return;

      const paths = [p1, p2];
      paths.forEach((path, idx) => {
        try {
          const length = path.getTotalLength() || 12000;
          lengthsRef.current[idx] = length;
          path.style.strokeDasharray = `${length}`;
          path.style.strokeDashoffset = `${length}`;
          path.setAttribute('stroke-width', '200');
        } catch {
          lengthsRef.current[idx] = 12000;
          path.style.strokeDasharray = '12000';
          path.style.strokeDashoffset = '12000';
          path.setAttribute('stroke-width', '200');
        }
      });
    }, []);

    useEffect(() => {
      primePaths();

      return () => {
        const p1 = path1Ref.current;
        const p2 = path2Ref.current;
        if (p1 && p2) {
          gsap.killTweensOf([p1, p2]);
        }
        isTransitioningRef.current = false;
      };
    }, [primePaths]);

    const playTransition = useCallback(
      (onCover: () => void, onComplete?: () => void): boolean => {
        const p1 = path1Ref.current;
        const p2 = path2Ref.current;
        if (!p1 || !p2) {
          onCover();
          if (onComplete) onComplete();
          return false;
        }

        if (isTransitioningRef.current) {
          return false;
        }

        isTransitioningRef.current = true;
        setIsActive(true);
        if (onTransitionStart) onTransitionStart();

        const paths = [p1, p2];

        // Ensure lengths are primed
        paths.forEach((path, idx) => {
          if (!lengthsRef.current[idx]) {
            lengthsRef.current[idx] = path.getTotalLength() || 12000;
          }
          const length = lengthsRef.current[idx];
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
            attr: { 'stroke-width': 200 },
          });
        });

        // 1. Leave phase: strokes draw in and swell from 200 to 700 to wipe the screen
        const leaveTl = gsap.timeline({
          onComplete: () => {
            // Swap visible page underneath while fully covered
            try {
              onCover();
            } catch (err) {
              console.error('Error during transition onCover:', err);
            }

            // 2. Enter phase: strokes keep drawing out same direction while thinning from 700 to 200
            const enterTl = gsap.timeline({
              onComplete: () => {
                isTransitioningRef.current = false;
                setIsActive(false);
                if (onTransitionEnd) onTransitionEnd();
                if (onComplete) onComplete();
              },
            });

            paths.forEach((path, idx) => {
              const length = lengthsRef.current[idx] || 12000;
              enterTl.to(
                path,
                {
                  strokeDashoffset: -length,
                  attr: { 'stroke-width': 200 },
                  duration,
                  ease: 'power1.inOut',
                  onComplete: () => {
                    // Reset to the hidden +length start for the next transition
                    gsap.set(path, { strokeDashoffset: length });
                  },
                },
                0
              );
            });
          },
        });

        paths.forEach((path) => {
          leaveTl.to(
            path,
            {
              strokeDashoffset: 0,
              attr: { 'stroke-width': 700 },
              duration,
              ease: 'power1.inOut',
            },
            0
          );
        });

        return true;
      },
      [duration, onTransitionStart, onTransitionEnd]
    );

    useImperativeHandle(
      ref,
      () => ({
        playTransition,
        isTransitioning: () => isTransitioningRef.current,
      }),
      [playTransition]
    );

    return (
      <>
        {/* Subtle Cyber Texture & Grain Layer */}
        <div
          className={`transition-texture-overlay ${isActive ? 'active' : ''} ${
            scope === 'right-side' ? 'scope-right-side' : ''
          }`}
        />

        <div
          ref={containerRef}
          className={`transition-svg ${isActive ? 'is-active' : ''} ${
            scope === 'right-side' ? 'scope-right-side' : ''
          }`}
          aria-hidden="true"
        >
          <svg
            ref={svgRef}
            viewBox="0 0 2453 2535"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Path 1: Midnight Obsidian to Deep FinTech Navy/Teal */}
              <linearGradient id="fincoach-stroke-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#050a14" />
                <stop offset="35%" stopColor="#0f1f3d" />
                <stop offset="70%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0e7490" />
              </linearGradient>

              {/* Path 2: Signature FinCoach Electric Cyan / Neon Teal */}
              <linearGradient id="fincoach-stroke-2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="30%" stopColor="#2563eb" />
                <stop offset="65%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#2dd4bf" />
              </linearGradient>

              {/* High-Tech Cyber Noise & Soft Neon Bloom Filter */}
              <filter id="fincoach-squiggle-glow" x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow dx="0" dy="0" stdDeviation="22" floodColor="#38bdf8" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Path 1: Base Winding Ribbon */}
            <path
              ref={path1Ref}
              d="M227.549 1818.76C227.549 1818.76 406.016 2207.75 569.049 2130.26C843.431 1999.85 -264.104 1002.3 227.549 876.262C552.918 792.849 773.647 2456.11 1342.05 2130.26C1885.43 1818.76 14.9644 455.772 760.548 137.262C1342.05 -111.152 1663.5 2266.35 2209.55 1972.76C2755.6 1679.18 1536.63 384.467 1826.55 137.262C2013.5 -22.1463 2209.55 381.262 2209.55 381.262"
              stroke="url(#fincoach-stroke-1)"
              strokeWidth="200"
              strokeLinecap="round"
            />

            {/* Path 2: Foreground Glowing Electric Cyan / Teal Ribbon */}
            <path
              ref={path2Ref}
              d="M1661.28 2255.51C1661.28 2255.51 2311.09 1960.37 2111.78 1817.01C1944.47 1696.67 718.456 2870.17 499.781 2255.51C308.969 1719.17 2457.51 1613.83 2111.78 963.512C1766.05 313.198 427.949 2195.17 132.281 1455.51C-155.219 736.292 2014.78 891.514 1708.78 252.012C1437.81 -314.29 369.471 909.169 132.281 566.512C18.1772 401.672 244.781 193.012 244.781 193.012"
              stroke="url(#fincoach-stroke-2)"
              strokeWidth="200"
              strokeLinecap="round"
              filter="url(#fincoach-squiggle-glow)"
            />
          </svg>
        </div>
      </>
    );
  }
);

SvgStrokeTransition.displayName = 'SvgStrokeTransition';
