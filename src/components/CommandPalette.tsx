'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Command,
  Zap,
  Settings,
  FileText,
  Network,
  Moon,
  Sun,
  Brain,
  PenTool,
  Compass,
  BookOpen,
  Map,
  BarChart3,
  Activity,
  Clock,
  Star,
} from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { analytics } from '@/lib/analytics';
import { PKMSystem } from '@/lib/pkm';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote?: (noteId: string) => void;
  notes?: Array<{ id: string; name: string; content: string }>;
  pkm: PKMSystem;
}

interface Command {
  id: string;
  name: string;
  description?: string;
  category: 'Plugin' | 'Navigation' | 'Note' | 'System' | 'AI' | 'Views';
  icon: React.ReactNode;
  action: () => void;
  keybinding?: string;
  usageCount?: number;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectNote,
  notes = [],
  pkm,
}: CommandPaletteProps) {
  const { theme, toggleTheme } = useSimpleTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commands, setCommands] = useState<Command[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Track command usage
  const trackCommandUsage = useCallback((commandId: string) => {
    const usage = JSON.parse(localStorage.getItem('command-usage') || '{}');
    usage[commandId] = (usage[commandId] || 0) + 1;
    localStorage.setItem('command-usage', JSON.stringify(usage));
  }, []);

  // Load commands from plugins and system
  const loadCommands = useCallback(async () => {
    const aiCommands: Command[] = [
      {
        id: 'ai-chat',
        name: 'AI Assistant',
        description: 'Open AI chat for context-aware assistance',
        category: 'AI',
        icon: <Brain className="w-4 h-4" />,
        keybinding: 'Ctrl+I',
        action: () => {
          trackCommandUsage('ai-chat');
          window.dispatchEvent(new CustomEvent('openAIChat'));
          analytics.trackEvent('ai_chat', { source: 'command_palette' });
          onClose();
        },
      },
      {
        id: 'writing-assistant',
        name: 'Writing Assistant',
        description: 'Get writing suggestions and improvements',
        category: 'AI',
        icon: <PenTool className="w-4 h-4" />,
        action: () => {
          trackCommandUsage('writing-assistant');
          window.dispatchEvent(new CustomEvent('openWritingAssistant'));
          analytics.trackEvent('ai_analysis', {
            action: 'writing_assistant',
            source: 'command_palette',
          });
          onClose();
        },
      },
      {
        id: 'knowledge-discovery',
        name: 'Knowledge Discovery',
        description: 'Discover patterns and gaps in your knowledge',
        category: 'AI',
        icon: <Compass className="w-4 h-4" />,
        action: () => {
          trackCommandUsage('knowledge-discovery');
          window.dispatchEvent(new CustomEvent('openKnowledgeDiscovery'));
          analytics.trackEvent('ai_analysis', {
            action: 'knowledge_discovery',
            source: 'command_palette',
          });
          onClose();
        },
      },
      {
        id: 'research-assistant',
        name: 'Research Assistant',
        description: 'AI-powered research and synthesis',
        category: 'AI',
        icon: <BookOpen className="w-4 h-4" />,
        action: () => {
          trackCommandUsage('research-assistant');
          window.dispatchEvent(new CustomEvent('openResearchAssistant'));
          analytics.trackEvent('ai_analysis', {
            action: 'research_assistant',
            source: 'command_palette',
          });
          onClose();
        },
      },
      {
        id: 'knowledge-map',
        name: 'Knowledge Map',
        description: 'Visualize your knowledge network',
        category: 'AI',
        icon: <Map className="w-4 h-4" />,
        action: () => {
          trackCommandUsage('knowledge-map');
          window.dispatchEvent(new CustomEvent('openKnowledgeMap'));
          analytics.trackEvent('ai_analysis', {
            action: 'knowledge_map',
            source: 'command_palette',
          });
          onClose();
        },
      },
      {
        id: 'batch-analyzer',
        name: 'Batch Analyzer',
        description: 'Analyze multiple notes at once',
        category: 'AI',
        icon: <BarChart3 className="w-4 h-4" />,
        action: () => {
          trackCommandUsage('batch-analyzer');
          window.dispatchEvent(new CustomEvent('openBatchAnalyzer'));
          analytics.trackEvent('ai_analysis', {
            action: 'batch_analyzer',
            source: 'command_palette',
          });
          onClose();
        },
      },
    ];

    const navigationCommands: Command[] = [
      {
        id: 'goto-editor',
        name: 'Go to Editor',
        description: 'Switch to the markdown editor view',
        category: 'Navigation',
        icon: <FileText className="w-4 h-4" />,
        keybinding: 'Ctrl+1',
        action: () => {
          trackCommandUsage('goto-editor');
          window.dispatchEvent(new CustomEvent('setCurrentView', { detail: 'editor' }));
          analytics.trackEvent('mode_switched', { view: 'editor', source: 'command_palette' });
          onClose();
        },
      },
      {
        id: 'goto-graph',
        name: 'Go to Graph View',
        description: 'Switch to the knowledge graph visualization',
        category: 'Navigation',
        icon: <Network className="w-4 h-4" />,
        keybinding: 'Ctrl+2',
        action: () => {
          trackCommandUsage('goto-graph');
          window.dispatchEvent(new CustomEvent('setCurrentView', { detail: 'graph' }));
          analytics.trackEvent('mode_switched', { view: 'graph', source: 'command_palette' });
          onClose();
        },
      },
      {
        id: 'goto-search',
        name: 'Go to Search',
        description: 'Switch to the search interface',
        category: 'Navigation',
        icon: <Search className="w-4 h-4" />,
        keybinding: 'Ctrl+3',
        action: () => {
          trackCommandUsage('goto-search');
          window.dispatchEvent(new CustomEvent('setCurrentView', { detail: 'search' }));
          analytics.trackEvent('mode_switched', { view: 'search', source: 'command_palette' });
          onClose();
        },
      },
      {
        id: 'goto-analytics',
        name: 'Go to Analytics',
        description: 'View knowledge base analytics',
        category: 'Navigation',
        icon: <Activity className="w-4 h-4" />,
        keybinding: 'Ctrl+4',
        action: () => {
          trackCommandUsage('goto-analytics');
          window.dispatchEvent(new CustomEvent('setCurrentView', { detail: 'analytics' }));
          analytics.trackEvent('mode_switched', { view: 'analytics', source: 'command_palette' });
          onClose();
        },
      },
      {
        id: 'goto-plugins',
        name: 'Go to Plugin Manager',
        description: 'Manage your plugins',
        category: 'Navigation',
        icon: <Settings className="w-4 h-4" />,
        keybinding: 'Ctrl+5',
        action: () => {
          trackCommandUsage('goto-plugins');
          window.dispatchEvent(new CustomEvent('setCurrentView', { detail: 'plugins' }));
          analytics.trackEvent('mode_switched', { view: 'plugins', source: 'command_palette' });
          onClose();
        },
      },
    ];

    const viewCommands: Command[] = [
      {
        id: 'toggle-right-panel',
        name: 'Toggle Right Panel',
        description: 'Show/hide document outline and backlinks',
        category: 'Views',
        icon: <FileText className="w-4 h-4" />,
        keybinding: 'Ctrl+\\',
        action: () => {
          trackCommandUsage('toggle-right-panel');
          window.dispatchEvent(new CustomEvent('toggleRightPanel'));
          onClose();
        },
      },
      {
        id: 'toggle-sidebar',
        name: 'Toggle Sidebar',
        description: 'Show/hide the left sidebar',
        category: 'Views',
        icon: <FileText className="w-4 h-4" />,
        keybinding: 'Ctrl+/',
        action: () => {
          trackCommandUsage('toggle-sidebar');
          window.dispatchEvent(new CustomEvent('toggleSidebar'));
          onClose();
        },
      },
    ];

    const systemCommands: Command[] = [
      {
        id: 'toggle-theme',
        name: 'Toggle Theme',
        description: 'Switch between light and dark theme',
        category: 'System',
        icon: theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
        action: () => {
          trackCommandUsage('toggle-theme');
          toggleTheme();
          onClose();
        },
      },
      {
        id: 'reload-app',
        name: 'Reload Application',
        description: 'Reload the application',
        category: 'System',
        icon: <Settings className="w-4 h-4" />,
        action: () => {
          trackCommandUsage('reload-app');
          window.location.reload();
          onClose();
        },
      },
    ];

    // Add note commands
    const noteCommands: Command[] = notes.slice(0, 10).map(note => ({
      id: `open-note-${note.id}`,
      name: `Open: ${note.name}`,
      description: note.content.slice(0, 100) + '...',
      category: 'Note',
      icon: <FileText className="w-4 h-4" />,
      action: () => {
        onSelectNote?.(note.id);
        onClose();
      },
    }));

    // Load plugin commands from the actual plugin manager
    const pluginCommands: Command[] = [];
    try {
      if (!pkm) {
        console.error('CommandPalette: PKM system not provided');
        return;
      }

      const pluginManager = pkm.getPluginManager();
      if (!pluginManager) {
        console.error('CommandPalette: Plugin manager not available');
        return;
      }

      const allPluginCommands = pluginManager.getAllCommands();

      console.log('CommandPalette: Loading plugin commands...');
      console.log('CommandPalette: Found', allPluginCommands.length, 'plugin commands');
      console.log('CommandPalette: Plugin commands:', allPluginCommands);

      for (const { command, pluginId, pluginName } of allPluginCommands) {
        pluginCommands.push({
          id: `${pluginId}-${command.id}`,
          name: command.name,
          description: `${command.description} (from ${pluginName})`,
          category: 'Plugin' as const,
          icon: <Zap className="w-4 h-4" />,
          keybinding: command.keybinding,
          action: async () => {
            try {
              console.log(`Executing command ${command.name} from ${pluginName}...`);

              // Execute the plugin command
              if (command.callback) {
                await command.callback();
              }

              // Track analytics
              analytics.trackEvent('mode_switched', {
                action: 'plugin_command_executed',
                pluginId,
                commandId: command.id,
                commandName: command.name,
              });

              onClose();
            } catch (error) {
              console.error(`Error executing plugin command ${command.id}:`, error);
            }
          },
        });
      }

      console.log('CommandPalette: Created', pluginCommands.length, 'plugin command entries');
    } catch (error) {
      console.error('Error loading plugin commands:', error);
    }

    // Load usage counts
    const usage = JSON.parse(localStorage.getItem('command-usage') || '{}');
    const allCommands = [
      ...aiCommands,
      ...navigationCommands,
      ...viewCommands,
      ...systemCommands,
      ...noteCommands,
      ...pluginCommands,
    ];

    // Add usage count to each command
    allCommands.forEach(cmd => {
      cmd.usageCount = usage[cmd.id] || 0;
    });

    setCommands(allCommands);

    console.log('CommandPalette: Final command summary:');
    console.log(`- AI commands: ${aiCommands.length}`);
    console.log(`- Navigation commands: ${navigationCommands.length}`);
    console.log(`- View commands: ${viewCommands.length}`);
    console.log(`- System commands: ${systemCommands.length}`);
    console.log(`- Note commands: ${noteCommands.length}`);
    console.log(`- Plugin commands: ${pluginCommands.length}`);
    console.log(`- Total commands: ${allCommands.length}`);
  }, [notes, onClose, onSelectNote, pkm, theme, toggleTheme, trackCommandUsage]);

  // Filter commands based on query
  const filteredCommands = commands.filter(
    cmd =>
      cmd.name.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      loadCommands();
      // Focus input after a brief delay to ensure it's rendered
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, loadCommands]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  // Get top 5 recently used commands
  const recentCommands = [...filteredCommands]
    .filter(cmd => (cmd.usageCount || 0) > 0)
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, 5);

  // Group remaining commands by category
  const categoryOrder = ['AI', 'Navigation', 'Views', 'Note', 'Plugin', 'System'];
  const groupedCommands = categoryOrder.reduce(
    (acc, category) => {
      const categoryCommands = filteredCommands.filter(cmd => cmd.category === category);
      if (categoryCommands.length > 0) {
        acc[category] = categoryCommands;
      }
      return acc;
    },
    {} as Record<string, Command[]>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Command Palette */}
      <div
        className="relative w-full max-w-2xl mx-4 rounded-lg shadow-2xl border"
        style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center p-4 border-b"
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          }}
        >
          <Command
            className="w-5 h-5 mr-3"
            style={{
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            }}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-base"
            style={{
              color: theme === 'dark' ? '#f9fafb' : '#111827',
            }}
          />
          <div
            className="text-xs px-2 py-1 rounded"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            }}
          >
            ESC to close
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {Object.keys(groupedCommands).length === 0 && recentCommands.length === 0 ? (
            <div
              className="p-4 text-center"
              style={{
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              }}
            >
              No commands found
            </div>
          ) : (
            <>
              {/* Recent Commands Section */}
              {recentCommands.length > 0 && query === '' && (
                <div>
                  <div
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wide border-b flex items-center gap-2"
                    style={{
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                      backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb',
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    }}
                  >
                    <Clock className="w-3 h-3" />
                    Recent Commands
                  </div>
                  {recentCommands.map(command => {
                    const globalIndex = filteredCommands.indexOf(command);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <div
                        key={command.id}
                        className="flex items-center p-3 cursor-pointer border-b"
                        style={{
                          backgroundColor: isSelected
                            ? theme === 'dark'
                              ? '#374151'
                              : '#f3f4f6'
                            : 'transparent',
                          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        }}
                        onClick={command.action}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div
                          className="mr-3"
                          style={{
                            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                          }}
                        >
                          {command.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="font-medium truncate"
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#111827',
                            }}
                          >
                            {command.name}
                          </div>
                          {command.description && (
                            <div
                              className="text-sm truncate"
                              style={{
                                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                              }}
                            >
                              {command.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Star
                            className="w-3 h-3"
                            style={{
                              color: theme === 'dark' ? '#fbbf24' : '#f59e0b',
                            }}
                          />
                          {command.keybinding && (
                            <div
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                                color: theme === 'dark' ? '#d1d5db' : '#374151',
                              }}
                            >
                              {command.keybinding
                                .replace('Ctrl', '⌘')
                                .replace('Shift', '⇧')
                                .replace('Alt', '⌥')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Categorized Commands */}
              {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                <div key={category}>
                  <div
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wide border-b"
                    style={{
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                      backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb',
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    }}
                  >
                    {category}
                  </div>
                  {categoryCommands.map(command => {
                    const globalIndex = filteredCommands.indexOf(command);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <div
                        key={command.id}
                        className="flex items-center p-3 cursor-pointer border-b last:border-b-0"
                        style={{
                          backgroundColor: isSelected
                            ? theme === 'dark'
                              ? '#374151'
                              : '#f3f4f6'
                            : 'transparent',
                          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        }}
                        onClick={command.action}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div
                          className="mr-3"
                          style={{
                            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                          }}
                        >
                          {command.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="font-medium truncate"
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#111827',
                            }}
                          >
                            {command.name}
                          </div>
                          {command.description && (
                            <div
                              className="text-sm truncate"
                              style={{
                                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                              }}
                            >
                              {command.description}
                            </div>
                          )}
                        </div>
                        {command.keybinding && (
                          <div
                            className="text-xs px-2 py-1 rounded ml-2"
                            style={{
                              backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                              color: theme === 'dark' ? '#d1d5db' : '#374151',
                            }}
                          >
                            {command.keybinding
                              .replace('Ctrl', '⌘')
                              .replace('Shift', '⇧')
                              .replace('Alt', '⌥')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
