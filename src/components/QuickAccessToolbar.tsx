'use client';

import React from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Code,
  Link,
  List,
  ListOrdered,
  Quote,
  Table,
  Image as ImageIcon,
  CheckSquare,
  Strikethrough,
} from 'lucide-react';

interface QuickAccessToolbarProps {
  onInsert: (before: string, after?: string) => void;
  theme: string;
  className?: string;
}

const QuickAccessToolbar: React.FC<QuickAccessToolbarProps> = ({
  onInsert,
  theme,
  className = '',
}) => {
  const buttonClass = `p-2 rounded-md transition-colors hover:bg-opacity-80 ${
    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
  }`;

  const iconClass = 'w-4 h-4';

  const tools = [
    {
      icon: <Heading1 className={iconClass} />,
      title: 'Heading 1',
      shortcut: 'Cmd+1',
      action: () => onInsert('# ', '\n'),
    },
    {
      icon: <Heading2 className={iconClass} />,
      title: 'Heading 2',
      shortcut: 'Cmd+2',
      action: () => onInsert('## ', '\n'),
    },
    {
      icon: <Heading3 className={iconClass} />,
      title: 'Heading 3',
      shortcut: 'Cmd+3',
      action: () => onInsert('### ', '\n'),
    },
    { divider: true },
    {
      icon: <Bold className={iconClass} />,
      title: 'Bold',
      shortcut: 'Cmd+B',
      action: () => onInsert('**', '**'),
    },
    {
      icon: <Italic className={iconClass} />,
      title: 'Italic',
      shortcut: 'Cmd+I',
      action: () => onInsert('*', '*'),
    },
    {
      icon: <Strikethrough className={iconClass} />,
      title: 'Strikethrough',
      action: () => onInsert('~~', '~~'),
    },
    {
      icon: <Code className={iconClass} />,
      title: 'Inline Code',
      shortcut: 'Cmd+E',
      action: () => onInsert('`', '`'),
    },
    { divider: true },
    {
      icon: <Link className={iconClass} />,
      title: 'Link',
      shortcut: 'Cmd+K',
      action: () => onInsert('[', '](url)'),
    },
    {
      icon: <ImageIcon className={iconClass} />,
      title: 'Image',
      action: () => onInsert('![alt text](', ')'),
    },
    { divider: true },
    {
      icon: <List className={iconClass} />,
      title: 'Bullet List',
      action: () => onInsert('- ', '\n'),
    },
    {
      icon: <ListOrdered className={iconClass} />,
      title: 'Numbered List',
      action: () => onInsert('1. ', '\n'),
    },
    {
      icon: <CheckSquare className={iconClass} />,
      title: 'Task List',
      action: () => onInsert('- [ ] ', '\n'),
    },
    { divider: true },
    {
      icon: <Quote className={iconClass} />,
      title: 'Blockquote',
      action: () => onInsert('> ', '\n'),
    },
    {
      icon: <Table className={iconClass} />,
      title: 'Table',
      action: () =>
        onInsert(
          '\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Cell 1   | Cell 2   | Cell 3   |\n',
          ''
        ),
    },
  ];

  return (
    <div
      className={`flex items-center gap-1 p-2 rounded-lg border ${className}`}
      style={{
        backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        color: theme === 'dark' ? '#f9fafb' : '#111827',
      }}
    >
      {tools.map((tool, index) => {
        if ('divider' in tool) {
          return (
            <div
              key={`divider-${index}`}
              className="w-px h-6 mx-1"
              style={{
                backgroundColor: theme === 'dark' ? '#374151' : '#d1d5db',
              }}
            />
          );
        }

        return (
          <button
            key={index}
            onClick={tool.action}
            className={buttonClass}
            title={`${tool.title}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
            type="button"
          >
            {tool.icon}
          </button>
        );
      })}
    </div>
  );
};

export default QuickAccessToolbar;
