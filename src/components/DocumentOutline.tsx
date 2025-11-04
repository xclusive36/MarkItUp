'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Hash,
  Eye,
  EyeOff,
  BarChart3,
  Navigation,
} from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';

export interface HeadingItem {
  level: number;
  text: string;
  id: string;
  line: number;
  wordCount?: number;
  isActive?: boolean;
}

interface DocumentOutlineProps {
  headings: HeadingItem[];
  currentLine?: number;
  onHeadingClick: (heading: HeadingItem) => void;
  onRefresh?: () => void;
  showWordCounts?: boolean;
  showLineNumbers?: boolean;
}

export default function DocumentOutline({
  headings,
  currentLine,
  onHeadingClick,
  onRefresh,
  showWordCounts = true,
  showLineNumbers = false,
}: DocumentOutlineProps) {
  const { theme } = useSimpleTheme();
  const isDark = theme === 'dark';
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [showStats, setShowStats] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    const levelCounts: Record<number, number> = {};
    let totalWords = 0;

    headings.forEach(h => {
      levelCounts[h.level] = (levelCounts[h.level] || 0) + 1;
      totalWords += h.wordCount || 0;
    });

    return {
      totalHeadings: headings.length,
      levelCounts,
      totalWords,
      avgWordsPerSection: headings.length > 0 ? Math.round(totalWords / headings.length) : 0,
      deepestLevel: Math.max(...headings.map(h => h.level), 1),
    };
  }, [headings]);

  // Find active heading based on current line
  const activeHeadingIndex = useMemo(() => {
    if (currentLine === undefined) return -1;

    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      if (heading && heading.line <= currentLine) {
        return i;
      }
    }
    return -1;
  }, [headings, currentLine]);

  // Auto-scroll to active heading
  useEffect(() => {
    if (activeHeadingIndex >= 0) {
      const element = document.getElementById(`outline-heading-${activeHeadingIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeHeadingIndex]);

  const toggleCollapse = (headingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(headingId)) {
        next.delete(headingId);
      } else {
        next.add(headingId);
      }
      return next;
    });
  };

  // Check if heading should be hidden (parent is collapsed)
  const isHidden = (index: number): boolean => {
    if (index === 0) return false;

    const currentHeading = headings[index];
    if (!currentHeading) return false;

    const currentLevel = currentHeading.level;

    // Look backward to find parent
    for (let i = index - 1; i >= 0; i--) {
      const parentHeading = headings[i];
      if (!parentHeading) continue;

      const parentLevel = parentHeading.level;
      if (parentLevel < currentLevel) {
        // Found parent
        if (collapsedSections.has(parentHeading.id)) {
          return true;
        }
        // Check if this parent is also hidden
        return isHidden(i);
      }
    }

    return false;
  };

  // Check if heading has children
  const hasChildren = (index: number): boolean => {
    if (index >= headings.length - 1) return false;

    const currentHeading = headings[index];
    if (!currentHeading) return false;

    const currentLevel = currentHeading.level;
    const nextLevel = headings[index + 1]?.level;

    return nextLevel !== undefined && nextLevel > currentLevel;
  };

  if (headings.length === 0) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center p-6 text-center"
        style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          color: isDark ? '#9ca3af' : '#6b7280',
        }}
      >
        <FileText className="w-16 h-16 mb-4 opacity-30" />
        <h3 className="font-semibold mb-2" style={{ color: isDark ? '#d1d5db' : '#374151' }}>
          No Headings Found
        </h3>
        <p className="text-sm mb-4">
          Add headings to your document using # symbols to see the outline.
        </p>
        <div
          className="text-xs p-3 rounded"
          style={{
            backgroundColor: isDark ? '#374151' : '#f3f4f6',
            color: isDark ? '#9ca3af' : '#6b7280',
          }}
        >
          <div className="font-mono mb-1"># Heading 1</div>
          <div className="font-mono mb-1">## Heading 2</div>
          <div className="font-mono">### Heading 3</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        color: isDark ? '#e5e7eb' : '#1f2937',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{
          borderColor: isDark ? '#374151' : '#e5e7eb',
          backgroundColor: isDark ? '#111827' : '#f9fafb',
        }}
      >
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5" style={{ color: isDark ? '#60a5fa' : '#3b82f6' }} />
          <h3 className="font-semibold">Document Outline</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Toggle Statistics"
          >
            {showStats ? <EyeOff className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
          </button>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Refresh Outline"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && (
        <div
          className="p-4 border-b space-y-2"
          style={{
            borderColor: isDark ? '#374151' : '#e5e7eb',
            backgroundColor: isDark ? '#111827' : '#f9fafb',
          }}
        >
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs opacity-60">Total Headings</div>
              <div className="font-semibold text-lg">{stats.totalHeadings}</div>
            </div>
            <div>
              <div className="text-xs opacity-60">Deepest Level</div>
              <div className="font-semibold text-lg">H{stats.deepestLevel}</div>
            </div>
          </div>

          {showWordCounts && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs opacity-60">Total Words</div>
                <div className="font-semibold">{stats.totalWords.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs opacity-60">Avg per Section</div>
                <div className="font-semibold">{stats.avgWordsPerSection}</div>
              </div>
            </div>
          )}

          <div className="text-xs opacity-60 pt-2">
            Heading Distribution:
            <div className="flex gap-2 mt-1">
              {Object.entries(stats.levelCounts).map(([level, count]) => (
                <span
                  key={level}
                  className="px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: isDark ? '#374151' : '#e5e7eb',
                  }}
                >
                  H{level}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Outline List */}
      <div className="flex-1 overflow-y-auto">
        {headings.map((heading, index) => {
          if (isHidden(index)) return null;

          const isActive = index === activeHeadingIndex;
          const isCollapsed = collapsedSections.has(heading.id);
          const hasKids = hasChildren(index);
          const indent = (heading.level - 1) * 16;

          return (
            <div
              key={`${heading.id}-${index}`}
              id={`outline-heading-${index}`}
              className="group relative"
              style={{
                paddingLeft: `${indent + 12}px`,
              }}
            >
              <button
                onClick={() => onHeadingClick(heading)}
                className="w-full text-left py-2 px-3 flex items-start gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                style={{
                  backgroundColor: isActive ? (isDark ? '#1e3a8a' : '#dbeafe') : 'transparent',
                  borderLeft: isActive
                    ? `3px solid ${isDark ? '#3b82f6' : '#2563eb'}`
                    : '3px solid transparent',
                }}
              >
                {/* Collapse Toggle */}
                {hasKids && (
                  <button
                    onClick={e => toggleCollapse(heading.id, e)}
                    className="flex-shrink-0 mt-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-0.5 transition-colors"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <Hash
                      className="flex-shrink-0 mt-1"
                      style={{
                        width: `${12 + heading.level}px`,
                        height: `${12 + heading.level}px`,
                        opacity: 0.5,
                      }}
                    />
                    <span
                      className="truncate"
                      style={{
                        fontSize: `${16 - heading.level * 0.5}px`,
                        fontWeight: heading.level <= 2 ? 600 : 400,
                      }}
                    >
                      {heading.text}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 mt-1 text-xs opacity-60">
                    {showLineNumbers && <span className="font-mono">L{heading.line}</span>}
                    {showWordCounts && heading.wordCount !== undefined && (
                      <span>{heading.wordCount} words</span>
                    )}
                    <span className="opacity-40">H{heading.level}</span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="p-3 border-t text-xs text-center opacity-60"
        style={{
          borderColor: isDark ? '#374151' : '#e5e7eb',
          backgroundColor: isDark ? '#111827' : '#f9fafb',
        }}
      >
        Click any heading to navigate
      </div>
    </div>
  );
}
