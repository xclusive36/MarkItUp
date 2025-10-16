'use client';

import React from 'react';

interface LinkSuggesterStatusProps {
  isRealtimeEnabled: boolean;
  isAnalyzing: boolean;
  onToggle: () => void;
}

export default function LinkSuggesterStatus({
  isRealtimeEnabled,
  isAnalyzing,
  onToggle,
}: LinkSuggesterStatusProps) {
  if (!isRealtimeEnabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all transform hover:scale-105 ${
          isAnalyzing
            ? 'bg-blue-600 text-white animate-pulse'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
        title="Click to toggle real-time suggestions"
      >
        {isAnalyzing ? (
          <>
            <span className="animate-spin">⚡</span>
            <span className="text-sm font-medium">Analyzing...</span>
          </>
        ) : (
          <>
            <span>⚡</span>
            <span className="text-sm font-medium">Real-time: ON</span>
          </>
        )}
      </button>
    </div>
  );
}
