'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Link2, Sparkles, Tag, Copy, Check } from 'lucide-react';

interface SelectionActionBarProps {
  selectedText: string;
  selectionRect: DOMRect | null;
  onCreateLink: () => void;
  onAIAssist: () => void;
  onAddTag: () => void;
  theme?: 'light' | 'dark';
}

export default function SelectionActionBar({
  selectedText,
  selectionRect,
  onCreateLink,
  onAIAssist,
  onAddTag,
  theme = 'light',
}: SelectionActionBarProps) {
  const [copied, setCopied] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectionRect || !selectedText || selectedText.trim().length === 0) {
      setPosition(null);
      return;
    }

    // Use requestAnimationFrame to wait for the bar to render and get its width
    requestAnimationFrame(() => {
      if (barRef.current) {
        const barWidth = barRef.current.offsetWidth;
        // Calculate position above the selection, centered horizontally
        const top = selectionRect.top + window.scrollY - 48; // 48px is approximate bar height
        const left = selectionRect.left + selectionRect.width / 2 - barWidth / 2;

        setPosition({ top, left });
      } else {
        // Fallback if ref not ready yet
        const top = selectionRect.top + window.scrollY - 48;
        const left = selectionRect.left + selectionRect.width / 2;
        setPosition({ top, left });
      }
    });
  }, [selectionRect, selectedText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!position || !selectedText || selectedText.trim().length === 0) {
    return null;
  }

  const actions = [
    {
      id: 'link',
      label: 'Link',
      icon: Link2,
      onClick: onCreateLink,
      tooltip: 'Create wikilink',
    },
    {
      id: 'ai',
      label: 'AI',
      icon: Sparkles,
      onClick: onAIAssist,
      tooltip: 'AI assistance',
    },
    {
      id: 'tag',
      label: 'Tag',
      icon: Tag,
      onClick: onAddTag,
      tooltip: 'Add tag',
    },
    {
      id: 'copy',
      label: copied ? 'Copied' : 'Copy',
      icon: copied ? Check : Copy,
      onClick: handleCopy,
      tooltip: copied ? 'Copied!' : 'Copy to clipboard',
    },
  ];

  return (
    <div
      ref={barRef}
      className="fixed z-50 animate-fade-in-up"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg shadow-xl border backdrop-blur-custom"
        style={{
          backgroundColor:
            theme === 'dark' ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        }}
      >
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              title={action.tooltip}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'transparent',
                color: theme === 'dark' ? '#f9fafb' : '#111827',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>
      {/* Arrow pointer */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `6px solid ${theme === 'dark' ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)'}`,
          bottom: '-6px',
        }}
      />
    </div>
  );
}
