'use client';

import React, { useEffect, useState } from 'react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import {
  TrendingUp,
  Download,
  Network,
  AlertCircle,
  Activity,
  Layers,
  Link2,
  Calendar,
  BarChart3,
} from 'lucide-react';

interface AdvancedAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AnalyticsData {
  stats: {
    totalNotes: number;
    totalLinks: number;
    avgConnections: number;
    maxConnections: number;
    orphanCount: number;
  };
  healthMetrics: {
    healthScore: number;
    connectivity: number;
    avgConnections: number;
    clusterCount: number;
    gapCount: number;
    orphanCount: number;
  };
  clusters: Array<{
    id: string;
    label: string;
    size: number;
    density: number;
    nodeCount: number;
  }>;
  coverageGaps: Array<{
    type: string;
    identifier: string;
    suggestions: string[];
  }>;
  temporalAnalysis: {
    notesByDate: Record<string, number>;
    linksByDate: Record<string, number>;
    totalDays: number;
    avgNotesPerDay: number;
    avgLinksPerDay: number;
  };
  bridgeNotes: Array<{
    noteId: string;
    noteName: string;
    connectsClusters: string[];
    bridgeStrength: number;
  }>;
  timestamp: string;
}

export default function AdvancedAnalytics({ isOpen, onClose }: AdvancedAnalyticsProps) {
  const { theme } = useSimpleTheme();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/graph/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!analytics) return;

    const csv = `Knowledge Graph Analytics Report
Generated: ${new Date(analytics.timestamp).toLocaleString()}

=== Summary Statistics ===
Total Notes,${analytics.stats.totalNotes}
Total Links,${analytics.stats.totalLinks}
Average Connections,${analytics.stats.avgConnections}
Max Connections,${analytics.stats.maxConnections}
Orphan Notes,${analytics.stats.orphanCount}

=== Health Metrics ===
Health Score,${analytics.healthMetrics.healthScore}/100
Connectivity,${analytics.healthMetrics.connectivity}%
Cluster Count,${analytics.healthMetrics.clusterCount}
Coverage Gaps,${analytics.healthMetrics.gapCount}

=== Top Clusters ===
${analytics.clusters.map((c, i) => `${i + 1}. ${c.label},${c.nodeCount} notes,${(c.density * 100).toFixed(1)}% density`).join('\n')}

=== Bridge Notes (Connection Hubs) ===
${analytics.bridgeNotes.map((b, i) => `${i + 1}. ${b.noteName},Connects ${b.connectsClusters.length} clusters,Strength: ${b.bridgeStrength}`).join('\n')}

=== Coverage Gaps ===
${analytics.coverageGaps.map((g, i) => `${i + 1}. ${g.type}: ${g.identifier}`).join('\n')}
`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-graph-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return theme === 'dark' ? '#10b981' : '#059669';
    if (score >= 60) return theme === 'dark' ? '#f59e0b' : '#d97706';
    return theme === 'dark' ? '#ef4444' : '#dc2626';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-6 border-b"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Advanced Graph Analytics
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Comprehensive insights into your knowledge graph structure and health
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              disabled={!analytics}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white',
                opacity: analytics ? 1 : 0.5,
              }}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : analytics ? (
            <>
              {/* Health Score */}
              <div
                className="p-6 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Graph Health Score
                  </h3>
                  <span
                    className="text-3xl font-bold"
                    style={{ color: getHealthColor(analytics.healthMetrics.healthScore) }}
                  >
                    {analytics.healthMetrics.healthScore}/100
                  </span>
                </div>
                <div
                  className="w-full h-3 rounded-full"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${analytics.healthMetrics.healthScore}%`,
                      backgroundColor: getHealthColor(analytics.healthMetrics.healthScore),
                    }}
                  />
                </div>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Status: <strong>{getHealthLabel(analytics.healthMetrics.healthScore)}</strong>
                </p>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  icon={<Network />}
                  label="Connectivity"
                  value={`${analytics.healthMetrics.connectivity}%`}
                  subtext={`${analytics.stats.totalNotes - analytics.stats.orphanCount} connected`}
                  theme={theme}
                />
                <MetricCard
                  icon={<Link2 />}
                  label="Avg Connections"
                  value={analytics.stats.avgConnections.toFixed(1)}
                  subtext={`${analytics.stats.totalLinks} total links`}
                  theme={theme}
                />
                <MetricCard
                  icon={<Layers />}
                  label="Clusters"
                  value={analytics.healthMetrics.clusterCount}
                  subtext="Topic groups"
                  theme={theme}
                />
                <MetricCard
                  icon={<AlertCircle />}
                  label="Orphan Notes"
                  value={analytics.stats.orphanCount}
                  subtext="No connections"
                  theme={theme}
                  warning={analytics.stats.orphanCount > 0}
                />
              </div>

              {/* Clusters */}
              {analytics.clusters.length > 0 && (
                <div
                  className="p-6 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Top Clusters
                  </h3>
                  <div className="space-y-3">
                    {analytics.clusters.slice(0, 5).map((cluster, index) => (
                      <div
                        key={cluster.id}
                        className="flex items-center justify-between p-3 rounded"
                        style={{ backgroundColor: 'var(--bg-tertiary)' }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                            style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
                          >
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium">{cluster.label}</p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {cluster.nodeCount} notes • {(cluster.density * 100).toFixed(1)}%
                              density
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-24 h-2 rounded-full"
                            style={{ backgroundColor: 'var(--bg-primary)' }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${cluster.density * 100}%`,
                                backgroundColor: 'var(--accent-secondary)',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bridge Notes */}
              {analytics.bridgeNotes.length > 0 && (
                <div
                  className="p-6 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Link2 className="w-5 h-5" />
                    Bridge Notes (Connection Hubs)
                  </h3>
                  <div className="space-y-2">
                    {analytics.bridgeNotes.slice(0, 5).map((bridge, index) => (
                      <div
                        key={bridge.noteId}
                        className="flex items-center justify-between p-3 rounded"
                        style={{ backgroundColor: 'var(--bg-tertiary)' }}
                      >
                        <div>
                          <p className="font-medium">
                            {index + 1}. {bridge.noteName.replace('.md', '')}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Connects {bridge.connectsClusters.length} clusters
                          </p>
                        </div>
                        <span
                          className="px-3 py-1 rounded text-sm font-medium"
                          style={{
                            backgroundColor: 'var(--accent-primary)',
                            color: 'white',
                          }}
                        >
                          Strength: {bridge.bridgeStrength}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Temporal Analysis */}
              <div
                className="p-6 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Temporal Analysis
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-bold">{analytics.temporalAnalysis.totalDays}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Active Days
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {analytics.temporalAnalysis.avgNotesPerDay.toFixed(1)}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Avg Notes/Day
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {analytics.temporalAnalysis.avgLinksPerDay.toFixed(1)}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Avg Links/Day
                    </p>
                  </div>
                </div>
              </div>

              {/* Coverage Gaps */}
              {analytics.coverageGaps.length > 0 && (
                <div
                  className="p-6 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Coverage Gaps & Suggestions
                  </h3>
                  <div className="space-y-3">
                    {analytics.coverageGaps.slice(0, 5).map((gap, index) => (
                      <div
                        key={index}
                        className="p-3 rounded border-l-4"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          borderLeftColor: theme === 'dark' ? '#f59e0b' : '#d97706',
                        }}
                      >
                        <p className="font-medium text-sm mb-1">
                          {gap.type === 'isolated-tag' ? '🏷️ Isolated Tag' : '📁 Isolated Folder'}:{' '}
                          {gap.identifier}
                        </p>
                        <ul
                          className="text-xs space-y-1"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {gap.suggestions.map((suggestion, i) => (
                            <li key={i}>• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No analytics data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
  theme,
  warning = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext: string;
  theme: string;
  warning?: boolean;
}) {
  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: warning ? (theme === 'dark' ? '#ef4444' : '#dc2626') : 'var(--border-primary)',
      }}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
        <span className="w-4 h-4">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
        {subtext}
      </p>
    </div>
  );
}
