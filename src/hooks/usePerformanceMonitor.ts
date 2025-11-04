import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  avgRenderTime: number;
  slowRenders: number; // renders > 16ms (60fps threshold)
}

const performanceData = new Map<string, PerformanceMetrics>();

/**
 * Performance monitoring hook
 * Tracks component render times and identifies performance bottlenecks
 *
 * @param componentName - Name of the component to track
 * @param enabled - Whether to enable monitoring (default: development only)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   usePerformanceMonitor('MyComponent');
 *   // ... component code
 * }
 * ```
 */
export function usePerformanceMonitor(
  componentName: string,
  enabled: boolean = process.env.NODE_ENV === 'development'
) {
  const renderCount = useRef(0);
  const renderStartTime = useRef(0);
  const totalRenderTime = useRef(0);
  const slowRenderCount = useRef(0);

  // Mark render start
  if (enabled) {
    renderStartTime.current = performance.now();
  }

  useEffect(() => {
    if (!enabled) return;

    // Mark render end
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    renderCount.current++;
    totalRenderTime.current += renderTime;

    // Track slow renders (>16ms = below 60fps)
    if (renderTime > 16) {
      slowRenderCount.current++;
    }

    // Update performance data
    const metrics: PerformanceMetrics = {
      componentName,
      renderCount: renderCount.current,
      lastRenderTime: renderTime,
      avgRenderTime: totalRenderTime.current / renderCount.current,
      slowRenders: slowRenderCount.current,
    };

    performanceData.set(componentName, metrics);

    // Only log slow renders if they're significantly slow (>50ms)
    // This reduces noise while still catching real performance issues
    if (renderTime > 50) {
      console.warn(`⚠️ Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }

    // Removed: Regular logging every 10 renders (too noisy)
    // Use __performanceReport() in console to see full metrics
  });

  return {
    renderCount: renderCount.current,
    avgRenderTime: totalRenderTime.current / Math.max(renderCount.current, 1),
    slowRenders: slowRenderCount.current,
  };
}

/**
 * Get all performance metrics for all monitored components
 */
export function getPerformanceReport(): PerformanceMetrics[] {
  return Array.from(performanceData.values()).sort((a, b) => b.avgRenderTime - a.avgRenderTime);
}

/**
 * Clear all performance data
 */
export function clearPerformanceData(): void {
  performanceData.clear();
}

/**
 * Log performance report to console
 */
export function logPerformanceReport(): void {
  const report = getPerformanceReport();

  console.group('📊 Performance Report');
  console.table(
    report.map(m => ({
      Component: m.componentName,
      Renders: m.renderCount,
      'Avg Time (ms)': m.avgRenderTime.toFixed(2),
      'Last Time (ms)': m.lastRenderTime.toFixed(2),
      'Slow Renders': m.slowRenders,
      'Slow %': ((m.slowRenders / m.renderCount) * 100).toFixed(1) + '%',
    }))
  );
  console.groupEnd();
}

// Expose global helpers in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__performanceReport = logPerformanceReport;
  (window as any).__clearPerformance = clearPerformanceData;

  // Only log this once on initial load, not on every hot reload
  if (!(window as any).__perfMonitorInitialized) {
    (window as any).__perfMonitorInitialized = true;
    console.log('💡 Performance monitoring active. Run __performanceReport() to see metrics.');
  }
}
