'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import DailyNotesCalendar from './DailyNotesCalendar';
import { getPluginManager } from '@/lib/plugin-init';

interface DailyNote {
  id: string;
  name: string;
  date: string;
  hasContent: boolean;
}

interface DailyNotesCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect?: (dateStr: string) => void;
  theme?: 'light' | 'dark';
}

export default function DailyNotesCalendarModal({
  isOpen,
  onClose,
  onDateSelect,
  theme = 'light',
}: DailyNotesCalendarModalProps) {
  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadCalendarData();
    }
  }, [isOpen]);

  const loadCalendarData = async () => {
    setIsLoading(true);
    try {
      const pluginManager = getPluginManager();
      if (!pluginManager) {
        console.error('Plugin manager not available');
        setIsLoading(false);
        return;
      }

      // Try to get all notes
      const allNotes = pluginManager.getLoadedPlugins().find(p => p.id === 'daily-notes');

      // Fallback: fetch from API
      const response = await fetch('/api/files?limit=1000');
      if (response.ok) {
        const responseData = await response.json();
        // Handle both old array format and new pagination format
        const notes = Array.isArray(responseData) ? responseData : responseData.notes;
        const datePattern = /^\d{4}-\d{2}-\d{2}(\.md)?$/;

        const formattedNotes: DailyNote[] = notes
          .filter((note: any) => datePattern.test(note.name) || note.folder === 'Daily Notes')
          .map((note: any) => {
            const match = note.name.match(/(\d{4}-\d{2}-\d{2})/);
            return {
              id: note.id,
              name: note.name,
              date: match ? match[1] : '',
              hasContent: note.content && note.content.length > 50,
            };
          })
          .filter((note: DailyNote) => note.date);

        setDailyNotes(formattedNotes);

        // Calculate streak
        const streak = calculateStreak(formattedNotes);
        setCurrentStreak(streak);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      setIsLoading(false);
    }
  };

  const calculateStreak = (notes: DailyNote[]): number => {
    if (notes.length === 0) return 0;

    const sortedDates = notes
      .map(n => n.date)
      .sort()
      .reverse();

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDates.length; i++) {
      const dateString = sortedDates[i];
      if (!dateString) break;

      const noteDate = new Date(dateString);
      noteDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (noteDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const handleDateClick = async (dateStr: string) => {
    console.log('Date selected:', dateStr);

    if (onDateSelect) {
      onDateSelect(dateStr);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div>
            <h2
              className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              📅 Daily Notes Calendar
            </h2>
            {!isLoading && (
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {dailyNotes.length} notes • 🔥 {currentStreak} day streak
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            aria-label="Close calendar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Calendar Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loading your daily notes...
                </p>
              </div>
            </div>
          ) : (
            <DailyNotesCalendar
              notes={dailyNotes}
              onDateClick={handleDateClick}
              currentStreak={currentStreak}
            />
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between p-4 border-t ${
            theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            💡 Click any date to view or create a daily note
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
