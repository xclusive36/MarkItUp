/**
 * Reusable skeleton loader components for loading states
 * Provides consistent loading UI across the application
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton element with shimmer animation
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      style={{
        background:
          'linear-gradient(90deg, var(--skeleton-from) 0%, var(--skeleton-via) 50%, var(--skeleton-from) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
};

/**
 * Skeleton for a single note item in the sidebar
 */
export const NoteItemSkeleton: React.FC = () => {
  return (
    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-3">
        <Skeleton className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for the notes list in sidebar
 */
export const NotesListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <NoteItemSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Skeleton for the editor content area
 */
export const EditorSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full p-6 space-y-4">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="pt-4">
        <Skeleton className="h-6 w-1/2 mb-3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
};

/**
 * Skeleton for graph view
 */
export const GraphSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative w-32 h-32 mx-auto">
          <Skeleton className="absolute inset-0 rounded-full" />
          <div className="absolute inset-4">
            <Skeleton className="w-full h-full rounded-full" />
          </div>
        </div>
        <Skeleton className="h-4 w-48 mx-auto" />
        <Skeleton className="h-3 w-32 mx-auto" />
      </div>
    </div>
  );
};

/**
 * Skeleton for search results
 */
export const SearchResultSkeleton: React.FC = () => {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  );
};

export const SearchResultsSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <SearchResultSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Skeleton for analytics cards
 */
export const AnalyticsCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
};

export const AnalyticsDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <AnalyticsCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="h-64 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for tag/folder lists
 */
export const TagListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );
};

/**
 * Full page skeleton loader
 */
export const PageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header skeleton */}
      <div className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex">
        {/* Sidebar skeleton */}
        <div className="w-64 h-screen border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hidden lg:block">
          <Skeleton className="h-10 w-full mb-4" />
          <NotesListSkeleton count={8} />
        </div>

        {/* Editor skeleton */}
        <div className="flex-1">
          <EditorSkeleton />
        </div>
      </div>
    </div>
  );
};

// Add CSS for shimmer animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    
    :root {
      --skeleton-from: rgba(229, 231, 235, 1);
      --skeleton-via: rgba(243, 244, 246, 1);
    }
    
    .dark {
      --skeleton-from: rgba(55, 65, 81, 1);
      --skeleton-via: rgba(75, 85, 99, 1);
    }
  `;
  document.head.appendChild(style);
}
