'use client';

import React, { useState } from 'react';
import { X, Check, Tag, Sparkles, Info } from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';

export interface TagSuggestion {
  tag: string;
  confidence: number;
  reason?: string;
}

interface TagSuggestionsPanelProps {
  noteName: string;
  currentTags: string[];
  suggestions: TagSuggestion[];
  analysis: {
    summary: string;
    keyTopics: string[];
  };
  isOpen: boolean;
  onClose: () => void;
  onApply: (tags: string[]) => Promise<void>;
  onApplyAll: () => Promise<void>;
}

export default function TagSuggestionsPanel({
  noteName,
  currentTags,
  suggestions,
  analysis,
  isOpen,
  onClose,
  onApply,
  onApplyAll,
}: TagSuggestionsPanelProps) {
  const { theme } = useSimpleTheme();
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [appliedTags, setAppliedTags] = useState<Set<string>>(new Set());
  const [isApplying, setIsApplying] = useState(false);
  const [minConfidence, setMinConfidence] = useState(0.6);

  if (!isOpen) return null;

  const filteredSuggestions = suggestions.filter(s => s.confidence >= minConfidence);

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const handleApplySelected = async () => {
    if (selectedTags.size === 0) return;

    setIsApplying(true);
    try {
      await onApply(Array.from(selectedTags));
      setAppliedTags(new Set([...appliedTags, ...selectedTags]));
      setSelectedTags(new Set());
    } catch (error) {
      console.error('Failed to apply tags:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplyAll = async () => {
    setIsApplying(true);
    try {
      await onApplyAll();
      onClose();
    } catch (error) {
      console.error('Failed to apply all tags:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.7) return 'text-blue-600 dark:text-blue-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const getConfidenceBgColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 dark:bg-green-900/30';
    if (confidence >= 0.7) return 'bg-blue-100 dark:bg-blue-900/30';
    return 'bg-yellow-100 dark:bg-yellow-900/30';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-3xl max-h-[90vh] rounded-lg shadow-2xl overflow-hidden"
        style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb',
          }}
        >
          <div>
            <h2
              className="text-2xl font-bold flex items-center gap-2"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              <Tag className="w-6 h-6" />
              Tag Suggestions
            </h2>
            <p className="text-sm mt-1" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              for &quot;{noteName}&quot;
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
          </button>
        </div>

        {/* AI Analysis Section */}
        <div
          className="p-4 border-b"
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb',
          }}
        >
          <div className="flex items-start gap-2 mb-3">
            <Sparkles
              className="w-5 h-5 mt-0.5 flex-shrink-0"
              style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }}
            />
            <div className="flex-1">
              <h3
                className="font-semibold mb-1"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                AI Analysis Summary
              </h3>
              <p className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                {analysis.summary}
              </p>
            </div>
          </div>

          {analysis.keyTopics.length > 0 && (
            <div>
              <p
                className="text-xs font-medium mb-2"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                Key Topics:
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.keyTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      color: theme === 'dark' ? '#d1d5db' : '#374151',
                    }}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Current Tags Section */}
        {currentTags.length > 0 && (
          <div
            className="p-4 border-b"
            style={{
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            }}
          >
            <p
              className="text-sm font-medium mb-2"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Current Tags ({currentTags.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {currentTags.map((tag, index) => (
                <span
                  key={index}
                  className="text-sm px-3 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: theme === 'dark' ? '#065f46' : '#d1fae5',
                    color: theme === 'dark' ? '#d1fae5' : '#065f46',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb',
          }}
        >
          <div className="flex items-center gap-3">
            <label
              className="text-sm font-medium"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Min Confidence:
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={minConfidence}
              onChange={e => setMinConfidence(parseFloat(e.target.value))}
              className="w-32"
            />
            <span
              className="text-sm font-mono"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              {(minConfidence * 100).toFixed(0)}%
            </span>
            <span className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              ({filteredSuggestions.length} of {suggestions.length} shown)
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleApplySelected}
              disabled={isApplying || selectedTags.size === 0}
              className="px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
                color: '#ffffff',
              }}
            >
              Apply Selected ({selectedTags.size})
            </button>
            <button
              onClick={handleApplyAll}
              disabled={isApplying || filteredSuggestions.length === 0}
              className="px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
                color: '#ffffff',
              }}
            >
              Apply All ({filteredSuggestions.length})
            </button>
          </div>
        </div>

        {/* Suggestions List */}
        <div className="overflow-y-auto p-6 space-y-3" style={{ maxHeight: 'calc(90vh - 400px)' }}>
          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-12">
              <Info
                className="w-12 h-12 mx-auto mb-4 opacity-30"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              />
              <p
                className="text-lg font-medium mb-2"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                No tag suggestions match your filters
              </p>
              <p className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Try lowering the confidence threshold or run analysis again
              </p>
            </div>
          ) : (
            filteredSuggestions.map((suggestion, index) => {
              const isSelected = selectedTags.has(suggestion.tag);
              const isApplied = appliedTags.has(suggestion.tag);
              const confidencePercent = Math.round(suggestion.confidence * 100);

              return (
                <div
                  key={index}
                  className="rounded-lg border p-4 transition-all cursor-pointer"
                  style={{
                    backgroundColor: isApplied
                      ? theme === 'dark'
                        ? '#064e3b'
                        : '#d1fae5'
                      : isSelected
                        ? theme === 'dark'
                          ? '#1e3a8a'
                          : '#dbeafe'
                        : theme === 'dark'
                          ? '#111827'
                          : '#ffffff',
                    borderColor: isSelected
                      ? theme === 'dark'
                        ? '#3b82f6'
                        : '#2563eb'
                      : theme === 'dark'
                        ? '#374151'
                        : '#e5e7eb',
                    opacity: isApplied ? 0.6 : 1,
                  }}
                  onClick={() => !isApplied && handleToggleTag(suggestion.tag)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isApplied}
                        onChange={() => handleToggleTag(suggestion.tag)}
                        onClick={e => e.stopPropagation()}
                        className="mt-1 w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="font-semibold text-lg"
                            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                          >
                            #{suggestion.tag}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${getConfidenceBgColor(suggestion.confidence)}`}
                          >
                            <span className={getConfidenceColor(suggestion.confidence)}>
                              {confidencePercent}% confidence
                            </span>
                          </span>
                          {isApplied && (
                            <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Applied
                            </span>
                          )}
                        </div>
                        {suggestion.reason && (
                          <p
                            className="text-sm"
                            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                          >
                            {suggestion.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between p-4 border-t"
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb',
          }}
        >
          <p className="text-xs" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
            💡 Tip: Click tags to select/deselect, or use Apply All for quick tagging
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              color: theme === 'dark' ? '#f9fafb' : '#111827',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
