'use client';

import React from 'react';

interface AnalyticsData {
  totalConnections: number;
  totalMOCs: number;
  connectionsByDate: Record<string, number>;
  mocsByDate: Record<string, number>;
  avgConnectionsPerDay: number;
  graphGrowthRate: number;
  mostConnectedNotes: Array<{ id: string; name: string; count: number }>;
  mocEffectiveness: Array<{ name: string; accessCount: number; linkCount: number }>;
}

interface AnalyticsDashboardProps {
  analytics: AnalyticsData;
  isOpen: boolean;
  onClose: () => void;
  onConnectOrphans?: () => void;
  onSuggestMOCs?: () => void;
}

export function AnalyticsDashboard({
  analytics,
  isOpen,
  onClose,
  onConnectOrphans,
  onSuggestMOCs,
}: AnalyticsDashboardProps) {
  if (!isOpen) return null;

  // Calculate health score
  const getHealthScore = () => {
    if (analytics.totalConnections === 0) return 0;
    const baseScore = Math.min((analytics.avgConnectionsPerDay / 5) * 50, 50);
    const growthBonus = Math.min((analytics.graphGrowthRate / 100) * 50, 50);
    return Math.round(Math.max(0, Math.min(100, baseScore + growthBonus)));
  };

  const healthScore = getHealthScore();
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getHealthStatus = (score: number) => {
    if (score >= 80) return '🌟 Excellent';
    if (score >= 60) return '✅ Good';
    if (score >= 40) return '📊 Fair';
    return '⚠️ Needs Attention';
  };

  // Get last 7 days activity
  const getLast7DaysActivity = () => {
    const today = new Date();
    const data: Array<{ date: string; connections: number; mocs: number }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      data.push({
        date: dateStr,
        connections: analytics.connectionsByDate[dateStr] || 0,
        mocs: analytics.mocsByDate[dateStr] || 0,
      });
    }

    return data;
  };

  const activityData = getLast7DaysActivity();
  const maxActivity = Math.max(...activityData.map(d => d.connections + d.mocs), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-6 border-b"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div>
            <h2 className="text-2xl font-bold">📊 Analytics Dashboard</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Knowledge Graph Growth & Performance Metrics
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            }}
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Health Score Section */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Graph Health Score</h3>
                <div className={`text-5xl font-bold ${getHealthColor(healthScore)}`}>
                  {healthScore}%
                </div>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {getHealthStatus(healthScore)}
                </p>
              </div>
              <div className="text-6xl opacity-20">
                {healthScore >= 80 ? '🌟' : healthScore >= 60 ? '✅' : '📊'}
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Connections" value={analytics.totalConnections} icon="🔗" />
            <StatCard title="Total MOCs" value={analytics.totalMOCs} icon="📚" />
            <StatCard
              title="Avg Connections/Day"
              value={analytics.avgConnectionsPerDay.toFixed(1)}
              icon="📈"
            />
            <StatCard
              title="Growth Rate (7d)"
              value={`${analytics.graphGrowthRate >= 0 ? '+' : ''}${analytics.graphGrowthRate.toFixed(1)}%`}
              icon={analytics.graphGrowthRate >= 0 ? '📈' : '📉'}
              valueColor={
                analytics.graphGrowthRate >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }
            />
          </div>

          {/* Activity Timeline */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <h3 className="text-lg font-semibold mb-4">Activity Timeline (Last 7 Days)</h3>
            <div className="space-y-2">
              {activityData.map((day, index) => {
                const total = day.connections + day.mocs;
                const percentage = (total / maxActivity) * 100;

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {day.connections} connections, {day.mocs} MOCs
                      </span>
                    </div>
                    <div
                      className="h-6 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--bg-primary)' }}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Most Connected Notes */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <h3 className="text-lg font-semibold mb-4">🌟 Most Connected Notes</h3>
            {analytics.mostConnectedNotes.length > 0 ? (
              <div className="space-y-2">
                {analytics.mostConnectedNotes.slice(0, 10).map((note, index) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-3 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`
                        w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                        ${
                          index < 3
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                            : ''
                        }
                      `}
                        style={
                          index >= 3
                            ? {
                                backgroundColor: 'var(--bg-primary)',
                                color: 'var(--text-secondary)',
                              }
                            : undefined
                        }
                      >
                        {index + 1}
                      </span>
                      <span className="font-medium">{note.name}</span>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: 'var(--accent-bg)',
                        color: 'var(--accent-primary)',
                      }}
                    >
                      {note.count} connections
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                No connection data available yet
              </p>
            )}
          </div>

          {/* MOC Effectiveness */}
          {analytics.mocEffectiveness.length > 0 && (
            <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <h3 className="text-lg font-semibold mb-4">📚 MOC Effectiveness</h3>
              <div className="space-y-2">
                {analytics.mocEffectiveness.slice(0, 5).map((moc, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{moc.name}</span>
                      <div className="flex gap-3 text-sm">
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {moc.linkCount} links
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {moc.accessCount} accesses
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <h3 className="text-lg font-semibold mb-4">💡 Recommendations</h3>
            <div className="flex flex-wrap gap-3">
              {onConnectOrphans && (
                <button
                  onClick={onConnectOrphans}
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                  }}
                >
                  🏝️ Connect Orphan Notes
                </button>
              )}
              {onSuggestMOCs && (
                <button
                  onClick={onSuggestMOCs}
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: '#a855f7',
                    color: '#ffffff',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#9333ea';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = '#a855f7';
                  }}
                >
                  📚 Suggest MOCs
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  valueColor?: string;
}

function StatCard({ title, value, icon, valueColor }: StatCardProps) {
  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {title}
        </span>
        <span className="text-2xl opacity-50">{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${valueColor || ''}`}>{value}</div>
    </div>
  );
}

// Listen for event from plugin
if (typeof window !== 'undefined') {
  window.addEventListener('showAnalyticsDashboard', ((event: CustomEvent) => {
    const { analytics } = event.detail;
    // This would be handled by the app's event system
    console.log('Analytics dashboard requested:', analytics);
  }) as EventListener);
}
