'use client';

import React, { useMemo } from 'react';
import { List, ChevronRight } from 'lucide-react';

interface HeadingNode {
  id: string;
  level: number;
  text: string;
  line: number;
}

interface DocumentOutlinePanelProps {
  markdown: string;
  onHeadingClick?: (line: number) => void;
  theme?: 'light' | 'dark';
}

export const DocumentOutlinePanel: React.FC<DocumentOutlinePanelProps> = ({
  markdown,
  onHeadingClick,
  theme = 'light',
}) => {
  // Extract headings from markdown
  const headings = useMemo(() => {
    const lines = markdown.split('\n');
    const headingNodes: HeadingNode[] = [];

    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        headingNodes.push({
          id: `heading-${index}`,
          level,
          text,
          line: index,
        });
      }
    });

    return headingNodes;
  }, [markdown]);

  if (headings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <List className="w-12 h-12 mb-3 opacity-30" style={{ color: 'var(--text-secondary)' }} />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          No headings found in this document.
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
          Add headings using # symbols to see the outline.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-1">
        {headings.map(heading => {
          const indent = (heading.level - 1) * 16;

          return (
            <button
              key={heading.id}
              className="flex items-start gap-2 w-full text-left py-1.5 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              style={{
                paddingLeft: `${8 + indent}px`,
              }}
              onClick={() => onHeadingClick?.(heading.line)}
            >
              <ChevronRight
                className="w-3 h-3 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                style={{ color: 'var(--text-secondary)' }}
              />
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm block truncate ${
                    heading.level === 1
                      ? 'font-bold'
                      : heading.level === 2
                        ? 'font-semibold'
                        : 'font-normal'
                  }`}
                  style={{
                    color: heading.level <= 2 ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                  title={heading.text}
                >
                  {heading.text}
                </span>
              </div>
              {/* Heading level indicator */}
              <span
                className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                  color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                }}
              >
                H{heading.level}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentOutlinePanel;
