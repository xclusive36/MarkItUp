'use client';

import React, { useState } from 'react';
import { usePerformanceTracker } from '@/hooks/usePerformanceTracker';
import {
  Activity,
  Download,
  Trash2,
  Play,
  Pause,
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';

interface PerformanceMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PerformanceMonitor({ isOpen, onClose }: PerformanceMonitorProps) {
  const { stats, isTracking, start, stop, clear, exportData, getReport } =
    usePerformanceTracker(1000);
  const [sortBy, setSortBy] = useState<'avg' | 'count' | 'p95'>('avg');
  const [filterText, setFilterText] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportReport = () => {
    const report = getReport();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter and sort stats
  const filteredStats = stats
    .filter(s => s.operation.toLowerCase().includes(filterText.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'avg':
          return b.avg - a.avg;
        case 'count':
          return b.count - a.count;
        case 'p95':
          return b.p95 - a.p95;
        default:
          return 0;
      }
    });

  // Calculate totals
  const totalOps = filteredStats.reduce((sum, s) => sum + s.count, 0);
  const avgOfAvgs =
    filteredStats.length > 0
      ? filteredStats.reduce((sum, s) => sum + s.avg, 0) / filteredStats.length
      : 0;

  // Find slow operations
  const slowOps = filteredStats.filter(s => s.avg > 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Performance Monitor
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Real-time application performance metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 items-center">
          <button
            onClick={isTracking ? stop : start}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isTracking
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isTracking ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start
              </>
            )}
          </button>

          <button
            onClick={clear}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>

          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>

          <input
            type="text"
            placeholder="Filter operations..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            className="ml-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Summary Cards */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
              Total Operations
            </div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {totalOps.toLocaleString()}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
              Avg Duration
            </div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {avgOfAvgs.toFixed(1)}ms
            </div>
          </div>

          <div
            className={`${
              slowOps.length > 0
                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
            } border rounded-lg p-4`}
          >
            <div
              className={`text-sm font-medium mb-1 ${
                slowOps.length > 0
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Slow Operations
            </div>
            <div
              className={`text-3xl font-bold ${
                slowOps.length > 0
                  ? 'text-orange-900 dark:text-orange-100'
                  : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {slowOps.length}
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="px-4 pb-2 flex gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Sort by:</span>
          {(['avg', 'count', 'p95'] as const).map(sort => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                sortBy === sort
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {sort.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Metrics Table */}
        <div className="flex-1 overflow-auto px-4 pb-4">
          {filteredStats.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {filterText ? 'No operations match your filter' : 'No metrics collected yet'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Operation
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Count
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Avg (ms)
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Min (ms)
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Max (ms)
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    P95 (ms)
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    P99 (ms)
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStats.map(stat => {
                  const isSlow = stat.avg > 100;
                  const isVerySlow = stat.avg > 500;

                  return (
                    <tr
                      key={stat.operation}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-900/50 ${
                        isSlow ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-sm text-gray-900 dark:text-white">
                        {stat.operation}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                        {stat.count.toLocaleString()}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-semibold ${
                          isVerySlow
                            ? 'text-red-600 dark:text-red-400'
                            : isSlow
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {stat.avg.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                        {stat.min.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                        {stat.max.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                        {stat.p95.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                        {stat.p99.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isVerySlow ? (
                          <div className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-xs font-medium">Very Slow</span>
                          </div>
                        ) : isSlow ? (
                          <div className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs font-medium">Slow</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-medium">Good</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
