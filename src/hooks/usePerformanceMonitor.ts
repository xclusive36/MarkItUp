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

    // Log slow renders in development
    if (renderTime > 16) {
      console.warn(
        `⚠️ Slow render detected in ${componentName}:`,
        `${renderTime.toFixed(2)}ms (${renderCount.current} total renders)`
      );
    }

    // Log every 10 renders
    if (renderCount.current % 10 === 0) {
      console.log(
        `📊 ${componentName} performance:`,
        `${renderCount.current} renders,`,
        `avg: ${metrics.avgRenderTime.toFixed(2)}ms,`,
        `slow: ${metrics.slowRenders} (${((metrics.slowRenders / renderCount.current) * 100).toFixed(1)}%)`
      );
    }
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

  console.log('💡 Performance monitoring active. Run __performanceReport() to see metrics.');
}
