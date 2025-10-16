'use client';

import React, { useState } from 'react';
import { X, Check, BookOpen, ChevronDown, ChevronUp, Zap, AlertCircle } from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';

interface MOCSuggestion {
  title: string;
  noteIds: string[];
  noteNames: string[];
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface MOCSuggestionsModalProps {
  suggestions: MOCSuggestion[];
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, noteIds: string[], reason: string) => Promise<void>;
  onCreateAll: () => Promise<void>;
}

export default function MOCSuggestionsModal({
  suggestions,
  isOpen,
  onClose,
  onCreate,
  onCreateAll,
}: MOCSuggestionsModalProps) {
  const { theme } = useSimpleTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [createdMOCs, setCreatedMOCs] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');

  if (!isOpen) return null;

  const filteredSuggestions = suggestions.filter(
    sug => filterPriority === 'all' || sug.priority === filterPriority
  );

  const handleCreate = async (sug: MOCSuggestion) => {
    try {
      setIsCreating(true);
      await onCreate(sug.title, sug.noteIds, sug.reason);
      setCreatedMOCs(prev => new Set(prev).add(sug.title));
    } catch (error) {
      console.error('Failed to create MOC:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateAll = async () => {
    try {
      setIsCreating(true);
      await onCreateAll();
      onClose();
    } catch (error) {
      console.error('Failed to create all MOCs:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getPriorityBgColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/30';
    }
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🔵';
    }
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
              <BookOpen className="w-6 h-6" />
              MOC Suggestions
            </h2>
            <p className="text-sm mt-1" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              AI-recommended Maps of Content to organize your knowledge base
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
            <label
              className="text-sm font-medium"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Priority:
            </label>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="px-3 py-1 rounded-lg border text-sm"
              style={{
                backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                color: theme === 'dark' ? '#f9fafb' : '#111827',
              }}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <span className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              ({filteredSuggestions.length} of {suggestions.length} shown)
            </span>
          </div>

          <button
            onClick={handleCreateAll}
            disabled={isCreating || filteredSuggestions.length === 0}
            className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
              color: '#ffffff',
            }}
          >
            <Zap className="w-4 h-4" />
            Create All ({filteredSuggestions.length})
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-3" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen
                className="w-12 h-12 mx-auto mb-4 opacity-30"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              />
              <p
                className="text-lg font-medium mb-2"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                No MOC suggestions match your filters
              </p>
              <p className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Try adjusting the priority filter or run analysis again
              </p>
            </div>
          ) : (
            filteredSuggestions.map((sug, index) => {
              const isExpanded = expandedIndex === index;
              const isCreated = createdMOCs.has(sug.title);

              return (
                <div
                  key={index}
                  className="rounded-lg border overflow-hidden transition-all"
                  style={{
                    backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    opacity: isCreated ? 0.6 : 1,
                  }}
                >
                  {/* MOC Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{getPriorityIcon(sug.priority)}</span>
                          <h3
                            className="font-semibold text-lg"
                            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                          >
                            {sug.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${getPriorityBgColor(sug.priority)}`}
                          >
                            <span className={getPriorityColor(sug.priority)}>
                              {sug.priority.toUpperCase()} PRIORITY
                            </span>
                          </span>
                          <span
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                            }}
                          >
                            {sug.noteNames.length} notes
                          </span>
                          {isCreated && (
                            <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Created
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isCreated && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleCreate(sug);
                            }}
                            disabled={isCreating}
                            className="px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            style={{
                              backgroundColor: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
                              color: '#ffffff',
                            }}
                          >
                            Create
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
                      <div className="pt-4 space-y-4">
                        {/* Reason */}
                        <div>
                          <p
                            className="text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                          >
                            <AlertCircle className="w-4 h-4" />
                            Why create this MOC?
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                          >
                            {sug.reason}
                          </p>
                        </div>

                        {/* Notes to Include */}
                        <div>
                          <p
                            className="text-sm font-medium mb-2"
                            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                          >
                            Notes to include ({sug.noteNames.length}):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {sug.noteNames.slice(0, 10).map((noteName, noteIndex) => (
                              <span
                                key={noteIndex}
                                className="text-xs px-2 py-1 rounded"
                                style={{
                                  backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                                  color: theme === 'dark' ? '#d1d5db' : '#374151',
                                }}
                              >
                                {noteName}
                              </span>
                            ))}
                            {sug.noteNames.length > 10 && (
                              <span
                                className="text-xs px-2 py-1 rounded font-medium"
                                style={{
                                  backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                                  color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                                }}
                              >
                                +{sug.noteNames.length - 10} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Info Box */}
                        <div
                          className="p-3 rounded-lg flex items-start gap-2"
                          style={{
                            backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
                            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                          }}
                        >
                          <AlertCircle
                            className="w-4 h-4 mt-0.5 flex-shrink-0"
                            style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }}
                          />
                          <p
                            className="text-xs"
                            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                          >
                            This will create a new note that serves as a hub, connecting all listed
                            notes with bidirectional links.
                          </p>
                        </div>
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
            Tip: High priority MOCs organize larger clusters of related notes
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
