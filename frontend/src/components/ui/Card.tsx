import React from 'react';
import TiltedCard from './TiltedCard';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  tilted?: boolean;
  rotateAmplitude?: number;
  scaleOnHover?: number;
}

const GRID_LAYOUT_PATTERNS = [
  'col-span',
  'row-span',
  'col-start',
  'row-start',
  'sm:col-span',
  'md:col-span',
  'lg:col-span',
  'xl:col-span',
  '2xl:col-span',
];

function splitLayoutClasses(className: string) {
  const outerClasses: string[] = [];
  const innerClasses: string[] = [];

  className.split(/\s+/).forEach((cls) => {
    if (!cls) return;
    if (GRID_LAYOUT_PATTERNS.some((pattern) => cls.includes(pattern))) {
      outerClasses.push(cls);
    } else {
      innerClasses.push(cls);
    }
  });

  return {
    outerClass: outerClasses.join(' '),
    innerClass: innerClasses.join(' '),
  };
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = true,
  tilted = true,
  rotateAmplitude = 6,
  scaleOnHover = 1.015,
  ...props
}) => {
  const { outerClass, innerClass } = splitLayoutClasses(className);

  const cardInner = (
    <div
      className={`liquid-glass rounded-2xl p-6 h-full ${
        hoverable ? 'liquid-glass-hover' : ''
      } ${innerClass}`}
      {...props}
    >
      {children}
    </div>
  );

  if (tilted) {
    return (
      <TiltedCard
        containerWidth="100%"
        containerHeight="100%"
        imageWidth="100%"
        imageHeight="100%"
        rotateAmplitude={rotateAmplitude}
        scaleOnHover={scaleOnHover}
        showMobileWarning={false}
        showTooltip={false}
        className={`w-full h-full ${outerClass}`}
      >
        {cardInner}
      </TiltedCard>
    );
  }

  return (
    <div className={`w-full ${outerClass}`}>
      {cardInner}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ title, subtitle, action, icon }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-3">
      {icon && (
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);
