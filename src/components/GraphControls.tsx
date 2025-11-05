'use client';

import { useState } from 'react';
import {
  Filter,
  Search,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Tag,
  Folder,
  Link2,
  X,
} from 'lucide-react';

interface GraphControlsProps {
  theme?: 'light' | 'dark';
  onFilterChange?: (filters: GraphFilters) => void;
  onSearch?: (query: string) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  tags?: string[];
  folders?: string[];
}

export interface GraphFilters {
  tags: string[];
  folders: string[];
  minConnections: number;
  showOrphans: boolean;
}

export default function GraphControls({
  theme = 'light',
  onFilterChange,
  onSearch,
  onZoomIn,
  onZoomOut,
  onFitView,
  tags = [],
  folders = [],
}: GraphControlsProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<GraphFilters>({
    tags: [],
    folders: [],
    minConnections: 0,
    showOrphans: true,
  });

  const handleFilterChange = (newFilters: Partial<GraphFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange?.(updated);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const legendItems = [
    { color: '#3b82f6', label: 'Hub (5+ connections)', shape: 'circle' },
    { color: '#10b981', label: 'Connected (1-4)', shape: 'circle' },
    { color: '#ef4444', label: 'Orphan (0 connections)', shape: 'circle' },
    { color: '#8b5cf6', label: 'Current Note', shape: 'star' },
  ];

  return (
    <>
      {/* Floating Controls Panel */}
      <div
        className="absolute top-4 left-4 rounded-lg shadow-lg border z-10"
        style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        }}
      >
        <div className="p-3 space-y-2">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded text-sm border"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                  borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                  color: theme === 'dark' ? '#f9fafb' : '#111827',
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1.5 rounded hover:bg-opacity-80 transition-colors"
              style={{
                backgroundColor: showFilters
                  ? theme === 'dark'
                    ? '#3b82f6'
                    : '#2563eb'
                  : theme === 'dark'
                    ? '#374151'
                    : '#f3f4f6',
                color: showFilters ? '#ffffff' : theme === 'dark' ? '#f9fafb' : '#111827',
              }}
              title="Filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div
              className="p-3 rounded border-t"
              style={{
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              }}
            >
              <div className="space-y-3">
                {/* Tags Filter */}
                <div>
                  <div
                    className="flex items-center gap-1 text-xs font-medium mb-1.5"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    <Tag className="w-3 h-3" />
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {tags.slice(0, 10).map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          const newTags = filters.tags.includes(tag)
                            ? filters.tags.filter(t => t !== tag)
                            : [...filters.tags, tag];
                          handleFilterChange({ tags: newTags });
                        }}
                        className="px-2 py-0.5 rounded text-xs transition-colors"
                        style={{
                          backgroundColor: filters.tags.includes(tag)
                            ? theme === 'dark'
                              ? '#3b82f6'
                              : '#2563eb'
                            : theme === 'dark'
                              ? '#374151'
                              : '#e5e7eb',
                          color: filters.tags.includes(tag)
                            ? '#ffffff'
                            : theme === 'dark'
                              ? '#d1d5db'
                              : '#374151',
                        }}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Folders Filter */}
                <div>
                  <div
                    className="flex items-center gap-1 text-xs font-medium mb-1.5"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    <Folder className="w-3 h-3" />
                    Folders
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {folders.slice(0, 10).map(folder => (
                      <button
                        key={folder}
                        onClick={() => {
                          const newFolders = filters.folders.includes(folder)
                            ? filters.folders.filter(f => f !== folder)
                            : [...filters.folders, folder];
                          handleFilterChange({ folders: newFolders });
                        }}
                        className="px-2 py-0.5 rounded text-xs transition-colors"
                        style={{
                          backgroundColor: filters.folders.includes(folder)
                            ? theme === 'dark'
                              ? '#3b82f6'
                              : '#2563eb'
                            : theme === 'dark'
                              ? '#374151'
                              : '#e5e7eb',
                          color: filters.folders.includes(folder)
                            ? '#ffffff'
                            : theme === 'dark'
                              ? '#d1d5db'
                              : '#374151',
                        }}
                      >
                        📁 {folder}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Connection Filter */}
                <div>
                  <div
                    className="flex items-center gap-1 text-xs font-medium mb-1.5"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    <Link2 className="w-3 h-3" />
                    Min Connections: {filters.minConnections}
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={filters.minConnections}
                    onChange={e => handleFilterChange({ minConnections: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Show Orphans Toggle */}
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showOrphans}
                    onChange={e => handleFilterChange({ showOrphans: e.target.checked })}
                    className="rounded"
                  />
                  <span style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                    Show orphan notes
                  </span>
                </label>

                {/* Clear Filters */}
                {(filters.tags.length > 0 ||
                  filters.folders.length > 0 ||
                  filters.minConnections > 0) && (
                  <button
                    onClick={() =>
                      handleFilterChange({
                        tags: [],
                        folders: [],
                        minConnections: 0,
                        showOrphans: true,
                      })
                    }
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-opacity-80"
                    style={{
                      backgroundColor: theme === 'dark' ? '#ef4444' : '#dc2626',
                      color: '#ffffff',
                    }}
                  >
                    <X className="w-3 h-3" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Zoom Controls */}
          <div
            className="flex items-center gap-1 pt-2 border-t"
            style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
          >
            <button
              onClick={onZoomIn}
              className="p-1.5 rounded hover:bg-opacity-80 transition-colors flex-1"
              style={{
                backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                color: theme === 'dark' ? '#f9fafb' : '#111827',
              }}
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={onZoomOut}
              className="p-1.5 rounded hover:bg-opacity-80 transition-colors flex-1"
              style={{
                backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                color: theme === 'dark' ? '#f9fafb' : '#111827',
              }}
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={onFitView}
              className="p-1.5 rounded hover:bg-opacity-80 transition-colors flex-1"
              style={{
                backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                color: theme === 'dark' ? '#f9fafb' : '#111827',
              }}
              title="Fit to View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="p-1.5 rounded hover:bg-opacity-80 transition-colors flex-1"
              style={{
                backgroundColor: showLegend
                  ? theme === 'dark'
                    ? '#3b82f6'
                    : '#2563eb'
                  : theme === 'dark'
                    ? '#374151'
                    : '#f3f4f6',
                color: showLegend ? '#ffffff' : theme === 'dark' ? '#f9fafb' : '#111827',
              }}
              title="Toggle Legend"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div
          className="absolute bottom-4 left-4 rounded-lg shadow-lg border z-10 p-3"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
            <span
              className="text-xs font-semibold"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Graph Legend
            </span>
          </div>
          <div className="space-y-1.5">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {item.shape === 'circle' ? (
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                ) : (
                  <div className="text-yellow-500">⭐</div>
                )}
                <span
                  className="text-xs"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
