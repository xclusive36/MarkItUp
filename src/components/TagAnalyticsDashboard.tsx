'use client';

import React from 'react';
import { X, TrendingUp, Tag, BarChart3, PieChart } from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';

interface TagAnalyticsData {
  totalTags: number;
  totalTaggedNotes: number;
  totalUntaggedNotes: number;
  coveragePercentage: number;
  mostUsedTags: Array<{ tag: string; count: number }>;
  recentlyAddedTags: Array<{ tag: string; timestamp: number; noteId: string }>;
  suggestionStats: {
    totalSuggestions: number;
    accepted: number;
    rejected: number;
    acceptanceRate: number;
  };
  tagsOverTime: Record<string, number>; // date -> tag count
}

interface TagAnalyticsDashboardProps {
  analytics: TagAnalyticsData;
  isOpen: boolean;
  onClose: () => void;
  onTagOrphans?: () => void;
}

export default function TagAnalyticsDashboard({
  analytics,
  isOpen,
  onClose,
  onTagOrphans,
}: TagAnalyticsDashboardProps) {
  const { theme } = useSimpleTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  // Calculate trend
  const getLast7DaysTrend = () => {
    const today = new Date();
    const data: Array<{ date: string; count: number }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      data.push({
        date: dateStr,
        count: analytics.tagsOverTime[dateStr] || 0,
      });
    }

    return data;
  };

  const trendData = getLast7DaysTrend();
  const maxTrendCount = Math.max(...trendData.map(d => d.count), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`
          w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl
          ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}
        `}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Tag Analytics Dashboard
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Insights into your tagging patterns and coverage
            </p>
          </div>
          <button
            onClick={onClose}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }
            `}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Coverage Overview */}
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Coverage Score
                </h3>
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics.coveragePercentage.toFixed(1)}%
                </div>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  of your notes have tags
                </p>
              </div>
              <div className="text-6xl opacity-20">
                {analytics.coveragePercentage >= 80
                  ? '✅'
                  : analytics.coveragePercentage >= 60
                    ? '📊'
                    : '⚠️'}
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Tags" value={analytics.totalTags} icon="🏷️" isDark={isDark} />
            <StatCard
              title="Tagged Notes"
              value={analytics.totalTaggedNotes}
              icon="✅"
              isDark={isDark}
            />
            <StatCard
              title="Untagged Notes"
              value={analytics.totalUntaggedNotes}
              icon="❌"
              isDark={isDark}
            />
            <StatCard
              title="Acceptance Rate"
              value={`${analytics.suggestionStats.acceptanceRate.toFixed(1)}%`}
              icon="📈"
              isDark={isDark}
              valueColor={
                analytics.suggestionStats.acceptanceRate >= 70
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              }
            />
          </div>

          {/* Tagging Activity Timeline */}
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tagging Activity (Last 7 Days)
            </h3>
            <div className="space-y-2">
              {trendData.map((day, index) => {
                const percentage = (day.count / maxTrendCount) * 100;

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {day.count} tags added
                      </span>
                    </div>
                    <div
                      className={`h-6 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
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

          {/* Most Used Tags */}
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Most Used Tags
            </h3>
            {analytics.mostUsedTags.length > 0 ? (
              <div className="space-y-2">
                {analytics.mostUsedTags.slice(0, 10).map((tagData, index) => (
                  <div
                    key={tagData.tag}
                    className={`
                      flex items-center justify-between p-3 rounded-lg
                      ${isDark ? 'bg-gray-700 hover:bg-gray-650' : 'bg-white hover:bg-gray-50'}
                      transition-colors
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`
                        w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                        ${
                          index < 3
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                            : isDark
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                        }
                      `}
                      >
                        {index + 1}
                      </span>
                      <span className="font-medium">#{tagData.tag}</span>
                    </div>
                    <span
                      className={`
                      px-3 py-1 rounded-full text-sm font-semibold
                      ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}
                    `}
                    >
                      {tagData.count} notes
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                No tag data available yet
              </p>
            )}
          </div>

          {/* Suggestion Statistics */}
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
            <h3 className="text-lg font-semibold mb-4">📊 Suggestion Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics.suggestionStats.totalSuggestions}
                </div>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Suggestions
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {analytics.suggestionStats.accepted}
                </div>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Accepted
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {analytics.suggestionStats.rejected}
                </div>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Rejected
                </p>
              </div>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
            <h3 className="text-lg font-semibold mb-4">💡 Recommendations</h3>
            <div className="space-y-2 text-sm">
              {analytics.totalUntaggedNotes > 0 && (
                <div className="flex items-start gap-2">
                  <span>⚠️</span>
                  <div className="flex-1 flex items-center justify-between">
                    <p>
                      {analytics.totalUntaggedNotes} untagged notes - Run batch tagging to organize
                      your notes
                    </p>
                    {onTagOrphans && (
                      <button
                        onClick={onTagOrphans}
                        className={`
                          ml-2 px-3 py-1 rounded text-xs font-medium whitespace-nowrap
                          ${
                            isDark
                              ? 'bg-blue-600 hover:bg-blue-500 text-white'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }
                        `}
                      >
                        Tag All
                      </button>
                    )}
                  </div>
                </div>
              )}
              {analytics.coveragePercentage < 50 && (
                <div className="flex items-start gap-2">
                  <span>📊</span>
                  <p>Low tag coverage - Consider running AI suggestions on more notes</p>
                </div>
              )}
              {analytics.suggestionStats.acceptanceRate < 50 &&
                analytics.suggestionStats.totalSuggestions > 10 && (
                  <div className="flex items-start gap-2">
                    <span>💭</span>
                    <p>Low acceptance rate - Consider adjusting confidence threshold in settings</p>
                  </div>
                )}
              {analytics.coveragePercentage >= 80 &&
                analytics.suggestionStats.acceptanceRate >= 70 && (
                  <div className="flex items-start gap-2">
                    <span>✅</span>
                    <p>Excellent tagging! Your knowledge base is well-organized.</p>
                  </div>
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
  isDark: boolean;
  valueColor?: string;
}

function StatCard({ title, value, icon, isDark, valueColor }: StatCardProps) {
  return (
    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{title}</span>
        <span className="text-2xl opacity-50">{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${valueColor || ''}`}>{value}</div>
    </div>
  );
}
