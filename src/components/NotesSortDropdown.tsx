'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Calendar, Type, Link, Hash } from 'lucide-react';

export type SortOption = 'name' | 'date' | 'modified' | 'size' | 'links' | 'tags';
export type SortDirection = 'asc' | 'desc';

interface NotesSortDropdownProps {
  sortBy: SortOption;
  sortDirection: SortDirection;
  onSortChange: (sortBy: SortOption, direction: SortDirection) => void;
  theme?: string;
}

const NotesSortDropdown: React.FC<NotesSortDropdownProps> = ({
  sortBy,
  sortDirection,
  onSortChange,
  // theme = 'light', // Commented out: theme parameter not used
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions: Array<{ id: SortOption; label: string; icon: React.ReactNode }> = [
    { id: 'name', label: 'Name', icon: <Type className="w-4 h-4" /> },
    { id: 'date', label: 'Date Created', icon: <Calendar className="w-4 h-4" /> },
    { id: 'modified', label: 'Date Modified', icon: <Calendar className="w-4 h-4" /> },
    { id: 'links', label: 'Link Count', icon: <Link className="w-4 h-4" /> },
    { id: 'tags', label: 'Tag Count', icon: <Hash className="w-4 h-4" /> },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSort = (option: SortOption) => {
    if (option === sortBy) {
      // Toggle direction if same sort option
      onSortChange(option, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for new sort option
      onSortChange(option, 'asc');
    }
    setIsOpen(false);
  };

  const currentLabel = sortOptions.find(o => o.id === sortBy)?.label || 'Sort';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderColor: 'var(--border-primary)',
          color: 'var(--text-primary)',
        }}
        aria-label="Sort options"
        aria-expanded={isOpen}
      >
        <ArrowUpDown className="w-4 h-4" />
        <span className="text-sm">{currentLabel}</span>
        <span className="text-xs opacity-70">{sortDirection === 'asc' ? '↑' : '↓'}</span>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-48 rounded-lg border shadow-lg z-50 overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          {sortOptions.map(option => (
            <button
              key={option.id}
              onClick={() => handleSort(option.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-opacity-80"
              style={{
                backgroundColor: sortBy === option.id ? 'var(--bg-tertiary)' : 'transparent',
                color: 'var(--text-primary)',
              }}
            >
              {option.icon}
              <span className="flex-1 text-left">{option.label}</span>
              {sortBy === option.id && (
                <span className="text-xs opacity-70">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesSortDropdown;
