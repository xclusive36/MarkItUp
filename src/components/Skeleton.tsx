'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  theme?: 'light' | 'dark';
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', theme = 'light', style }) => {
  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{
        backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        ...style,
      }}
    />
  );
};

export const NoteListSkeleton: React.FC<{ count?: number; theme?: 'light' | 'dark' }> = ({
  count = 5,
  theme = 'light',
}) => {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-3/4" theme={theme} />
          <Skeleton className="h-3 w-1/2" theme={theme} />
          <div className="flex gap-2">
            <Skeleton className="h-3 w-16" theme={theme} />
            <Skeleton className="h-3 w-16" theme={theme} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const GraphSkeleton: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'light' }) => {
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="space-y-4 w-full max-w-md">
        <div className="flex justify-center gap-4 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-16 h-16 rounded-full"
              theme={theme}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        <Skeleton className="h-4 w-full" theme={theme} />
        <Skeleton className="h-4 w-5/6" theme={theme} />
        <Skeleton className="h-4 w-4/6" theme={theme} />
      </div>
    </div>
  );
};

export const PanelSkeleton: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'light' }) => {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-6 w-32" theme={theme} />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" theme={theme} />
            <Skeleton className="h-4 w-4/5" theme={theme} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const EditorSkeleton: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'light' }) => {
  return (
    <div className="p-6 space-y-3">
      <Skeleton className="h-8 w-2/3" theme={theme} />
      <Skeleton className="h-4 w-full" theme={theme} />
      <Skeleton className="h-4 w-full" theme={theme} />
      <Skeleton className="h-4 w-5/6" theme={theme} />
      <div className="py-4" />
      <Skeleton className="h-6 w-1/2" theme={theme} />
      <Skeleton className="h-4 w-full" theme={theme} />
      <Skeleton className="h-4 w-full" theme={theme} />
      <Skeleton className="h-4 w-4/5" theme={theme} />
      <Skeleton className="h-4 w-3/4" theme={theme} />
    </div>
  );
};

export default Skeleton;
