'use client';

import React, { useState } from 'react';

export interface StructureSuggestion {
  id: string;
  category: 'organization' | 'missing' | 'merge' | 'split' | 'reorder';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  action?: () => Promise<void>;
}

interface StructureSuggestionsPanelProps {
  documentName: string;
  assessment: string;
  suggestions: StructureSuggestion[];
  keyTopics: string[];
  onClose: () => void;
  onApplySuggestion?: (suggestion: StructureSuggestion) => Promise<void>;
  onExport?: () => void;
}

export default function StructureSuggestionsPanel({
  documentName,
  assessment,
  suggestions,
  keyTopics,
  onClose,
  onApplySuggestion,
  onExport,
}: StructureSuggestionsPanelProps) {
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const handleApply = async (suggestion: StructureSuggestion) => {
    if (!onApplySuggestion || !suggestion.actionable) return;

    setApplyingId(suggestion.id);
    try {
      await onApplySuggestion(suggestion);
      setAppliedIds(prev => new Set(prev).add(suggestion.id));
    } catch (error) {
      console.error('Error applying suggestion:', error);
    } finally {
      setApplyingId(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'organization':
        return '📋';
      case 'missing':
        return '➕';
      case 'merge':
        return '🔄';
      case 'split':
        return '✂️';
      case 'reorder':
        return '↕️';
      default:
        return '📌';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'organization':
        return 'blue';
      case 'missing':
        return 'green';
      case 'merge':
        return 'purple';
      case 'split':
        return 'orange';
      case 'reorder':
        return 'indigo';
      default:
        return 'gray';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'high':
        return '🔴 High Impact';
      case 'medium':
        return '🟡 Medium Impact';
      case 'low':
        return '🟢 Low Impact';
      default:
        return 'Impact';
    }
  };

  const stats = {
    total: suggestions.length,
    highImpact: suggestions.filter(s => s.impact === 'high').length,
    actionable: suggestions.filter(s => s.actionable).length,
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📋 Structure Analysis
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              for &quot;{documentName}&quot;
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

        {/* Stats Bar */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-gray-700 dark:text-gray-300">
                <strong>{stats.total}</strong> suggestions
              </span>
              <span className="text-red-600 dark:text-red-400">
                <strong>{stats.highImpact}</strong> high impact
              </span>
              <span className="text-blue-600 dark:text-blue-400">
                <strong>{stats.actionable}</strong> actionable
              </span>
            </div>
            {onExport && (
              <button
                onClick={onExport}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
              >
                📥 Export Report
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Overall Assessment */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📊 Overall Assessment
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {assessment}
            </p>
          </div>

          {/* Key Topics */}
          {keyTopics.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                🎯 Key Topics Identified:
              </h3>
              <div className="flex flex-wrap gap-2">
                {keyTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              💡 Specific Suggestions:
            </h3>
            {suggestions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No specific suggestions - your document structure looks good!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map(suggestion => {
                  const color = getCategoryColor(suggestion.category);
                  const isApplied = appliedIds.has(suggestion.id);
                  const isApplying = applyingId === suggestion.id;

                  return (
                    <div
                      key={suggestion.id}
                      className={`border rounded-lg p-4 transition-all ${
                        isApplied
                          ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{getCategoryIcon(suggestion.category)}</span>
                            <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                              {suggestion.title}
                            </h4>
                            <span
                              className={`text-xs px-2 py-1 rounded bg-${color}-100 dark:bg-${color}-900 text-${color}-800 dark:text-${color}-200`}
                            >
                              {suggestion.category}
                            </span>
                          </div>

                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {suggestion.description}
                          </p>

                          <div className="flex items-center gap-3">
                            <span
                              className={`text-xs font-medium ${getImpactColor(suggestion.impact)}`}
                            >
                              {getImpactLabel(suggestion.impact)}
                            </span>
                            {isApplied && (
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                ✓ Applied
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        {suggestion.actionable && !isApplied && (
                          <button
                            onClick={() => handleApply(suggestion)}
                            disabled={isApplying}
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                              suggestion.impact === 'high'
                                ? 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white'
                                : suggestion.impact === 'medium'
                                  ? 'bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white'
                                  : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white'
                            }`}
                          >
                            {isApplying ? '⏳ Applying...' : '✓ Apply'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            💡 High impact suggestions can significantly improve your document
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
