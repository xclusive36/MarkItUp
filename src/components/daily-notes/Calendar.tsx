'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  onDateSelect: (date: string) => void;
  existingDates?: string[];
}

export default function Calendar({ onDateSelect, existingDates = [] }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { year, month } = useMemo(() => {
    return {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
    };
  }, [currentDate]);

  const monthName = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', { month: 'long' });
  }, [currentDate]);

  // Calculate calendar grid (42 days across 6 weeks)
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();

    const days: Array<{
      date: number;
      month: 'prev' | 'current' | 'next';
      dateString: string;
      isToday: boolean;
      hasNote: boolean;
    }> = [];

    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        date: day,
        month: 'prev',
        dateString,
        isToday: dateString === todayString,
        hasNote: existingDates.includes(dateString),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        date: i,
        month: 'current',
        dateString,
        isToday: dateString === todayString,
        hasNote: existingDates.includes(dateString),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const dateString = `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        date: i,
        month: 'next',
        dateString,
        isToday: dateString === todayString,
        hasNote: existingDates.includes(dateString),
      });
    }

    return days;
  }, [year, month, existingDates]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {monthName} {year}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="text-center text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => onDateSelect(day.dateString)}
            className={`
              aspect-square p-2 rounded-lg text-sm font-medium transition-all
              ${day.month === 'current' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}
              ${day.isToday ? 'ring-2 ring-blue-500' : ''}
              ${day.hasNote ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}
            `}
            title={
              day.hasNote ? `View note for ${day.dateString}` : `Create note for ${day.dateString}`
            }
          >
            {day.date}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700" />
          <span>Has note</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded ring-2 ring-blue-500" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
