'use client';

import React, { useState } from 'react';

export interface BridgeNoteSuggestion {
  title: string;
  purpose: string;
  contentOutline: string;
  suggestedTags: string[];
  suggestedLinks: string[];
  connectsClusters: string[][];
  improvementScore: number;
}

interface BridgeNoteSuggestionPanelProps {
  suggestion: BridgeNoteSuggestion;
  totalClusters: number;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
}

export default function BridgeNoteSuggestionPanel({
  suggestion,
  totalClusters,
  onAccept,
  onReject,
  onClose,
}: BridgeNoteSuggestionPanelProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    await onAccept();
    setIsAccepting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🌉 Bridge Note Suggestion
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Connect {totalClusters} disconnected clusters
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Improvement Score Banner */}
        <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              💡 Creating this note would improve connectivity by
            </span>
            <span className="text-2xl font-bold">{suggestion.improvementScore}%</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              SUGGESTED TITLE
            </h3>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {suggestion.title}
            </div>
          </div>

          {/* Purpose */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">PURPOSE</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{suggestion.purpose}</p>
          </div>

          {/* Clusters Connection */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              WOULD CONNECT
            </h3>
            <div className="space-y-3">
              {suggestion.connectsClusters.map((cluster, i) => (
                <div
                  key={i}
                  className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      CLUSTER {i + 1}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      ({cluster.length} notes)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cluster.map((noteName, j) => (
                      <span
                        key={j}
                        className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-2 py-1 rounded text-gray-700 dark:text-gray-300"
                      >
                        {noteName}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Outline */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              SUGGESTED CONTENT OUTLINE
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                {suggestion.contentOutline}
              </pre>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              SUGGESTED TAGS
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestion.suggestedTags.map((tag, i) => (
                <span
                  key={i}
                  className="text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              SUGGESTED LINKS
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
              <ul className="space-y-1">
                {suggestion.suggestedLinks.map((link, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                    • [[{link}]]
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Visualization */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-900 rounded border border-blue-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <span>📊</span>
              GRAPH VISUALIZATION
            </h3>
            <div className="flex items-center justify-center gap-8 py-6">
              {suggestion.connectsClusters.map((cluster, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white font-bold">
                      C{i + 1}
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {cluster.length} notes
                    </span>
                  </div>
                  {i < suggestion.connectsClusters.length - 1 && (
                    <div className="flex flex-col items-center">
                      <div className="text-2xl text-purple-500 dark:text-purple-400">←→</div>
                      <div className="w-12 h-12 rounded-lg bg-purple-500 dark:bg-purple-600 flex items-center justify-center text-white font-bold text-xs mt-2">
                        Bridge
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 This note will help unify your knowledge base
          </div>
          <div className="flex gap-3">
            <button
              onClick={onReject}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded font-medium transition-colors disabled:opacity-50"
            >
              {isAccepting ? 'Creating...' : '✓ Create Bridge Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
