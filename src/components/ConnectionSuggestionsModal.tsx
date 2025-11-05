'use client';

import { useState } from 'react';
import { X, Check, Link as LinkIcon, Filter, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';

interface ConnectionSuggestion {
  source: string;
  target: string;
  sourceName: string;
  targetName: string;
  reason: string;
  similarity: number;
}

interface ConnectionSuggestionsModalProps {
  connections: ConnectionSuggestion[];
  isOpen: boolean;
  onClose: () => void;
  onApply: (source: string, target: string, reason: string) => Promise<void>;
  onApplyAll: (minConfidence?: number) => Promise<void>;
}

export default function ConnectionSuggestionsModal({
  connections,
  isOpen,
  onClose,
  onApply,
  onApplyAll,
}: ConnectionSuggestionsModalProps) {
  const { theme } = useSimpleTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [filterConfidence, setFilterConfidence] = useState<number>(0.7);
  const [appliedConnections, setAppliedConnections] = useState<Set<string>>(new Set());
  const [isApplying, setIsApplying] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredConnections = connections.filter(conn => conn.similarity >= filterConfidence);

  const handleApply = async (conn: ConnectionSuggestion) => {
    try {
      setIsApplying(true);
      await onApply(conn.source, conn.target, conn.reason);
      setAppliedConnections(prev => new Set(prev).add(`${conn.source}-${conn.target}`));
    } catch (error) {
      console.error('Failed to apply connection:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplyAll = async () => {
    try {
      setIsApplying(true);
      await onApplyAll(filterConfidence);
      onClose();
    } catch (error) {
      console.error('Failed to apply all connections:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const getConfidenceColor = (similarity: number) => {
    if (similarity >= 0.8) return 'text-green-600 dark:text-green-400';
    if (similarity >= 0.7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getConfidenceBgColor = (similarity: number) => {
    if (similarity >= 0.8) return 'bg-green-100 dark:bg-green-900/30';
    if (similarity >= 0.7) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-orange-100 dark:bg-orange-900/30';
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
              <LinkIcon className="w-6 h-6" />
              Connection Suggestions
            </h2>
            <p className="text-sm mt-1" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              AI-discovered semantic connections between your notes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
          </button>
        </div>

        {/* Filters & Actions */}
        <div
          className="p-4 border-b flex items-center justify-between flex-wrap gap-3"
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb',
          }}
        >
          <div className="flex items-center gap-3">
            <Filter
              className="w-4 h-4"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            />
            <label
              className="text-sm font-medium"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Min Confidence:
            </label>
            <select
              value={filterConfidence}
              onChange={e => setFilterConfidence(Number(e.target.value))}
              className="px-3 py-1 rounded-lg border text-sm"
              style={{
                backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                color: theme === 'dark' ? '#f9fafb' : '#111827',
              }}
            >
              <option value="0.5">50%</option>
              <option value="0.6">60%</option>
              <option value="0.7">70%</option>
              <option value="0.8">80%</option>
              <option value="0.9">90%</option>
            </select>
            <span className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              ({filteredConnections.length} of {connections.length} shown)
            </span>
          </div>

          <button
            onClick={handleApplyAll}
            disabled={isApplying || filteredConnections.length === 0}
            className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
              color: '#ffffff',
            }}
          >
            <Zap className="w-4 h-4" />
            Apply All ({filteredConnections.length})
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-3" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          {filteredConnections.length === 0 ? (
            <div className="text-center py-12">
              <LinkIcon
                className="w-12 h-12 mx-auto mb-4 opacity-30"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              />
              <p
                className="text-lg font-medium mb-2"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                No connections match your filters
              </p>
              <p className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Try lowering the confidence threshold or run discovery again
              </p>
            </div>
          ) : (
            filteredConnections.map((conn, index) => {
              const isExpanded = expandedIndex === index;
              const isApplied = appliedConnections.has(`${conn.source}-${conn.target}`);
              const confidencePercent = Math.round(conn.similarity * 100);

              return (
                <div
                  key={index}
                  className="rounded-lg border overflow-hidden transition-all"
                  style={{
                    backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    opacity: isApplied ? 0.6 : 1,
                  }}
                >
                  {/* Connection Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="font-medium truncate"
                            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                            title={conn.sourceName}
                          >
                            {conn.sourceName}
                          </span>
                          <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>→</span>
                          <span
                            className="font-medium truncate"
                            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                            title={conn.targetName}
                          >
                            {conn.targetName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${getConfidenceBgColor(conn.similarity)}`}
                          >
                            <span className={getConfidenceColor(conn.similarity)}>
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
                      </div>

                      <div className="flex items-center gap-2">
                        {!isApplied && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleApply(conn);
                            }}
                            disabled={isApplying}
                            className="px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            style={{
                              backgroundColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
                              color: '#ffffff',
                            }}
                          >
                            Apply
                          </button>
                        )}
                        {isExpanded ? (
                          <ChevronUp
                            className="w-5 h-5"
                            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                          />
                        ) : (
                          <ChevronDown
                            className="w-5 h-5"
                            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div
                      className="px-4 pb-4 border-t"
                      style={{
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                      }}
                    >
                      <div className="pt-4">
                        <p
                          className="text-sm font-medium mb-2"
                          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                        >
                          Why this connection?
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                        >
                          {conn.reason}
                        </p>
                      </div>
                    </div>
                  )}
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
            Tip: Click a connection to see details, or use Apply All for batch operations
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
