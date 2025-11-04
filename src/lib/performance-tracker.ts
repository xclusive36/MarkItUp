/**
 * Performance Tracker - Real-time application performance monitoring
 *
 * Tracks operation durations, calculates statistics (avg, p95, p99),
 * and provides insights into application performance.
 *
 * @example
 * ```typescript
 * const tracker = PerformanceTracker.getInstance();
 *
 * // Track an operation
 * const endTracking = tracker.startTracking('markdown-render');
 * // ... do work ...
 * endTracking();
 *
 * // Get statistics
 * const stats = tracker.getStats('markdown-render');
 * console.log(`Avg: ${stats.avg}ms, P95: ${stats.p95}ms`);
 * ```
 */

export interface PerformanceStats {
  operation: string;
  count: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
  total: number;
  lastDuration?: number;
  lastExecuted?: Date;
}

export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, number[]> = new Map();
  private detailedMetrics: Map<string, PerformanceMetric[]> = new Map();
  private maxMetricsPerOperation = 1000; // Keep last 1000 measurements
  private listeners: Map<string, Array<(metric: PerformanceMetric) => void>> = new Map();

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  /**
   * Start tracking an operation
   * Returns a function to call when the operation completes
   */
  startTracking(operation: string, metadata?: Record<string, any>): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.track(operation, duration, metadata);
    };
  }

  /**
   * Track a single operation duration
   */
  track(operation: string, duration: number, metadata?: Record<string, any>): void {
    // Add to simple metrics array
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    const durations = this.metrics.get(operation)!;
    durations.push(duration);

    // Limit size to prevent memory growth
    if (durations.length > this.maxMetricsPerOperation) {
      durations.shift();
    }

    // Add to detailed metrics
    if (!this.detailedMetrics.has(operation)) {
      this.detailedMetrics.set(operation, []);
    }

    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: new Date(),
      metadata,
    };

    const detailed = this.detailedMetrics.get(operation)!;
    detailed.push(metric);

    // Limit detailed metrics
    if (detailed.length > this.maxMetricsPerOperation) {
      detailed.shift();
    }

    // Notify listeners
    this.notifyListeners(operation, metric);

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.warn(
        `[Performance] Slow operation: ${operation} took ${duration.toFixed(2)}ms`,
        metadata
      );
    }
  }

  /**
   * Get statistics for an operation
   */
  getStats(operation: string): PerformanceStats | null {
    const durations = this.metrics.get(operation);
    const detailed = this.detailedMetrics.get(operation);

    if (!durations || durations.length === 0) {
      return null;
    }

    const sorted = [...durations].sort((a, b) => a - b);
    const sum = durations.reduce((acc, val) => acc + val, 0);

    return {
      operation,
      count: durations.length,
      avg: sum / durations.length,
      min: sorted[0] ?? 0,
      max: sorted[sorted.length - 1] ?? 0,
      p50: this.percentile(sorted, 50),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99),
      total: sum,
      lastDuration: detailed?.[detailed.length - 1]?.duration,
      lastExecuted: detailed?.[detailed.length - 1]?.timestamp,
    };
  }

  /**
   * Get all tracked operations
   */
  getAllOperations(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Get all statistics
   */
  getAllStats(): PerformanceStats[] {
    return this.getAllOperations()
      .map(op => this.getStats(op))
      .filter((stats): stats is PerformanceStats => stats !== null);
  }

  /**
   * Get detailed metrics for an operation
   */
  getDetailedMetrics(operation: string): PerformanceMetric[] {
    return this.detailedMetrics.get(operation) || [];
  }

  /**
   * Clear metrics for a specific operation
   */
  clearOperation(operation: string): void {
    this.metrics.delete(operation);
    this.detailedMetrics.delete(operation);
  }

  /**
   * Clear all metrics
   */
  clearAll(): void {
    this.metrics.clear();
    this.detailedMetrics.clear();
  }

  /**
   * Subscribe to performance metrics for an operation
   */
  subscribe(operation: string, callback: (metric: PerformanceMetric) => void): () => void {
    if (!this.listeners.has(operation)) {
      this.listeners.set(operation, []);
    }

    this.listeners.get(operation)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(operation);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Export metrics as JSON
   */
  export(): string {
    const data = {
      timestamp: new Date().toISOString(),
      stats: this.getAllStats(),
      detailedMetrics: Object.fromEntries(this.detailedMetrics),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Get performance report as markdown
   */
  getReport(): string {
    const stats = this.getAllStats();

    if (stats.length === 0) {
      return '# Performance Report\n\nNo metrics collected yet.';
    }

    let markdown = '# Performance Report\n\n';
    markdown += `Generated: ${new Date().toLocaleString()}\n\n`;
    markdown += '## Summary\n\n';
    markdown += `Total Operations Tracked: ${stats.length}\n\n`;
    markdown += '## Detailed Metrics\n\n';
    markdown += '| Operation | Count | Avg (ms) | Min (ms) | Max (ms) | P95 (ms) | P99 (ms) |\n';
    markdown += '|-----------|-------|----------|----------|----------|----------|----------|\n';

    // Sort by average duration (slowest first)
    const sorted = stats.sort((a, b) => b.avg - a.avg);

    sorted.forEach(stat => {
      markdown += `| ${stat.operation} | ${stat.count} | ${stat.avg.toFixed(2)} | ${stat.min.toFixed(2)} | ${stat.max.toFixed(2)} | ${stat.p95.toFixed(2)} | ${stat.p99.toFixed(2)} |\n`;
    });

    // Add warnings for slow operations
    const slowOps = sorted.filter(s => s.avg > 100);
    if (slowOps.length > 0) {
      markdown += '\n## ⚠️ Slow Operations (>100ms average)\n\n';
      slowOps.forEach(op => {
        markdown += `- **${op.operation}**: ${op.avg.toFixed(2)}ms average\n`;
      });
    }

    return markdown;
  }

  /**
   * Calculate percentile
   */
  private percentile(sortedArray: number[], p: number): number {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil((p / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)] ?? 0;
  }

  /**
   * Notify listeners of new metric
   */
  private notifyListeners(operation: string, metric: PerformanceMetric): void {
    const callbacks = this.listeners.get(operation);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(metric);
        } catch (error) {
          console.error('[PerformanceTracker] Error in listener callback:', error);
        }
      });
    }
  }

  /**
   * Set maximum number of metrics to keep per operation
   */
  setMaxMetrics(max: number): void {
    this.maxMetricsPerOperation = Math.max(100, max); // Min 100
  }
}

// Helper functions for easy tracking

/**
 * Track a synchronous function
 */
export function trackSync<T>(operation: string, fn: () => T): T {
  const tracker = PerformanceTracker.getInstance();
  const end = tracker.startTracking(operation);
  try {
    return fn();
  } finally {
    end();
  }
}

/**
 * Track an asynchronous function
 */
export async function trackAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  const tracker = PerformanceTracker.getInstance();
  const end = tracker.startTracking(operation);
  try {
    return await fn();
  } finally {
    end();
  }
}

/**
 * Decorator for tracking class methods
 */
export function tracked(operation?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const opName = operation || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      const tracker = PerformanceTracker.getInstance();
      const end = tracker.startTracking(opName);
      try {
        const result = originalMethod.apply(this, args);

        // Handle async methods
        if (result instanceof Promise) {
          return result.finally(end);
        }

        end();
        return result;
      } catch (error) {
        end();
        throw error;
      }
    };

    return descriptor;
  };
}

// Export singleton instance
export const performanceTracker = PerformanceTracker.getInstance();
