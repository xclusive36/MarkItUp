'use client';

import React from 'react';
import { Clock, Tag, Link2Off, Calendar, TrendingUp, Star } from 'lucide-react';

export type FilterType = 'all' | 'today' | 'week' | 'untagged' | 'orphans' | 'recent' | 'pinned';

interface SidebarFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts?: {
    today?: number;
    week?: number;
    untagged?: number;
    orphans?: number;
    recent?: number;
    pinned?: number;
  };
  theme?: string;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  activeFilter,
  onFilterChange,
  counts = {},
  theme = 'light',
}) => {
  const filters: Array<{
    id: FilterType;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }> = [
    { id: 'today', label: 'Today', icon: <Calendar className="w-3 h-3" />, count: counts.today },
    {
      id: 'week',
      label: 'This Week',
      icon: <TrendingUp className="w-3 h-3" />,
      count: counts.week,
    },
    { id: 'recent', label: 'Recent', icon: <Clock className="w-3 h-3" />, count: counts.recent },
    { id: 'pinned', label: 'Pinned', icon: <Star className="w-3 h-3" />, count: counts.pinned },
    {
      id: 'untagged',
      label: 'Untagged',
      icon: <Tag className="w-3 h-3" />,
      count: counts.untagged,
    },
    {
      id: 'orphans',
      label: 'Orphans',
      icon: <Link2Off className="w-3 h-3" />,
      count: counts.orphans,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.map(filter => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`badge badge-clickable ${
            activeFilter === filter.id ? 'badge-primary' : ''
          } flex items-center gap-1.5`}
          title={`Show ${filter.label.toLowerCase()} notes`}
        >
          {filter.icon}
          <span>{filter.label}</span>
          {filter.count !== undefined && filter.count > 0 && (
            <span
              className="ml-1 px-1.5 py-0.5 text-xs rounded-full"
              style={{
                background:
                  activeFilter === filter.id
                    ? 'rgba(255, 255, 255, 0.2)'
                    : theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.1)',
              }}
            >
              {filter.count}
            </span>
          )}
        </button>
      ))}
      {activeFilter !== 'all' && (
        <button
          onClick={() => onFilterChange('all')}
          className="badge badge-clickable text-xs opacity-70 hover:opacity-100"
          title="Clear filter"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default SidebarFilters;
