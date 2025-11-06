'use client';

import React, { useEffect, useState, useRef } from 'react';

export interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
  className?: string;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  disabled = false,
  className = '',
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || isRefreshing) return;

    // Only trigger if scrolled to the top
    const container = containerRef.current;
    if (container && container.scrollTop === 0 && e.touches[0]) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (disabled || isRefreshing || startY === 0 || !e.touches[0]) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    // Only track downward pulls
    if (distance > 0) {
      setPullDistance(Math.min(distance, threshold * 1.5));

      // Prevent default scroll when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold);

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setStartY(0);
      }
    } else {
      setPullDistance(0);
      setStartY(0);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const onTouchStart = (e: TouchEvent) => handleTouchStart(e);
    const onTouchMove = (e: TouchEvent) => handleTouchMove(e);
    const onTouchEnd = () => handleTouchEnd();

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startY, pullDistance, isRefreshing, disabled]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const rotation = pullProgress * 360;

  return (
    <div ref={containerRef} className={`pull-to-refresh ${className}`}>
      {/* Pull indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="pull-to-refresh-indicator"
          style={{
            height: `${Math.min(pullDistance, threshold)}px`,
            opacity: pullProgress,
          }}
        >
          <div
            className={`pull-to-refresh-spinner ${isRefreshing ? 'refreshing' : ''}`}
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: 'var(--accent-primary)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="pull-to-refresh-content">{children}</div>
    </div>
  );
};

export default PullToRefresh;
