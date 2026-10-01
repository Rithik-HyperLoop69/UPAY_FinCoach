import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={`glass-panel rounded-2xl p-6 ${
        hoverable ? 'glass-panel-hover' : ''
      } ${className}`}
      {...props}
    >
      {children}
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
