import React, { useState, useEffect, useMemo } from 'react';
import {
  AnalyticsMetrics,
  TimeSeriesData,
  InsightType,
  analytics,
  AnalyticsEvent,
} from '@/lib/analytics';
import { Note, Link, Tag } from '@/lib/types';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BookOpen,
  Link as LinkIcon,
  Search,
  Clock,
  Target,
  Zap,
  Award,
  Lightbulb,
  BarChart3,
  Download,
  Trash2,
  FileText,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';

interface EnhancedAnalyticsDashboardProps {
  notes: Note[];
  links: Link[];
  tags: Tag[];
  className?: string;
}

export const EnhancedAnalyticsDashboard: React.FC<EnhancedAnalyticsDashboardProps> = ({
  notes,
  links,
  tags,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'activity' | 'insights'>(
    'overview'
  );
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [insights, setInsights] = useState<InsightType[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showExportMenu && !target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  // Calculate metrics when data changes
  useEffect(() => {
    const calculatedMetrics = analytics.calculateMetrics(notes, links, tags);
    setMetrics(calculatedMetrics);

    const storedEvents = analytics.getStoredEvents();
    setEvents(storedEvents);

    const generatedInsights = analytics.generateInsights(calculatedMetrics, notes);
    setInsights(generatedInsights);
  }, [notes, links, tags]);

  // Generate chart data
  const timeSeriesData = useMemo(() => {
    if (!events.length) return { notes: [], words: [], sessions: [], searches: [] };

    return {
      notes: analytics.generateTimeSeriesData(events, 'notes', timeRange),
      words: analytics.generateTimeSeriesData(events, 'words', timeRange),
      sessions: analytics.generateTimeSeriesData(events, 'sessions', timeRange),
      searches: analytics.generateTimeSeriesData(events, 'searches', timeRange),
    };
  }, [events, timeRange]);

  const heatmapData = useMemo(() => {
    if (!events.length) return [];
    return analytics.generateHeatmapData(events, 'activity');
  }, [events]);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: 'var(--accent-primary)' }}
        ></div>
      </div>
    );
  }

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
  }> = ({ title, value, change, icon }) => (
    <div
      className="rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {title}
          </p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          {change !== undefined && (
            <div
              className="flex items-center mt-1 text-sm"
              style={{ color: change >= 0 ? 'var(--success)' : 'var(--error)' }}
            >
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div
          className="p-3 rounded-full"
          style={{
            backgroundColor: 'var(--accent-primary)',
            opacity: 0.15,
          }}
        >
          <div style={{ color: 'var(--accent-primary)' }}>{icon}</div>
        </div>
      </div>
    </div>
  );

  const TabButton: React.FC<{
    id: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
  }> = ({ label, icon, active, onClick }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
        style={{
          backgroundColor: active
            ? 'var(--accent-primary)'
            : isHovered
              ? 'var(--bg-secondary)'
              : 'transparent',
          color: active ? '#ffffff' : isHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: active
            ? 'var(--accent-primary)'
            : isHovered
              ? 'var(--border-primary)'
              : 'transparent',
        }}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  const formatDuration = (minutes: number): string => {
    const roundedMinutes = Math.round(minutes);
    if (roundedMinutes < 60) return `${roundedMinutes}m`;
    const hours = Math.floor(roundedMinutes / 60);
    const mins = roundedMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  const SimpleChart: React.FC<{
    data: TimeSeriesData[];
    title: string;
    unit: string;
  }> = ({ data, title, unit }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
      <div
        className="rounded-lg p-6 shadow-sm border"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <div className="space-y-2">
          {data.slice(-7).map(item => (
            <div key={item.date} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {new Date(item.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <div className="flex items-center space-x-2 flex-1 mx-3">
                <div
                  className="flex-1 rounded-full h-2"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: 'var(--accent-primary)',
                    }}
                  ></div>
                </div>
                <span
                  className="text-sm font-medium w-12 text-right"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {item.value}
                  {unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const exportAsMarkdown = () => {
    if (!metrics) return;
    const markdown = analytics.exportAsMarkdown(metrics, insights);
    downloadFile(
      markdown,
      `analytics-report-${new Date().toISOString().split('T')[0]}.md`,
      'text/markdown'
    );
    setShowExportMenu(false);
  };

  const exportAsJSON = () => {
    if (!metrics) return;
    const json = analytics.exportAsJSON(metrics, events, insights);
    downloadFile(
      json,
      `analytics-export-${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
    setShowExportMenu(false);
  };

  const exportAsCSV = () => {
    const csv = analytics.exportAsCSV(events);
    downloadFile(csv, `analytics-events-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    setShowExportMenu(false);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    try {
      analytics.clearAllData();
      setShowClearConfirm(false);
      // Reload metrics
      const calculatedMetrics = analytics.calculateMetrics(notes, links, tags);
      setMetrics(calculatedMetrics);
      setEvents(analytics.getStoredEvents());
      setInsights(analytics.generateInsights(calculatedMetrics, notes));
    } catch (error) {
      console.error('Failed to clear analytics data:', error);
      alert('Failed to clear analytics data. Please try again.');
    }
  };

  const dataSize = analytics.getDataSize();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            📊 Analytics Dashboard
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Insights into your knowledge management journey
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Export Dropdown */}
          <div className="relative export-menu-container">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors hover:opacity-80"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {showExportMenu && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-lg border shadow-lg z-10"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <button
                  onClick={exportAsMarkdown}
                  className="w-full flex items-center space-x-2 px-4 py-2 hover:opacity-80 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <FileText className="w-4 h-4" />
                  <span>Markdown Report</span>
                </button>
                <button
                  onClick={exportAsJSON}
                  className="w-full flex items-center space-x-2 px-4 py-2 hover:opacity-80 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <FileJson className="w-4 h-4" />
                  <span>JSON Export</span>
                </button>
                <button
                  onClick={exportAsCSV}
                  className="w-full flex items-center space-x-2 px-4 py-2 hover:opacity-80 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>CSV Events</span>
                </button>
              </div>
            )}
          </div>

          {/* Clear Data Button */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-secondary)',
            }}
            title="Clear all analytics data"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <select
            value={timeRange}
            onChange={e => setTimeRange(Number(e.target.value) as 7 | 30 | 90)}
            className="px-3 py-2 text-sm border rounded-lg"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)',
            }}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Clear Analytics Data?
            </h3>
            <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
              This will permanently delete all analytics data including:
            </p>
            <ul
              className="list-disc list-inside mb-4 space-y-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              <li>{dataSize.events} tracked events</li>
              <li>All session history</li>
              <li>All calculated metrics</li>
              <li>Storage size: {dataSize.sizeMB} MB</li>
            </ul>
            <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
              This action cannot be undone. A new session will start immediately.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleClearData}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-80"
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                }}
              >
                Clear Data
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border font-medium transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div
        className="flex space-x-1 p-1 rounded-lg"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
        }}
      >
        <TabButton
          id="overview"
          label="Overview"
          icon={<BarChart3 className="w-4 h-4" />}
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        />
        <TabButton
          id="content"
          label="Content"
          icon={<BookOpen className="w-4 h-4" />}
          active={activeTab === 'content'}
          onClick={() => setActiveTab('content')}
        />
        <TabButton
          id="activity"
          label="Activity"
          icon={<Activity className="w-4 h-4" />}
          active={activeTab === 'activity'}
          onClick={() => setActiveTab('activity')}
        />
        <TabButton
          id="insights"
          label="Insights"
          icon={<Lightbulb className="w-4 h-4" />}
          active={activeTab === 'insights'}
          onClick={() => setActiveTab('insights')}
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Notes"
              value={metrics.totalNotes}
              icon={<BookOpen className="w-6 h-6" />}
            />
            <StatCard
              title="Total Words"
              value={metrics.totalWords.toLocaleString()}
              icon={<Target className="w-6 h-6" />}
            />
            <StatCard
              title="Knowledge Links"
              value={metrics.totalLinks}
              icon={<LinkIcon className="w-6 h-6" />}
            />
            <StatCard
              title="Active Time"
              value={formatDuration(metrics.monthlyActiveTime)}
              icon={<Clock className="w-6 h-6" />}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SimpleChart data={timeSeriesData.notes} title="Notes Created" unit="" />
            <SimpleChart data={timeSeriesData.words} title="Words Written" unit="" />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div
              className="rounded-lg p-6 shadow-sm border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Writing Velocity
                </h3>
                <Zap className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {Math.round(metrics.writingVelocity * 10) / 10}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                words per day
              </p>
            </div>

            <div
              className="rounded-lg p-6 shadow-sm border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Writing Streak
                </h3>
                <Award className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {metrics.writingStreaks.current}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                days (best: {metrics.writingStreaks.longest})
              </p>
            </div>

            <div
              className="rounded-lg p-6 shadow-sm border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Network Density
                </h3>
                <Activity className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {((metrics.totalLinks / Math.max(metrics.totalNotes, 1)) * 100).toFixed(1)}%
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                connection density
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Content Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Avg Note Length"
              value={`${Math.round(metrics.averageNoteLength * 10) / 10} words`}
              icon={<BookOpen className="w-6 h-6" />}
            />
            <StatCard
              title="Tags Used"
              value={metrics.tagsUsed}
              icon={<Target className="w-6 h-6" />}
            />
            <StatCard
              title="Avg Tags/Note"
              value={Math.round(metrics.averageTagsPerNote * 10) / 10}
              icon={<Target className="w-6 h-6" />}
            />
            <StatCard
              title="Avg Reading Time"
              value={`${Math.round(metrics.averageReadingTime)} min`}
              icon={<Clock className="w-6 h-6" />}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SimpleChart data={timeSeriesData.words} title="Words Written" unit="" />
            <SimpleChart data={timeSeriesData.searches} title="Searches Performed" unit="" />
          </div>

          {/* Most Used Tags */}
          <div
            className="rounded-lg p-6 shadow-sm border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Most Used Tags
            </h3>
            <div className="space-y-3">
              {metrics.mostUsedTags.slice(0, 10).map(tag => (
                <div key={tag.tag} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    #{tag.tag}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-2 rounded transition-all duration-300"
                      style={{
                        width: `${(tag.count / Math.max(metrics.mostUsedTags[0]?.count || 1, 1)) * 120}px`,
                        backgroundColor: 'var(--accent-primary)',
                      }}
                    ></div>
                    <span
                      className="text-xs w-8 text-right"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {tag.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Quality */}
          <div
            className="rounded-lg p-6 shadow-sm border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Content Quality Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Notes with Links
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {Math.round((metrics.notesWithLinks / Math.max(metrics.totalNotes, 1)) * 100)}%
                  </span>
                </div>
                <div
                  className="w-full rounded-full h-2"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(metrics.notesWithLinks / Math.max(metrics.totalNotes, 1)) * 100}%`,
                      backgroundColor: 'var(--accent-primary)',
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Notes with Tags
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {Math.round((metrics.notesWithTags / Math.max(metrics.totalNotes, 1)) * 100)}%
                  </span>
                </div>
                <div
                  className="w-full rounded-full h-2"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(metrics.notesWithTags / Math.max(metrics.totalNotes, 1)) * 100}%`,
                      backgroundColor: 'var(--success)',
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Orphan Notes
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {Math.round((metrics.orphanNotes / Math.max(metrics.totalNotes, 1)) * 100)}%
                  </span>
                </div>
                <div
                  className="w-full rounded-full h-2"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(metrics.orphanNotes / Math.max(metrics.totalNotes, 1)) * 100}%`,
                      backgroundColor: 'var(--warning)',
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Activity Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Sessions"
              value={metrics.sessionsCount}
              icon={<Activity className="w-6 h-6" />}
            />
            <StatCard
              title="Daily Active Time"
              value={formatDuration(metrics.dailyActiveTime)}
              icon={<Clock className="w-6 h-6" />}
            />
            <StatCard
              title="Searches"
              value={metrics.searchesPerformed}
              icon={<Search className="w-6 h-6" />}
            />
            <StatCard
              title="Avg Session"
              value={formatDuration(metrics.averageSessionDuration)}
              icon={<Clock className="w-6 h-6" />}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SimpleChart data={timeSeriesData.sessions} title="Active Sessions" unit="" />
            <SimpleChart data={timeSeriesData.searches} title="Searches Performed" unit="" />
          </div>

          {/* Peak Hours */}
          <div
            className="rounded-lg p-6 shadow-sm border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Peak Activity Hours
            </h3>
            <div className="space-y-2">
              {metrics.peakWritingHours.length > 0 ? (
                metrics.peakWritingHours.slice(0, 10).map(hour => {
                  const timeStr = `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
                  const activity = heatmapData.filter(d => d.hour === hour).length;
                  const maxActivity = Math.max(
                    ...metrics.peakWritingHours.map(
                      h => heatmapData.filter(d => d.hour === h).length
                    ),
                    1
                  );

                  return (
                    <div key={hour} className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {timeStr}
                      </span>
                      <div className="flex items-center space-x-2 flex-1 mx-3">
                        <div
                          className="flex-1 rounded-full h-2"
                          style={{ backgroundColor: 'var(--bg-tertiary)' }}
                        >
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(activity / maxActivity) * 100}%`,
                              backgroundColor: 'var(--accent-primary)',
                            }}
                          ></div>
                        </div>
                        <span
                          className="text-xs w-12 text-right"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {activity} events
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                  No activity data yet. Keep using MarkItUp to see your patterns!
                </p>
              )}
            </div>
          </div>

          {/* Popular Search Terms */}
          <div
            className="rounded-lg p-6 shadow-sm border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Popular Search Terms
            </h3>
            <div className="space-y-3">
              {metrics.popularSearchTerms.length > 0 ? (
                metrics.popularSearchTerms.slice(0, 8).map(term => (
                  <div key={term.term} className="flex items-center justify-between">
                    <span
                      className="text-sm truncate max-w-xs"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      "{term.term}"
                    </span>
                    <div className="flex items-center space-x-2">
                      <div
                        className="h-2 rounded transition-all duration-300"
                        style={{
                          width: `${(term.count / Math.max(metrics.popularSearchTerms[0]?.count || 1, 1)) * 100}px`,
                          backgroundColor: 'var(--accent-secondary)',
                        }}
                      ></div>
                      <span
                        className="text-xs w-8 text-right"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {term.count}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                  No search history yet
                </p>
              )}
            </div>
          </div>

          {/* Activity Heatmap */}
          <div
            className="rounded-lg p-6 shadow-sm border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Activity Heatmap
            </h3>
            <div className="space-y-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIndex) => (
                <div key={day} className="flex items-center space-x-2">
                  <div className="w-12 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {day}
                  </div>
                  <div className="flex space-x-1">
                    {Array.from({ length: 24 }, (_, hourIndex) => {
                      const cellData = heatmapData.find(
                        d => d.day === dayIndex && d.hour === hourIndex
                      );
                      const intensity = cellData ? Math.min(cellData.value / 5, 1) : 0;
                      return (
                        <div
                          key={hourIndex}
                          className="w-3 h-3 rounded-sm transition-colors"
                          style={{
                            backgroundColor:
                              intensity > 0
                                ? `rgba(var(--accent-primary-rgb, 59, 130, 246), ${intensity})`
                                : 'var(--bg-tertiary)',
                          }}
                          title={`${day} ${hourIndex}:00 - ${cellData?.value || 0} events`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Writing Streaks & Network Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div
              className="rounded-lg p-6 shadow-sm border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Writing Streaks
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                    {metrics.writingStreaks.current}
                  </div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Current Streak (days)
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: 'var(--success)' }}>
                    {metrics.writingStreaks.longest}
                  </div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Longest Streak (days)
                  </div>
                </div>
                {metrics.writingStreaks.current >= 7 && (
                  <div
                    className="p-3 rounded-lg text-center"
                    style={{
                      backgroundColor: 'var(--success)',
                      opacity: 0.1,
                    }}
                  >
                    <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>
                      🔥 You're on fire! Keep it up!
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div
              className="rounded-lg p-6 shadow-sm border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Knowledge Network Health
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Connection Density
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {((metrics.totalLinks / Math.max(metrics.totalNotes, 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Avg Connections per Note
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {metrics.avgConnections}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Orphan Notes
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {metrics.orphanNotes} (
                    {((metrics.orphanNotes / Math.max(metrics.totalNotes, 1)) * 100).toFixed(1)}%)
                  </span>
                </div>
                {metrics.orphanNotes > metrics.totalNotes * 0.3 && (
                  <div
                    className="p-3 rounded-lg mt-3"
                    style={{
                      backgroundColor: 'var(--warning)',
                      opacity: 0.1,
                    }}
                  >
                    <p className="text-sm" style={{ color: 'var(--warning)' }}>
                      💡 Consider linking more notes together to strengthen your knowledge network
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hub Notes */}
          {metrics.hubNotes.length > 0 && (
            <div
              className="rounded-lg p-6 shadow-sm border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                📚 Hub Notes (Most Connected)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {metrics.hubNotes.slice(0, 6).map(noteId => {
                  const note = notes.find(n => n.id === noteId);
                  return (
                    <div
                      key={noteId}
                      className="p-3 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderColor: 'var(--border-primary)',
                      }}
                    >
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {note?.name || noteId}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI-Powered Insights */}
          <div
            className="rounded-lg p-6 shadow-sm border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <h3
              className="text-lg font-semibold mb-4 flex items-center"
              style={{ color: 'var(--text-primary)' }}
            >
              <Lightbulb className="w-5 h-5 mr-2" style={{ color: 'var(--accent-primary)' }} />
              Personalized Insights
            </h3>
            <div className="space-y-4">
              {insights.length === 0 ? (
                <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                  Keep writing and building your knowledge base to unlock personalized insights!
                </p>
              ) : (
                insights.map(insight => (
                  <div
                    key={insight.id}
                    className="p-4 rounded-lg border-l-4"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor:
                        insight.type === 'positive'
                          ? 'var(--success)'
                          : insight.type === 'suggestion'
                            ? 'var(--accent-primary)'
                            : 'var(--text-secondary)',
                    }}
                  >
                    <div className="flex items-start">
                      <span className="text-xl mr-3">{insight.icon}</span>
                      <div>
                        <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                          {insight.title}
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
