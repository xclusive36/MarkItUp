'use client';

import React from 'react';
import { X, Pause, Play, StopCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';

interface ProgressItem {
  noteId: string;
  noteTitle: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  tagsAdded?: string[];
  error?: string;
}

interface BatchTaggingProgressProps {
  isOpen: boolean;
  onClose: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  items: ProgressItem[];
  currentIndex: number;
  isProcessing: boolean;
  isPaused: boolean;
  estimatedTimeRemaining?: number;
}

export default function BatchTaggingProgress({
  isOpen,
  onClose,
  onPause,
  onResume,
  onStop,
  items,
  currentIndex,
  isProcessing,
  isPaused,
  estimatedTimeRemaining,
}: BatchTaggingProgressProps) {
  const { theme } = useSimpleTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const totalItems = items.length;
  const completedCount = items.filter(item => item.status === 'completed').length;
  const errorCount = items.filter(item => item.status === 'error').length;
  const progress = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusIcon = (status: ProgressItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <div className={`w-4 h-4 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`
          w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-lg shadow-2xl
          ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}
        `}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Batch Tagging Progress</h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {isProcessing && !isPaused && (
                <>
                  Processing {currentIndex + 1} of {totalItems}
                </>
              )}
              {isPaused && (
                <>
                  Paused at {currentIndex + 1} of {totalItems}
                </>
              )}
              {!isProcessing && (
                <>
                  Completed: {completedCount} / {totalItems}
                </>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing && !isPaused}
            className={`
              p-2 rounded-lg transition-colors
              ${
                isProcessing && !isPaused
                  ? 'opacity-50 cursor-not-allowed'
                  : isDark
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-100'
              }
            `}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Overall Progress</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div
              className={`h-4 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {completedCount}
              </div>
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed
              </div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{errorCount}</div>
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Errors
              </div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalItems - completedCount - errorCount}
              </div>
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Remaining
              </div>
            </div>
          </div>

          {/* Time Estimate */}
          {isProcessing && estimatedTimeRemaining !== undefined && (
            <div
              className={`p-3 rounded-lg text-center ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}
            >
              <div className="text-sm">
                ⏱️ Estimated time remaining:{' '}
                <span className="font-semibold">{formatTime(estimatedTimeRemaining)}</span>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-2">
            {isProcessing && !isPaused && onPause && (
              <button
                onClick={onPause}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
                  ${
                    isDark
                      ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  }
                `}
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            )}
            {isPaused && onResume && (
              <button
                onClick={onResume}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
                  ${
                    isDark
                      ? 'bg-green-600 hover:bg-green-500 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }
                `}
              >
                <Play className="w-4 h-4" />
                Resume
              </button>
            )}
            {isProcessing && onStop && (
              <button
                onClick={onStop}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
                  ${
                    isDark
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }
                `}
              >
                <StopCircle className="w-4 h-4" />
                Stop
              </button>
            )}
          </div>
        </div>

        {/* Items List */}
        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="max-h-[300px] overflow-y-auto">
            {items.map(item => (
              <div
                key={item.noteId}
                className={`
                  p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}
                  ${item.status === 'processing' ? (isDark ? 'bg-blue-900/20' : 'bg-blue-50') : ''}
                  transition-colors
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getStatusIcon(item.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{item.noteTitle}</span>
                      {item.status === 'processing' && (
                        <span
                          className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}
                        >
                          Processing...
                        </span>
                      )}
                    </div>
                    {item.tagsAdded && item.tagsAdded.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tagsAdded.map(tag => (
                          <span
                            key={tag}
                            className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.error && (
                      <div className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        Error: {item.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
