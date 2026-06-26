import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div className={`relative flex items-center justify-center`}>
        {/* Animated outer ring */}
        <div className={`animate-spin rounded-full border-t-hospital-500 border-r-transparent border-b-hospital-200 border-l-transparent ${sizeClasses[size]}`}></div>
        {/* Glow effect */}
        <div className={`absolute rounded-full border border-hospital-500/10 blur-[2px] ${sizeClasses[size]}`}></div>
      </div>
    </div>
  );
};
