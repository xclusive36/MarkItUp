'use client';

import React from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Hash,
  Link2,
  List,
  ListOrdered,
  Code,
  Quote,
} from 'lucide-react';

interface MobileEditorToolbarProps {
  onInsertMarkdown: (markdown: string, offset?: number) => void;
  theme?: 'light' | 'dark';
}

export default function MobileEditorToolbar({
  onInsertMarkdown,
  theme = 'light',
}: MobileEditorToolbarProps) {
  const tools = [
    { id: 'bold', label: 'Bold', icon: Bold, markdown: '****', offset: -2 },
    { id: 'italic', label: 'Italic', icon: Italic, markdown: '**', offset: -1 },
    { id: 'strikethrough', label: 'Strike', icon: Strikethrough, markdown: '~~~~', offset: -2 },
    { id: 'heading', label: 'Heading', icon: Hash, markdown: '\n## ', offset: 0 },
    { id: 'link', label: 'Link', icon: Link2, markdown: '[]()', offset: -3 },
    { id: 'bullet', label: 'Bullet', icon: List, markdown: '\n- ', offset: 0 },
    { id: 'numbered', label: 'Numbered', icon: ListOrdered, markdown: '\n1. ', offset: 0 },
    { id: 'code', label: 'Code', icon: Code, markdown: '``', offset: -1 },
    { id: 'quote', label: 'Quote', icon: Quote, markdown: '\n> ', offset: 0 },
  ];

  return (
    <div
      className="md:hidden border-t overflow-x-auto no-scrollbar"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
      }}
    >
      <div className="flex items-center gap-1 p-2 min-w-max">
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onInsertMarkdown(tool.markdown, tool.offset)}
              className="flex flex-col items-center justify-center p-2 rounded-lg min-w-[56px] transition-all duration-200 active:scale-95"
              style={{
                backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                color: theme === 'dark' ? '#f9fafb' : '#111827',
              }}
              title={tool.label}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium">{tool.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
