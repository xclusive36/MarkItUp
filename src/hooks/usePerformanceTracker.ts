'use client';

import { useState, useEffect } from 'react';
import { PerformanceStats, PerformanceTracker } from '@/lib/performance-tracker';

export interface PerformanceHookResult {
  stats: PerformanceStats[];
  isTracking: boolean;
  start: () => void;
  stop: () => void;
  clear: () => void;
  exportData: () => string;
  getReport: () => string;
}

/**
 * Hook for monitoring application performance
 *
 * @param refreshInterval - How often to refresh stats (ms), default 1000
 * @returns Performance monitoring utilities
 */
export function usePerformanceTracker(refreshInterval: number = 1000): PerformanceHookResult {
  const [stats, setStats] = useState<PerformanceStats[]>([]);
  const [isTracking, setIsTracking] = useState(true);
  const tracker = PerformanceTracker.getInstance();

  useEffect(() => {
    if (!isTracking) return;

    const intervalId = setInterval(() => {
      const allStats = tracker.getAllStats();
      setStats(allStats);
    }, refreshInterval);

    // Initial load
    setStats(tracker.getAllStats());

    return () => {
      clearInterval(intervalId);
    };
  }, [isTracking, refreshInterval, tracker]);

  const start = () => setIsTracking(true);
  const stop = () => setIsTracking(false);
  const clear = () => {
    tracker.clearAll();
    setStats([]);
  };
  const exportData = () => tracker.export();
  const getReport = () => tracker.getReport();

  return {
    stats,
    isTracking,
    start,
    stop,
    clear,
    exportData,
    getReport,
  };
}
