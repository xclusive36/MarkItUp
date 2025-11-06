import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  centered?: boolean;
  fullScreen?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  centered = false,
  fullScreen = false,
  className = '',
}) => {
  const spinner = (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className={`${sizeClasses[size]} animate-spin`}
        style={{ color: 'var(--accent-primary)' }}
      />
      {label && (
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{
          backgroundColor: 'var(--bg-primary)',
          zIndex: 'var(--z-loading-overlay)',
        }}
      >
        {spinner}
      </div>
    );
  }

  if (centered) {
    return <div className="flex items-center justify-center w-full py-12">{spinner}</div>;
  }

  return spinner;
};

export default LoadingSpinner;
