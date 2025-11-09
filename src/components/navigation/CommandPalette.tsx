'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Command {
  type: 'file' | 'action';
  label: string;
  path?: string;
  action?: () => void;
  icon?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [files, setFiles] = useState<Array<{ path: string; title: string }>>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load files
  useEffect(() => {
    if (isOpen) {
      fetch('/api/files/list')
        .then(res => res.json())
        .then(data => {
          const fileList = data.files || [];
          setFiles(fileList);
        })
        .catch(error => {
          console.error('Failed to load files:', error);
        });
    }
  }, [isOpen]);

  // Build commands list
  const commands = useMemo(() => {
    const cmds: Command[] = [
      {
        type: 'action',
        label: 'New Note',
        icon: '📝',
        action: () => {
          onClose();
          router.push('/editor/new');
        },
      },
      {
        type: 'action',
        label: 'Daily Journal',
        icon: '📅',
        action: () => {
          onClose();
          router.push('/daily-notes');
        },
      },
      {
        type: 'action',
        label: 'Knowledge Graph',
        icon: '🕸️',
        action: () => {
          onClose();
          router.push('/graph');
        },
      },
      {
        type: 'action',
        label: 'Search Files',
        icon: '🔍',
        action: () => {
          onClose();
          router.push('/search');
        },
      },
      {
        type: 'action',
        label: 'AI Assistant',
        icon: '🤖',
        action: () => {
          onClose();
          router.push('/ai-chat');
        },
      },
      {
        type: 'action',
        label: 'Settings',
        icon: '⚙️',
        action: () => {
          onClose();
          router.push('/settings');
        },
      },
    ];

    // Add files
    files.forEach(file => {
      cmds.push({
        type: 'file',
        label: file.title,
        path: file.path,
      });
    });

    return cmds;
  }, [files, onClose, router]);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd => cmd.label.toLowerCase().includes(lowerQuery));
  }, [commands, query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i < filteredCommands.length - 1 ? i + 1 : i));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i > 0 ? i - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) {
          if (cmd.type === 'file' && cmd.path) {
            router.push(`/editor/${encodeURIComponent(cmd.path)}`);
            onClose();
          } else if (cmd.action) {
            cmd.action();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose, router]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Command Palette */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search files and commands..."
            className="w-full px-4 py-2 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-lg"
          />
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No results found</div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((cmd, index) => (
                <button
                  key={`${cmd.type}-${cmd.label}-${index}`}
                  onClick={() => {
                    if (cmd.type === 'file' && cmd.path) {
                      router.push(`/editor/${encodeURIComponent(cmd.path)}`);
                      onClose();
                    } else if (cmd.action) {
                      cmd.action();
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {cmd.icon && <span className="text-xl">{cmd.icon}</span>}
                  {!cmd.icon && cmd.type === 'file' && (
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{cmd.label}</div>
                    {cmd.path && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">{cmd.path}</div>
                    )}
                  </div>
                  {cmd.type === 'action' && (
                    <div className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      Action
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded">
                  ↑↓
                </kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded">
                  ↵
                </kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded">
                  Esc
                </kbd>
                Close
              </span>
            </div>
            <span>{filteredCommands.length} results</span>
          </div>
        </div>
      </div>
    </div>
  );
}
