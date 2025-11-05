'use client';

// No React imports needed - hooks not used

interface DailyAnalytics {
  totalNotes: number;
  currentStreak: number;
  longestStreak: number;
  averageWordsPerDay: number;
  mostProductiveDay: string;
  mostProductiveTime: string;
  notesThisWeek: number;
  notesThisMonth: number;
  weekdayDistribution: Record<string, number>;
  monthlyTrend: Array<{ month: string; count: number }>;
}

interface DailyNotesDashboardProps {
  analytics: DailyAnalytics;
}

export default function DailyNotesDashboard({ analytics }: DailyNotesDashboardProps) {
  const maxWeekdayCount = Math.max(...Object.values(analytics.weekdayDistribution));
  const maxMonthlyCount = Math.max(...analytics.monthlyTrend.map(m => m.count), 1);

  return (
    <div className="daily-notes-dashboard p-6 bg-white dark:bg-gray-800 rounded-lg shadow space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold dark:text-white mb-2">📊 Daily Notes Analytics</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Insights about your journaling habits and patterns
        </p>
      </div>

      {/* Streak Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">🔥</span>
            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Current Streak
            </span>
          </div>
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-300">
            {analytics.currentStreak}
            <span className="text-lg ml-1">days</span>
          </div>
          {analytics.currentStreak > 0 && (
            <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">Keep it up! 🎯</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">🏆</span>
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Longest Streak
            </span>
          </div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-300">
            {analytics.longestStreak}
            <span className="text-lg ml-1">days</span>
          </div>
          {analytics.longestStreak === analytics.currentStreak && analytics.currentStreak > 0 && (
            <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">Personal best! 🎉</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">📝</span>
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Total Notes
            </span>
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">
            {analytics.totalNotes}
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
            {analytics.notesThisWeek} this week
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Week</div>
          <div className="text-2xl font-bold dark:text-white">{analytics.notesThisWeek}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Month</div>
          <div className="text-2xl font-bold dark:text-white">{analytics.notesThisMonth}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg. Words</div>
          <div className="text-2xl font-bold dark:text-white">{analytics.averageWordsPerDay}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Best Day</div>
          <div className="text-lg font-bold dark:text-white">
            {analytics.mostProductiveDay.slice(0, 3)}
          </div>
        </div>
      </div>

      {/* Weekday Distribution */}
      <div>
        <h3 className="text-lg font-semibold dark:text-white mb-3">📅 Activity by Day of Week</h3>
        <div className="space-y-2">
          {Object.entries(analytics.weekdayDistribution).map(([day, count]) => {
            const percentage = maxWeekdayCount > 0 ? (count / maxWeekdayCount) * 100 : 0;
            return (
              <div key={day} className="flex items-center gap-3">
                <div className="w-16 text-sm text-gray-600 dark:text-gray-400">{day}</div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-blue-500 dark:bg-blue-600 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  >
                    {count > 0 && <span className="text-xs text-white font-medium">{count}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Trend */}
      <div>
        <h3 className="text-lg font-semibold dark:text-white mb-3">📈 Monthly Trend</h3>
        <div className="flex items-end gap-2 h-40">
          {analytics.monthlyTrend.map(({ month, count }) => {
            const height = (count / maxMonthlyCount) * 100;
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-green-400 dark:from-green-600 dark:to-green-500 rounded-t transition-all duration-500 hover:opacity-80 relative group"
                    style={{ height: `${height}%`, minHeight: count > 0 ? '20px' : '0' }}
                  >
                    {count > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                          {count}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  {month.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 p-4 rounded-lg">
        <h3 className="text-lg font-semibold dark:text-white mb-3 flex items-center gap-2">
          <span>💡</span> Insights
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>
              You&apos;re most consistent on <strong>{analytics.mostProductiveDay}s</strong>
            </span>
          </li>
          {analytics.currentStreak >= 7 && (
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Amazing! You&apos;ve maintained a week-long streak 🎉</span>
            </li>
          )}
          {analytics.currentStreak >= 30 && (
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Incredible! A full month of daily notes! 🏆</span>
            </li>
          )}
          {analytics.notesThisMonth > 20 && (
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Highly productive month with {analytics.notesThisMonth} notes!</span>
            </li>
          )}
          {analytics.averageWordsPerDay > 500 && (
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>
                Great detail in your notes - averaging {analytics.averageWordsPerDay} words!
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
