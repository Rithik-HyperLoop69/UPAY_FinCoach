import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  message = 'Loading financial insights...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div
        className={`${sizeClasses[size]} rounded-full border-blue-600/20 border-t-blue-500 animate-spin mb-4`}
      />
      {message && <p className="text-sm font-medium text-slate-400">{message}</p>}
    </div>
  );
};
