'use client';

import { useState } from 'react';

interface DailyNote {
  id: string;
  name: string;
  date: string;
  hasContent: boolean;
}

interface DailyNotesCalendarProps {
  notes: DailyNote[];
  onDateClick: (date: string) => void;
  currentStreak?: number;
}

export default function DailyNotesCalendar({
  notes,
  onDateClick,
  currentStreak = 0,
}: DailyNotesCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  // Check if a date has a note
  const hasNote = (day: number) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return notes.some(note => note.date === dateString);
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (day: number) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateClick(dateString);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="daily-notes-calendar p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold dark:text-white">Daily Notes</h3>
        {currentStreak > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900 rounded-full">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-bold text-orange-600 dark:text-orange-300">
              {currentStreak}
            </span>
          </div>
        )}
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          aria-label="Previous month"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <span className="font-medium dark:text-white">{monthName}</span>
          <button
            onClick={goToToday}
            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
          >
            Today
          </button>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const noteExists = hasNote(day);
          const today = isToday(day);
          const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => setHoveredDate(dateString)}
              onMouseLeave={() => setHoveredDate(null)}
              className={`
                aspect-square flex items-center justify-center rounded text-sm
                transition-all duration-200
                ${today ? 'font-bold ring-2 ring-blue-500' : ''}
                ${
                  noteExists
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                }
                ${hoveredDate === dateString ? 'scale-110 z-10' : ''}
              `}
              title={noteExists ? `Note for ${dateString}` : `Create note for ${dateString}`}
            >
              {day}
              {noteExists && <span className="absolute mt-6 text-xs">•</span>}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 dark:bg-green-900 rounded" />
            <span>Has note</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-blue-500 rounded" />
            <span>Today</span>
          </div>
        </div>
        <div className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          {notes.length} total notes
        </div>
      </div>
    </div>
  );
}
