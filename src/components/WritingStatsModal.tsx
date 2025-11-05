'use client';

// No React hooks used
import { X, FileText, Link2, Hash, TrendingUp, Clock, BarChart2 } from 'lucide-react';

interface WritingStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    wordCount: number;
    characterCount: number;
    readingTime: number;
    linkCount: number;
    tagCount: number;
    headingCount: number;
    paragraphCount: number;
    sentenceCount: number;
  };
  theme?: 'light' | 'dark';
}

export default function WritingStatsModal({
  isOpen,
  onClose,
  stats,
  theme = 'light',
}: WritingStatsModalProps) {
  if (!isOpen) return null;

  const statCards = [
    {
      label: 'Words',
      value: stats.wordCount.toLocaleString(),
      icon: FileText,
      color: '#3b82f6',
    },
    {
      label: 'Characters',
      value: stats.characterCount.toLocaleString(),
      icon: FileText,
      color: '#8b5cf6',
    },
    {
      label: 'Reading Time',
      value: `${stats.readingTime} min`,
      icon: Clock,
      color: '#10b981',
    },
    {
      label: 'Links',
      value: stats.linkCount.toLocaleString(),
      icon: Link2,
      color: '#f59e0b',
    },
    {
      label: 'Tags',
      value: stats.tagCount.toLocaleString(),
      icon: Hash,
      color: '#ec4899',
    },
    {
      label: 'Headings',
      value: stats.headingCount.toLocaleString(),
      icon: BarChart2,
      color: '#6366f1',
    },
    {
      label: 'Paragraphs',
      value: stats.paragraphCount.toLocaleString(),
      icon: FileText,
      color: '#14b8a6',
    },
    {
      label: 'Sentences',
      value: stats.sentenceCount.toLocaleString(),
      icon: TrendingUp,
      color: '#f97316',
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            }}
          >
            <h2
              className="text-2xl font-bold"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Writing Statistics
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                color: theme === 'dark' ? '#f9fafb' : '#111827',
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map(stat => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="p-4 rounded-lg border transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                    borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: stat.color }} />
                    <span
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      {stat.label}
                    </span>
                  </div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                  >
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Insights */}
          <div
            className="p-6 border-t"
            style={{
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb',
            }}
          >
            <h3
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              Insights
            </h3>
            <div
              className="space-y-2 text-sm"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
            >
              <p>
                • Average words per paragraph:{' '}
                <span className="font-semibold">
                  {stats.paragraphCount > 0
                    ? Math.round(stats.wordCount / stats.paragraphCount)
                    : 0}
                </span>
              </p>
              <p>
                • Average words per sentence:{' '}
                <span className="font-semibold">
                  {stats.sentenceCount > 0 ? Math.round(stats.wordCount / stats.sentenceCount) : 0}
                </span>
              </p>
              <p>
                • Link density:{' '}
                <span className="font-semibold">
                  {stats.wordCount > 0 ? ((stats.linkCount / stats.wordCount) * 100).toFixed(1) : 0}
                  %
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
