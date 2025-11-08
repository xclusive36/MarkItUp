'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from '@/components/daily-notes/Calendar';
import Link from 'next/link';

export default function DailyNotesPage() {
  const [existingDates, setExistingDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load existing daily notes
  useEffect(() => {
    fetch('/api/daily-note')
      .then(res => res.json())
      .then(data => {
        setExistingDates(data.dates || []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to load daily notes:', error);
        setIsLoading(false);
      });
  }, []);

  const handleDateSelect = async (dateString: string) => {
    try {
      // Check if note exists
      const checkRes = await fetch(`/api/daily-note?date=${dateString}`);
      const checkData = await checkRes.json();

      if (checkData.exists) {
        // Navigate to existing note
        router.push(`/editor/${encodeURIComponent(checkData.path)}`);
      } else {
        // Create new note
        const createRes = await fetch('/api/daily-note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateString }),
        });

        if (createRes.ok) {
          const createData = await createRes.json();
          router.push(`/editor/${encodeURIComponent(createData.path)}`);
        } else {
          alert('Failed to create daily note');
        }
      }
    } catch (error) {
      console.error('Error handling date select:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Daily Notes</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Your personal journal - click any date to create or view a daily note
          </p>
        </div>

        {/* Calendar */}
        {isLoading ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading your journal...</p>
            </div>
          </div>
        ) : (
          <Calendar onDateSelect={handleDateSelect} existingDates={existingDates} />
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {existingDates.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Entries</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {
                existingDates.filter(d => {
                  const date = new Date(d);
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - date.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 7;
                }).length
              }
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">This Week</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {
                existingDates.filter(d => {
                  const date = new Date(d);
                  const now = new Date();
                  return (
                    date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">This Month</div>
          </div>
        </div>

        {/* Recent Entries */}
        {existingDates.length > 0 && (
          <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Recent Entries
            </h2>
            <div className="space-y-2">
              {existingDates
                .sort()
                .reverse()
                .slice(0, 10)
                .map(date => (
                  <Link
                    key={date}
                    href={`/editor/journal/${date}.md`}
                    className="block p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-slate-900 dark:text-white font-medium">
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
