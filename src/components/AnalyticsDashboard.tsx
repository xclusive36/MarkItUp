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
} from 'lucide-react';

interface AnalyticsDashboardProps {
  notes: Note[];
  links: Link[];
  tags: Tag[];
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change !== undefined && (
            <div
              className={`flex items-center mt-1 text-sm ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
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
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  );

  const TabButton: React.FC<{
    id: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
  }> = ({ id, label, icon, active, onClick }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
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
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const SimpleChart: React.FC<{
    data: TimeSeriesData[];
    title: string;
    color: string;
    unit: string;
  }> = ({ data, title, color, unit }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="space-y-2">
          {data.slice(-7).map((item, index) => (
            <div key={item.date} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(item.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <div className="flex items-center space-x-2 flex-1 mx-3">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Insights into your knowledge management
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={e => setTimeRange(Number(e.target.value) as 7 | 30 | 90)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

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
              icon={<BookOpen className="w-6 h-6 text-white" />}
              color="bg-blue-600"
            />
            <StatCard
              title="Total Words"
              value={metrics.totalWords.toLocaleString()}
              icon={<Target className="w-6 h-6 text-white" />}
              color="bg-green-600"
            />
            <StatCard
              title="Knowledge Links"
              value={metrics.totalLinks}
              icon={<LinkIcon className="w-6 h-6 text-white" />}
              color="bg-purple-600"
            />
            <StatCard
              title="Active Time Today"
              value={formatDuration(metrics.dailyActiveTime)}
              icon={<Clock className="w-6 h-6 text-white" />}
              color="bg-orange-600"
            />
          </div>

          {/* Simple Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleChart
              data={timeSeriesData.words}
              title="Writing Activity"
              color="bg-blue-500"
              unit=" words"
            />
            <SimpleChart
              data={timeSeriesData.notes}
              title="Note Creation"
              color="bg-green-500"
              unit=" notes"
            />
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Content Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Avg Note Length"
              value={`${Math.round(metrics.averageNoteLength)} words`}
              icon={<BookOpen className="w-6 h-6 text-white" />}
              color="bg-blue-600"
            />
            <StatCard
              title="Writing Velocity"
              value={`${Math.round(metrics.writingVelocity)} words/day`}
              icon={<Zap className="w-6 h-6 text-white" />}
              color="bg-green-600"
            />
            <StatCard
              title="Tags Used"
              value={metrics.tagsUsed}
              icon={<Target className="w-6 h-6 text-white" />}
              color="bg-purple-600"
            />
            <StatCard
              title="Orphan Notes"
              value={metrics.orphanNotes}
              icon={<LinkIcon className="w-6 h-6 text-white" />}
              color="bg-red-600"
            />
          </div>

          {/* Content Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Most Used Tags
              </h3>
              <div className="space-y-3">
                {metrics.mostUsedTags.slice(0, 8).map((tag, index) => (
                  <div key={tag.tag} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">#{tag.tag}</span>
                    <div className="flex items-center space-x-2">
                      <div
                        className="h-2 bg-blue-600 rounded"
                        style={{
                          width: `${(tag.count / Math.max(metrics.mostUsedTags[0]?.count || 1, 1)) * 100}px`,
                        }}
                      ></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                        {tag.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Content Quality
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Notes with Links</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {Math.round((metrics.notesWithLinks / Math.max(metrics.totalNotes, 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(metrics.notesWithLinks / Math.max(metrics.totalNotes, 1)) * 100}%`,
                    }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Notes with Tags</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {Math.round((metrics.notesWithTags / Math.max(metrics.totalNotes, 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${(metrics.notesWithTags / Math.max(metrics.totalNotes, 1)) * 100}%`,
                    }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Reading Time</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {Math.round(metrics.averageReadingTime)} min
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Content Complexity
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {metrics.contentComplexity.toFixed(1)}/10
                  </span>
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
              title="Sessions Today"
              value={metrics.sessionsCount}
              icon={<Activity className="w-6 h-6 text-white" />}
              color="bg-blue-600"
            />
            <StatCard
              title="Avg Session"
              value={formatDuration(Math.round(metrics.averageSessionDuration / 60000))}
              icon={<Clock className="w-6 h-6 text-white" />}
              color="bg-green-600"
            />
            <StatCard
              title="Searches"
              value={metrics.searchesPerformed}
              icon={<Search className="w-6 h-6 text-white" />}
              color="bg-purple-600"
            />
            <StatCard
              title="Current Streak"
              value={`${metrics.writingStreaks.current} days`}
              icon={<Award className="w-6 h-6 text-white" />}
              color="bg-orange-600"
            />
          </div>

          {/* Activity Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Peak Writing Hours
              </h3>
              <div className="space-y-3">
                {metrics.peakWritingHours.slice(0, 5).map((hour, index) => {
                  const timeStr =
                    hour === 0 ? '12:00 AM' : hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
                  return (
                    <div key={hour} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{timeStr}</span>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            index === 0
                              ? 'bg-green-500'
                              : index === 1
                                ? 'bg-blue-500'
                                : 'bg-gray-400'
                          }`}
                        ></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Peak #{index + 1}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Search Behavior
              </h3>
              <div className="space-y-3">
                {metrics.popularSearchTerms.slice(0, 5).map((term, index) => (
                  <div key={term.term} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-32">
                      "{term.term}"
                    </span>
                    <div className="flex items-center space-x-2">
                      <div
                        className="h-2 bg-purple-600 rounded"
                        style={{
                          width: `${(term.count / Math.max(metrics.popularSearchTerms[0]?.count || 1, 1)) * 50}px`,
                        }}
                      ></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                        {term.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Simple Activity Heatmap */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Activity Heatmap
            </h3>
            <div className="space-y-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIndex) => (
                <div key={day} className="flex items-center space-x-2">
                  <div className="w-12 text-xs text-gray-500 dark:text-gray-400">{day}</div>
                  <div className="flex space-x-1">
                    {Array.from({ length: 24 }, (_, hourIndex) => {
                      const cellData = heatmapData.find(
                        d => d.day === dayIndex && d.hour === hourIndex
                      );
                      const intensity = cellData ? Math.min(cellData.value / 5, 1) : 0;
                      return (
                        <div
                          key={hourIndex}
                          className="w-3 h-3 rounded-sm border border-gray-200 dark:border-gray-600"
                          style={{
                            backgroundColor:
                              intensity > 0 ? `rgba(59, 130, 246, ${intensity})` : 'transparent',
                          }}
                          title={`${day} ${hourIndex}:00 - ${cellData?.value || 0} events`}
                        ></div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
              <span>Less</span>
              <div className="flex space-x-1">
                {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm border border-gray-200 dark:border-gray-600"
                    style={{
                      backgroundColor:
                        intensity > 0 ? `rgba(59, 130, 246, ${intensity})` : 'transparent',
                    }}
                  ></div>
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Writing Streaks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Writing Streaks
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {metrics.writingStreaks.current}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Current Streak (days)
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {metrics.writingStreaks.longest}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Longest Streak (days)
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Knowledge Network
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Connection Density
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {((metrics.totalLinks / Math.max(metrics.totalNotes, 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Connections</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {metrics.avgConnections}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Orphan Rate</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {((metrics.orphanNotes / Math.max(metrics.totalNotes, 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
              Personalized Insights
            </h3>
            <div className="space-y-4">
              {insights.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  Keep writing and building your knowledge base to unlock personalized insights!
                </p>
              ) : (
                insights.map(insight => (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      insight.type === 'positive'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                        : insight.type === 'suggestion'
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                          : 'bg-gray-50 dark:bg-gray-700/50 border-gray-400'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{insight.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
