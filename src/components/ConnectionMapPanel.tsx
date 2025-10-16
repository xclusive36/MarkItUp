'use client';

import React from 'react';

export interface HubNote {
  id: string;
  name: string;
  connections: number;
}

export interface OrphanNote {
  id: string;
  name: string;
}

interface ConnectionMapPanelProps {
  totalNotes: number;
  totalLinks: number;
  averageConnections: number;
  hubNotes: HubNote[];
  orphanNotes: OrphanNote[];
  onFindLinksForOrphan?: (noteId: string) => void;
  onBatchAnalyzeOrphans?: () => Promise<void>;
  onClose: () => void;
}

export default function ConnectionMapPanel({
  totalNotes,
  totalLinks,
  averageConnections,
  hubNotes,
  orphanNotes,
  onFindLinksForOrphan,
  onBatchAnalyzeOrphans,
  onClose,
}: ConnectionMapPanelProps) {
  const [isBatchAnalyzing, setIsBatchAnalyzing] = React.useState(false);

  const handleBatchAnalyze = async () => {
    if (!onBatchAnalyzeOrphans) return;
    setIsBatchAnalyzing(true);
    try {
      await onBatchAnalyzeOrphans();
    } finally {
      setIsBatchAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🗺️ Knowledge Base Connection Map
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Visualize your knowledge graph
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

        {/* Stats Overview */}
        <div className="px-6 py-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {totalNotes}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mt-1 font-medium">
                Total Notes
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                {totalLinks}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mt-1 font-medium">
                Total Links
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                {averageConnections.toFixed(1)}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mt-1 font-medium">
                Avg Connections/Note
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-8">
            {/* Hub Notes */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">🌟 Hub Notes</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">(Most Connected)</span>
              </div>

              {hubNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  No hub notes yet. Start connecting your notes!
                </div>
              ) : (
                <div className="space-y-3">
                  {hubNotes.map((note, index) => {
                    const barWidth = (note.connections / hubNotes[0].connections) * 100;
                    return (
                      <div
                        key={note.id}
                        className="p-4 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/30 dark:to-transparent rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              #{index + 1}
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {note.name}
                            </span>
                          </div>
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {note.connections}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {note.connections} connections
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Orphan Notes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    🔍 Orphan Notes
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">(No Connections)</span>
                </div>
                {onBatchAnalyzeOrphans && orphanNotes.length > 0 && (
                  <button
                    onClick={handleBatchAnalyze}
                    disabled={isBatchAnalyzing}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    {isBatchAnalyzing ? (
                      <>
                        <span className="animate-spin">⚡</span>
                        Analyzing {orphanNotes.length} notes...
                      </>
                    ) : (
                      <>
                        <span>🔍</span>
                        Find Links for All Orphans
                      </>
                    )}
                  </button>
                )}
              </div>

              {orphanNotes.length === 0 ? (
                <div className="text-center py-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-green-700 dark:text-green-300 font-semibold">
                    Great job! No orphan notes found.
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    All your notes are connected to your knowledge base
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>💡 Tip:</strong> Use &quot;Find Link Opportunities&quot; on these
                      notes to connect them to your knowledge base.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {orphanNotes.map((note, index) => (
                      <div
                        key={note.id}
                        className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                              {index + 1}.
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white font-medium">
                              {note.name}
                            </span>
                          </div>
                          {onFindLinksForOrphan && (
                            <button
                              onClick={() => onFindLinksForOrphan(note.id)}
                              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                            >
                              Find Links
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Health Score */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-900 rounded-lg border border-purple-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>📊</span>
                Knowledge Base Health
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">Connectivity</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Math.min(100, Math.round((totalLinks / totalNotes) * 20))}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((totalLinks / totalNotes) * 20))}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">Coverage</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Math.round(((totalNotes - orphanNotes.length) / totalNotes) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-600 to-emerald-600 h-3 rounded-full transition-all"
                      style={{
                        width: `${Math.round(((totalNotes - orphanNotes.length) / totalNotes) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Recommendations:</strong>
                  </p>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 mt-2 space-y-1 list-disc list-inside">
                    {averageConnections < 2 && (
                      <li>Increase connections per note (aim for 2-5 links per note)</li>
                    )}
                    {orphanNotes.length > totalNotes * 0.1 && (
                      <li>Connect orphan notes to reduce isolation</li>
                    )}
                    {hubNotes.length < 3 && totalNotes > 10 && (
                      <li>Create hub notes to organize related concepts</li>
                    )}
                    {averageConnections >= 3 && orphanNotes.length < totalNotes * 0.1 && (
                      <li>Excellent! Your knowledge base is well-connected</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            💡 A well-connected knowledge base improves discoverability
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
