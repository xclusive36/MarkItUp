import React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
  animate?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
  animate = true,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'rounded':
        return 'rounded-lg';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const getDefaultHeight = () => {
    if (height) return height;
    switch (variant) {
      case 'text':
        return '1em';
      case 'circular':
        return width || '40px';
      default:
        return '100px';
    }
  };

  const skeletonStyle: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : '200px'),
    height: getDefaultHeight(),
    backgroundColor: 'var(--bg-tertiary)',
    opacity: 0.7,
  };

  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`${getVariantClasses()} ${animate ? 'skeleton-pulse' : ''} ${className}`}
      style={skeletonStyle}
      aria-hidden="true"
    />
  ));

  return count > 1 ? <div className="space-y-2">{skeletons}</div> : skeletons[0];
};

// Common skeleton patterns
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => <Skeleton variant="text" count={lines} className={className} />;

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    <Skeleton variant="rectangular" height="200px" />
    <Skeleton variant="text" width="60%" />
    <Skeleton variant="text" width="80%" />
  </div>
);

export const SkeletonAvatar: React.FC<{ size?: string; className?: string }> = ({
  size = '40px',
  className = '',
}) => <Skeleton variant="circular" width={size} height={size} className={className} />;

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({
  items = 5,
  className = '',
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <Skeleton variant="circular" width="40px" height="40px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
