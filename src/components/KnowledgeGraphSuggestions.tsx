'use client';

import { useState } from 'react';
import { X, Link2, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

interface Connection {
  source: string;
  target: string;
  sourceName: string;
  targetName: string;
  reason: string;
  similarity: number;
}

interface MOCSuggestion {
  title: string;
  noteIds: string[];
  noteNames: string[];
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface ConnectionSuggestionsProps {
  connections: Connection[];
  onApply: (connection: Connection) => Promise<void>;
  onApplyAll: (minConfidence?: number) => Promise<void>;
  onDismiss: () => void;
}

export function ConnectionSuggestions({
  connections,
  onApply,
  onApplyAll,
  onDismiss,
}: ConnectionSuggestionsProps) {
  const [applying, setApplying] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [minConfidence, setMinConfidence] = useState(0.7);

  const handleApply = async (connection: Connection) => {
    const key = `${connection.source}-${connection.target}`;
    setApplying(prev => new Set(prev).add(key));

    try {
      await onApply(connection);
      setApplied(prev => new Set(prev).add(key));
    } catch (error) {
      console.error('Failed to apply connection:', error);
    } finally {
      setApplying(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleApplyAll = async () => {
    setApplying(new Set(['all']));
    try {
      await onApplyAll(minConfidence);
      // Mark all as applied
      const allKeys = connections
        .filter(c => c.similarity >= minConfidence)
        .map(c => `${c.source}-${c.target}`);
      setApplied(new Set(allKeys));
    } catch (error) {
      console.error('Failed to apply all connections:', error);
    } finally {
      setApplying(new Set());
    }
  };

  const filteredConnections = connections.filter(c => c.similarity >= minConfidence);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center gap-3">
            <Link2 className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            <div>
              <h2 className="text-2xl font-bold">Hidden Connections Discovered</h2>
              <p className="text-sm opacity-70 mt-1">
                Found {connections.length} potential connection(s) • Showing{' '}
                {filteredConnections.length} above threshold
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div
          className="p-4 border-b flex items-center justify-between gap-4"
          style={{
            borderColor: 'var(--border-primary)',
            backgroundColor: 'var(--bg-tertiary)',
          }}
        >
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Min Confidence:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={minConfidence}
              onChange={e => setMinConfidence(parseFloat(e.target.value))}
              className="w-32"
            />
            <span className="text-sm font-mono">{(minConfidence * 100).toFixed(0)}%</span>
          </div>

          <button
            onClick={handleApplyAll}
            disabled={applying.has('all') || filteredConnections.length === 0}
            className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
            }}
            onMouseEnter={e => {
              if (!applying.has('all') && filteredConnections.length > 0) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {applying.has('all') ? 'Applying...' : `Apply All (${filteredConnections.length})`}
          </button>
        </div>

        {/* Suggestions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredConnections.length === 0 ? (
            <div className="text-center py-12 opacity-70">
              <AlertCircle className="w-12 h-12 mx-auto mb-3" />
              <p>No connections above the confidence threshold</p>
              <p className="text-sm mt-2">Try lowering the minimum confidence slider</p>
            </div>
          ) : (
            filteredConnections.map((connection, index) => {
              const key = `${connection.source}-${connection.target}`;
              const isApplying = applying.has(key) || applying.has('all');
              const isApplied = applied.has(key);

              return (
                <div
                  key={key}
                  className="rounded-lg p-4 border"
                  style={{
                    borderColor: 'var(--border-primary)',
                    backgroundColor: isApplied ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-tertiary)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono opacity-70">#{index + 1}</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{connection.sourceName}</span>
                          <Link2 className="w-4 h-4 opacity-50" />
                          <span className="font-semibold">{connection.targetName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor:
                              connection.similarity >= 0.8
                                ? 'rgba(16, 185, 129, 0.15)'
                                : connection.similarity >= 0.7
                                  ? 'rgba(234, 179, 8, 0.15)'
                                  : 'rgba(239, 68, 68, 0.15)',
                            color:
                              connection.similarity >= 0.8
                                ? '#10b981'
                                : connection.similarity >= 0.7
                                  ? '#eab308'
                                  : '#ef4444',
                          }}
                        >
                          {(connection.similarity * 100).toFixed(0)}% confidence
                        </div>
                      </div>

                      <p className="text-sm opacity-80">{connection.reason}</p>
                    </div>

                    <button
                      onClick={() => handleApply(connection)}
                      disabled={isApplying || isApplied}
                      className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                      style={{
                        backgroundColor: isApplied
                          ? 'var(--success-color)'
                          : 'var(--accent-primary)',
                        color: '#ffffff',
                      }}
                      onMouseEnter={e => {
                        if (!isApplying && !isApplied) {
                          e.currentTarget.style.opacity = '0.9';
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Applied
                        </>
                      ) : isApplying ? (
                        'Applying...'
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t text-sm opacity-70"
          style={{
            borderColor: 'var(--border-primary)',
            backgroundColor: 'var(--bg-tertiary)',
          }}
        >
          <p>
            💡 Tip: Connections are added to notes as wikilinks with context. You can remove them
            manually if needed.
          </p>
        </div>
      </div>
    </div>
  );
}

interface MOCSuggestionsProps {
  suggestions: MOCSuggestion[];
  onCreateMOC: (suggestion: MOCSuggestion) => Promise<void>;
  onCreateAll: () => Promise<void>;
  onDismiss: () => void;
}

export function MOCSuggestions({
  suggestions,
  onCreateMOC,
  onCreateAll,
  onDismiss,
}: MOCSuggestionsProps) {
  const [creating, setCreating] = useState<Set<string>>(new Set());
  const [created, setCreated] = useState<Set<string>>(new Set());

  const handleCreate = async (suggestion: MOCSuggestion) => {
    setCreating(prev => new Set(prev).add(suggestion.title));

    try {
      await onCreateMOC(suggestion);
      setCreated(prev => new Set(prev).add(suggestion.title));
    } catch (error) {
      console.error('Failed to create MOC:', error);
    } finally {
      setCreating(prev => {
        const next = new Set(prev);
        next.delete(suggestion.title);
        return next;
      });
    }
  };

  const handleCreateAll = async () => {
    setCreating(new Set(['all']));
    try {
      await onCreateAll();
      setCreated(new Set(suggestions.map(s => s.title)));
    } catch (error) {
      console.error('Failed to create all MOCs:', error);
    } finally {
      setCreating(new Set());
    }
  };

  const priorityColors = {
    high: {
      bg: 'rgba(239, 68, 68, 0.15)',
      text: '#ef4444',
    },
    medium: {
      bg: 'rgba(234, 179, 8, 0.15)',
      text: '#eab308',
    },
    low: {
      bg: 'rgba(59, 130, 246, 0.15)',
      text: '#3b82f6',
    },
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            <div>
              <h2 className="text-2xl font-bold">Maps of Content Suggestions</h2>
              <p className="text-sm opacity-70 mt-1">
                Found {suggestions.length} MOC opportunity(ies)
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div
          className="p-4 border-b flex items-center justify-end gap-4"
          style={{
            borderColor: 'var(--border-primary)',
            backgroundColor: 'var(--bg-tertiary)',
          }}
        >
          <button
            onClick={handleCreateAll}
            disabled={creating.has('all') || suggestions.length === 0}
            className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
            }}
            onMouseEnter={e => {
              if (!creating.has('all') && suggestions.length > 0) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {creating.has('all') ? 'Creating...' : `Create All MOCs (${suggestions.length})`}
          </button>
        </div>

        {/* Suggestions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {suggestions.map((suggestion, index) => {
            const isCreating = creating.has(suggestion.title) || creating.has('all');
            const isCreated = created.has(suggestion.title);
            const colors = priorityColors[suggestion.priority];

            return (
              <div
                key={suggestion.title}
                className="rounded-lg p-4 border"
                style={{
                  borderColor: 'var(--border-primary)',
                  backgroundColor: isCreated ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-tertiary)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-mono opacity-70">#{index + 1}</span>
                      <h3 className="text-lg font-bold">{suggestion.title}</h3>
                      <div
                        className="px-2 py-1 rounded text-xs font-medium uppercase"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                        }}
                      >
                        {suggestion.priority}
                      </div>
                    </div>

                    <p className="text-sm opacity-80 mb-3">{suggestion.reason}</p>

                    <div className="text-sm">
                      <p className="font-medium mb-1">
                        Would connect {suggestion.noteIds.length} notes:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.noteNames.slice(0, 8).map(name => (
                          <span
                            key={name}
                            className="px-2 py-1 rounded text-xs"
                            style={{
                              backgroundColor: 'var(--bg-secondary)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {name}
                          </span>
                        ))}
                        {suggestion.noteNames.length > 8 && (
                          <span className="px-2 py-1 text-xs opacity-70">
                            +{suggestion.noteNames.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCreate(suggestion)}
                    disabled={isCreating || isCreated}
                    className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                    style={{
                      backgroundColor: isCreated ? 'var(--success-color)' : 'var(--accent-primary)',
                      color: '#ffffff',
                    }}
                    onMouseEnter={e => {
                      if (!isCreating && !isCreated) {
                        e.currentTarget.style.opacity = '0.9';
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    {isCreated ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Created
                      </>
                    ) : isCreating ? (
                      'Creating...'
                    ) : (
                      'Create MOC'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t text-sm opacity-70"
          style={{
            borderColor: 'var(--border-primary)',
            backgroundColor: 'var(--bg-tertiary)',
          }}
        >
          <p>
            💡 Tip: MOC notes serve as hubs connecting related topics. You can customize them after
            creation.
          </p>
        </div>
      </div>
    </div>
  );
}

interface HealthReportProps {
  report: {
    totalNotes: number;
    totalLinks: number;
    healthScore: number;
    orphanCount: number;
    hubNotes: Array<{ id: string; name: string; connections: number }>;
    clusters: number;
    avgConnections: number;
  };
  onClose: () => void;
  onConnectOrphans?: () => void;
  onSuggestMOCs?: () => void;
}

export function HealthReport({
  report,
  onClose,
  onConnectOrphans,
  onSuggestMOCs,
}: HealthReportProps) {
  const getHealthColor = (score: number) => {
    if (score >= 90) return { bg: 'var(--success-color)', text: '#ffffff' };
    if (score >= 70) return { bg: 'var(--warning-color)', text: '#000000' };
    if (score >= 50) return { bg: 'rgba(239, 68, 68, 0.8)', text: '#ffffff' };
    return { bg: 'var(--error-color)', text: '#ffffff' };
  };

  const healthColor = getHealthColor(report.healthScore);
  const orphanPercent = (report.orphanCount / report.totalNotes) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="text-4xl">📊</div>
            <div>
              <h2 className="text-2xl font-bold">Knowledge Graph Health Report</h2>
              <p className="text-sm opacity-70 mt-1">
                {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Health Score */}
          <div className="text-center py-6">
            <div
              className="inline-block px-8 py-4 rounded-2xl text-6xl font-bold"
              style={{
                backgroundColor: healthColor.bg,
                color: healthColor.text,
              }}
            >
              {report.healthScore}%
            </div>
            <p className="text-lg mt-3 opacity-70">Overall Health Score</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              className="p-4 rounded-lg text-center"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-primary)',
                border: '1px solid',
              }}
            >
              <div className="text-3xl font-bold">{report.totalNotes}</div>
              <div className="text-sm opacity-70 mt-1">Total Notes</div>
            </div>

            <div
              className="p-4 rounded-lg text-center"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-primary)',
                border: '1px solid',
              }}
            >
              <div className="text-3xl font-bold">{report.totalLinks}</div>
              <div className="text-sm opacity-70 mt-1">Total Links</div>
            </div>

            <div
              className="p-4 rounded-lg text-center"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-primary)',
                border: '1px solid',
              }}
            >
              <div className="text-3xl font-bold">{report.avgConnections.toFixed(1)}</div>
              <div className="text-sm opacity-70 mt-1">Avg Connections</div>
            </div>

            <div
              className="p-4 rounded-lg text-center"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-primary)',
                border: '1px solid',
              }}
            >
              <div className="text-3xl font-bold">{report.clusters}</div>
              <div className="text-sm opacity-70 mt-1">Clusters</div>
            </div>
          </div>

          {/* Orphan Notes Section */}
          {report.orphanCount > 0 && (
            <div
              className="p-4 rounded-lg border"
              style={{
                borderColor:
                  orphanPercent > 20 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-primary)',
                backgroundColor:
                  orphanPercent > 20 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {orphanPercent > 20 ? (
                      <AlertCircle className="w-5 h-5" style={{ color: 'var(--error-color)' }} />
                    ) : null}
                    <h3 className="font-bold">Orphan Notes: {report.orphanCount}</h3>
                  </div>
                  <p className="text-sm opacity-80">
                    {orphanPercent.toFixed(1)}% of your notes have no connections
                  </p>
                </div>
                {onConnectOrphans && (
                  <button
                    onClick={onConnectOrphans}
                    className="px-4 py-2 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: '#ffffff',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    Connect Orphans
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Hub Notes */}
          {report.hubNotes.length > 0 && (
            <div>
              <h3 className="font-bold mb-3">🌟 Hub Notes (Highly Connected)</h3>
              <div className="space-y-2">
                {report.hubNotes.map(hub => (
                  <div
                    key={hub.id}
                    className="p-3 rounded-lg flex items-center justify-between"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-primary)',
                      border: '1px solid',
                    }}
                  >
                    <span className="font-medium">{hub.name}</span>
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: 'var(--success-color)',
                      }}
                    >
                      {hub.connections} connections
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--border-primary)',
              border: '1px solid',
            }}
          >
            <h3 className="font-bold mb-3">💡 Recommendations</h3>
            <div className="space-y-2 text-sm">
              {orphanPercent > 20 && (
                <div className="flex items-start gap-2">
                  <span>⚠️</span>
                  <p>High orphan count - Run "Connect Orphan Notes" to link isolated notes</p>
                </div>
              )}
              {report.clusters > 5 && onSuggestMOCs && (
                <div className="flex items-start gap-2">
                  <span>💡</span>
                  <div className="flex-1 flex items-center justify-between">
                    <p>Many clusters detected - Consider creating MOCs to organize related notes</p>
                    <button
                      onClick={onSuggestMOCs}
                      className="ml-2 px-3 py-1 rounded text-xs font-medium whitespace-nowrap"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: '#ffffff',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      Suggest MOCs
                    </button>
                  </div>
                </div>
              )}
              {report.avgConnections < 2 && (
                <div className="flex items-start gap-2">
                  <span>⚠️</span>
                  <p>Low connectivity - Add more wikilinks between related notes</p>
                </div>
              )}
              {orphanPercent <= 20 && report.clusters <= 5 && report.avgConnections >= 2 && (
                <div className="flex items-start gap-2">
                  <span>✅</span>
                  <p>Your knowledge graph is healthy! Keep up the good work.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t text-sm opacity-70"
          style={{
            borderColor: 'var(--border-primary)',
            backgroundColor: 'var(--bg-tertiary)',
          }}
        >
          <p>
            💡 Tip: Run health checks weekly to track your knowledge graph's growth and organization
          </p>
        </div>
      </div>
    </div>
  );
}
