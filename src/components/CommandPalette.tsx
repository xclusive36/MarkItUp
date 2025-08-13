'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Command, Zap, Settings, FileText, Network, Moon, Sun } from 'lucide-react';
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
  category: 'Plugin' | 'Navigation' | 'Note' | 'System';
  icon: React.ReactNode;
  action: () => void;
  keybinding?: string;
}

export default function CommandPalette({ isOpen, onClose, onSelectNote, notes = [], pkm }: CommandPaletteProps) {
  const { theme, toggleTheme } = useSimpleTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commands, setCommands] = useState<Command[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load commands from plugins and system
  const loadCommands = useCallback(async () => {
    const systemCommands: Command[] = [
      {
        id: 'goto-editor',
        name: 'Go to Editor',
        description: 'Switch to the markdown editor view',
        category: 'Navigation',
        icon: <FileText className="w-4 h-4" />,
        action: () => {
          // This would be passed as a prop in real implementation
          console.log('Switch to editor view');
          onClose();
        }
      },
      {
        id: 'goto-graph',
        name: 'Go to Graph View',
        description: 'Switch to the knowledge graph visualization',
        category: 'Navigation',
        icon: <Network className="w-4 h-4" />,
        action: () => {
          console.log('Switch to graph view');
          onClose();
        }
      },
      {
        id: 'goto-search',
        name: 'Go to Search',
        description: 'Switch to the search interface',
        category: 'Navigation',
        icon: <Search className="w-4 h-4" />,
        action: () => {
          console.log('Switch to search view');
          onClose();
        }
      },
      {
        id: 'open-settings',
        name: 'Open Settings',
        description: 'Open application settings',
        category: 'System',
        icon: <Settings className="w-4 h-4" />,
        action: () => {
          console.log('Open settings');
          onClose();
        }
      },
      {
        id: 'toggle-theme',
        name: 'Toggle Theme',
        description: 'Switch between light and dark theme',
        category: 'System',
        icon: theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
        action: () => {
          console.log('Toggle theme');
          toggleTheme();
          onClose();
        }
      },
      {
        id: 'reload-app',
        name: 'Reload Application',
        description: 'Reload the application',
        category: 'System',
        icon: <Settings className="w-4 h-4" />,
        action: () => {
          console.log('Reload application');
          window.location.reload();
          onClose();
        }
      }
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
      }
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
                commandName: command.name
              });
              
              onClose();
            } catch (error) {
              console.error(`Error executing plugin command ${command.id}:`, error);
            }
          }
        });
      }
      
      console.log('CommandPalette: Created', pluginCommands.length, 'plugin command entries');
    } catch (error) {
      console.error('Error loading plugin commands:', error);
    }

    setCommands([...systemCommands, ...noteCommands, ...pluginCommands]);
    
    console.log('CommandPalette: Final command summary:');
    console.log(`- System commands: ${systemCommands.length}`);
    console.log(`- Note commands: ${noteCommands.length}`);
    console.log(`- Plugin commands: ${pluginCommands.length}`);
    console.log(`- Total commands: ${systemCommands.length + noteCommands.length + pluginCommands.length}`);
  }, [notes, onClose, onSelectNote, pkm, theme, toggleTheme]);

  // Filter commands based on query
  const filteredCommands = commands.filter(cmd => 
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
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
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

  const categoryOrder = ['Navigation', 'Note', 'Plugin', 'System'];
  const groupedCommands = categoryOrder.reduce((acc, category) => {
    const categoryCommands = filteredCommands.filter(cmd => cmd.category === category);
    if (categoryCommands.length > 0) {
      acc[category] = categoryCommands;
    }
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Command Palette */}
      <div 
        className="relative w-full max-w-2xl mx-4 rounded-lg shadow-2xl border"
        style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
        }}
      >
        {/* Header */}
        <div className="flex items-center p-4 border-b" style={{
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
        }}>
          <Command className="w-5 h-5 mr-3" style={{
            color: theme === 'dark' ? '#9ca3af' : '#6b7280'
          }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-base"
            style={{
              color: theme === 'dark' ? '#f9fafb' : '#111827'
            }}
          />
          <div className="text-xs px-2 py-1 rounded" style={{
            backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
            color: theme === 'dark' ? '#9ca3af' : '#6b7280'
          }}>
            ESC to close
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="p-4 text-center" style={{
              color: theme === 'dark' ? '#9ca3af' : '#6b7280'
            }}>
              No commands found
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category}>
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide border-b" style={{
                  color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb',
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                }}>
                  {category}
                </div>
                {categoryCommands.map((command) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  const isSelected = globalIndex === selectedIndex;
                  
                  return (
                    <div
                      key={command.id}
                      className="flex items-center p-3 cursor-pointer border-b last:border-b-0"
                      style={{
                        backgroundColor: isSelected 
                          ? (theme === 'dark' ? '#374151' : '#f3f4f6')
                          : 'transparent',
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                      }}
                      onClick={command.action}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      <div className="mr-3" style={{
                        color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                      }}>
                        {command.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate" style={{
                          color: theme === 'dark' ? '#f9fafb' : '#111827'
                        }}>
                          {command.name}
                        </div>
                        {command.description && (
                          <div className="text-sm truncate" style={{
                            color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                          }}>
                            {command.description}
                          </div>
                        )}
                      </div>
                      {command.keybinding && (
                        <div className="text-xs px-2 py-1 rounded ml-2" style={{
                          backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                          color: theme === 'dark' ? '#d1d5db' : '#374151'
                        }}>
                          {command.keybinding.replace('Ctrl', '⌘').replace('Shift', '⇧').replace('Alt', '⌥')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
