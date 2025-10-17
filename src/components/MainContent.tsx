import EditorModeToggle from './EditorModeToggle';
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';
import WysiwygEditor from './WysiwygEditor';
import { ThemeCreator } from './ThemeCreator';
import ZenMode from './ZenMode';
import SplitView from './SplitView';
import SelectionActionBar from './SelectionActionBar';
import MobileEditorToolbar from './MobileEditorToolbar';
import React, { useState, useEffect, useRef } from 'react';
import { AnalyticsSystem } from '@/lib/analytics';
import { getThemeCreatorPluginInstance } from '@/plugins/theme-creator';
import { getPluginManager } from '@/lib/plugin-init';
import { MoreVertical, FileText, Maximize2, Palette, Sparkles } from 'lucide-react';

interface MainContentProps {
  markdown: string;
  viewMode: 'edit' | 'preview' | 'split';
  setViewMode: (v: 'edit' | 'preview' | 'split') => void;
  handleMarkdownChange: (v: string) => void;
  processedMarkdown: string;
  theme: string;
  analytics: AnalyticsSystem;
  editorRef?: React.RefObject<HTMLTextAreaElement | null>;
  // Add more props as needed for your use case
}
// ...existing code...

const MainContent: React.FC<MainContentProps> = ({
  markdown,
  // setMarkdown removed
  viewMode,
  setViewMode,
  handleMarkdownChange,
  processedMarkdown,
  theme,
  analytics,
  editorRef,
}) => {
  const [editorType, setEditorType] = useState<'markdown' | 'wysiwyg'>('markdown');
  const [isThemeCreatorOpen, setIsThemeCreatorOpen] = useState(false);
  const [isThemeCreatorPluginLoaded, setIsThemeCreatorPluginLoaded] = useState(false);
  const [isEditorOptionsOpen, setIsEditorOptionsOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const editorOptionsRef = useRef<HTMLDivElement>(null);

  // Selection state for SelectionActionBar
  const [selectedText, setSelectedText] = useState('');
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

  // Handle text selection for action bar
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const text = selection?.toString() || '';

      if (text.trim().length > 0 && editorRef?.current) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        setSelectedText(text);
        setSelectionRect(rect || null);
      } else {
        setSelectedText('');
        setSelectionRect(null);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [editorRef]);

  // Handle mobile toolbar markdown insertion
  const handleInsertMarkdown = (markdownSyntax: string, offset?: number) => {
    if (!editorRef?.current) return;

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    let newText = before + markdownSyntax + after;
    let newCursorPos = start + markdownSyntax.length + (offset || 0);

    // If there's selected text, wrap it
    if (selected) {
      const [opening, closing] = markdownSyntax.includes('[[')
        ? ['[[', ']]']
        : markdownSyntax.split(selected);
      newText = before + (opening || markdownSyntax) + selected + (closing || '') + after;
      newCursorPos = end + (opening || markdownSyntax).length + (closing || '').length;
    }

    handleMarkdownChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Show buttons on desktop (md and up)
  const desktopShowClass = 'hidden md:flex';
  const mobileShowClass = 'md:hidden';

  // Check if Theme Creator plugin is loaded
  useEffect(() => {
    const checkPluginStatus = () => {
      const pluginManager = getPluginManager();
      if (pluginManager) {
        const loadedPlugins = pluginManager.getLoadedPlugins();
        const isLoaded = loadedPlugins.some(plugin => plugin.id === 'theme-creator');
        setIsThemeCreatorPluginLoaded(isLoaded);
      }
    };

    // Check immediately
    checkPluginStatus();

    // Set up an interval to check periodically (in case plugin is loaded/unloaded)
    const interval = setInterval(checkPluginStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorOptionsRef.current && !editorOptionsRef.current.contains(event.target as Node)) {
        setIsEditorOptionsOpen(false);
      }
    };

    if (isEditorOptionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditorOptionsOpen]);

  // Register the theme creator open callback with the plugin
  useEffect(() => {
    const pluginInstance = getThemeCreatorPluginInstance();
    if (pluginInstance) {
      pluginInstance.registerOpenCreatorCallback(() => {
        setIsThemeCreatorOpen(true);
      });
    }
  }, []);

  // Keyboard shortcut for Zen Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const metaKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl+Shift+F for Zen Mode
      if (metaKey && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsZenMode(true);
        analytics.trackEvent('mode_switched', { mode: 'zen', trigger: 'keyboard' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [analytics]);

  return (
    <>
      {/* Zen Mode Overlay */}
      {isZenMode && (
        <ZenMode
          markdown={markdown}
          onMarkdownChange={handleMarkdownChange}
          onClose={() => setIsZenMode(false)}
          theme={theme}
        />
      )}

      <div
        className="rounded-lg shadow-sm border flex flex-col h-full min-h-screen"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
          minHeight: '100vh',
        }}
      >
        {/* Editor Mode Toggle and WYSIWYG Toggle */}
        <div className="flex justify-between items-center w-full px-4 pt-4 mb-4">
          {/* Left side buttons */}
          <div className="flex items-center gap-2">
            {/* Desktop: Individual Buttons (visible on md and up) */}
            {viewMode === 'edit' && (
              <>
                {/* WYSIWYG Toggle - Desktop */}
                <button
                  onClick={() => {
                    const newType = editorType === 'markdown' ? 'wysiwyg' : 'markdown';
                    setEditorType(newType);
                    analytics.trackEvent('mode_switched', { mode: newType });
                  }}
                  className={`${desktopShowClass} items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors`}
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-secondary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span>{editorType === 'markdown' ? '📝' : '🎨'}</span>
                  <span>{editorType === 'markdown' ? 'Markdown' : 'WYSIWYG'}</span>
                </button>

                {/* Theme Creator Button - Desktop - Only show if plugin is loaded */}
                {isThemeCreatorPluginLoaded && (
                  <button
                    onClick={() => setIsThemeCreatorOpen(true)}
                    className={`${desktopShowClass} items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors hover:opacity-80`}
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-secondary)',
                      color: 'var(--text-primary)',
                    }}
                    title="Open Theme Creator (Ctrl+Shift+T)"
                  >
                    <span>🎨</span>
                    <span>Themes</span>
                  </button>
                )}

                {/* Zen Mode Button - Desktop */}
                <button
                  onClick={() => {
                    setIsZenMode(true);
                    analytics.trackEvent('mode_switched', { mode: 'zen' });
                  }}
                  className={`${desktopShowClass} items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors hover:opacity-80`}
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-secondary)',
                    color: 'var(--text-primary)',
                  }}
                  title="Zen Mode (Ctrl+Shift+F) - Distraction-free writing"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Zen Mode</span>
                </button>

                {/* Mobile: Dropdown Menu (visible below md/lg) */}
                <div className={`${mobileShowClass} relative`} ref={editorOptionsRef}>
                  <button
                    onClick={() => setIsEditorOptionsOpen(!isEditorOptionsOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-secondary)',
                      color: 'var(--text-primary)',
                    }}
                    aria-label="Editor options menu"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-xs">Editor</span>
                    <MoreVertical className="w-3 h-3 ml-1" />
                  </button>

                  {/* Dropdown Menu */}
                  {isEditorOptionsOpen && (
                    <div
                      className="absolute left-0 top-full mt-1 min-w-[160px] rounded-lg shadow-lg border z-50 py-1"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-primary)',
                      }}
                    >
                      {/* Markdown/WYSIWYG Toggle */}
                      <button
                        onClick={() => {
                          const newType = editorType === 'markdown' ? 'wysiwyg' : 'markdown';
                          setEditorType(newType);
                          analytics.trackEvent('mode_switched', { mode: newType });
                          setIsEditorOptionsOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm transition-colors"
                        style={{
                          color: 'var(--text-primary)',
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {editorType === 'markdown' ? (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Switch to WYSIWYG</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4" />
                            <span>Switch to Markdown</span>
                          </>
                        )}
                      </button>

                      {/* Theme Creator Option - Only show if plugin is loaded */}
                      {isThemeCreatorPluginLoaded && (
                        <>
                          <div
                            className="h-px my-1"
                            style={{ backgroundColor: 'var(--border-primary)' }}
                          />
                          <button
                            onClick={() => {
                              setIsThemeCreatorOpen(true);
                              setIsEditorOptionsOpen(false);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm transition-colors"
                            style={{
                              color: 'var(--text-primary)',
                              backgroundColor: 'transparent',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Palette className="w-4 h-4" />
                            <span>Open Themes</span>
                          </button>
                        </>
                      )}

                      {/* Zen Mode Option */}
                      <div
                        className="h-px my-1"
                        style={{ backgroundColor: 'var(--border-primary)' }}
                      />
                      <button
                        onClick={() => {
                          setIsZenMode(true);
                          setIsEditorOptionsOpen(false);
                          analytics.trackEvent('mode_switched', { mode: 'zen' });
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm transition-colors"
                        style={{
                          color: 'var(--text-primary)',
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Maximize2 className="w-4 h-4" />
                        <span>Zen Mode</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          {viewMode !== 'edit' && <div />}

          {/* View Mode Toggle (right side) */}
          <EditorModeToggle
            viewMode={viewMode}
            setViewMode={mode => {
              setViewMode(mode);
              analytics.trackEvent('mode_switched', { mode });
            }}
            theme={theme}
          />
        </div>

        {viewMode === 'edit' && (
          <div className="flex-grow flex flex-col h-full relative">
            {editorType === 'markdown' ? (
              <MarkdownEditor
                ref={editorRef}
                value={markdown}
                onChange={handleMarkdownChange}
                theme={theme}
              />
            ) : (
              <WysiwygEditor value={markdown} onChange={handleMarkdownChange} />
            )}

            {/* Selection Action Bar */}
            {selectedText && selectionRect && (
              <SelectionActionBar
                selectedText={selectedText}
                selectionRect={selectionRect}
                onCreateLink={() => {
                  // Wrap selected text in wikilink
                  const newMarkdown = markdown.replace(selectedText, `[[${selectedText}]]`);
                  handleMarkdownChange(newMarkdown);
                  setSelectedText('');
                  setSelectionRect(null);
                }}
                onAIAssist={() => {
                  // Trigger AI assist with selected text
                  console.log('AI assist requested for:', selectedText);
                  // Could dispatch an event or call a prop
                }}
                onAddTag={() => {
                  // Add tag with selected text
                  const tagName = selectedText.replace(/\s+/g, '-').toLowerCase();
                  const newMarkdown = markdown.replace(selectedText, `${selectedText} #${tagName}`);
                  handleMarkdownChange(newMarkdown);
                  setSelectedText('');
                  setSelectionRect(null);
                }}
                theme={theme as 'light' | 'dark'}
              />
            )}

            {/* Mobile Editor Toolbar */}
            <MobileEditorToolbar
              onInsertMarkdown={handleInsertMarkdown}
              theme={theme as 'light' | 'dark'}
            />
          </div>
        )}
        {viewMode === 'preview' && <MarkdownPreview markdown={processedMarkdown} theme={theme} />}
        {viewMode === 'split' && (
          <SplitView
            leftPanel={
              editorType === 'markdown' ? (
                <MarkdownEditor
                  ref={editorRef}
                  value={markdown}
                  onChange={handleMarkdownChange}
                  theme={theme}
                />
              ) : (
                <WysiwygEditor value={markdown} onChange={handleMarkdownChange} />
              )
            }
            rightPanel={<MarkdownPreview markdown={processedMarkdown} theme={theme} />}
            enableSyncScroll={true}
            theme={theme as 'light' | 'dark'}
            storageKey="editor-split-view-size"
          />
        )}

        {/* Theme Creator Modal */}
        <ThemeCreator
          isOpen={isThemeCreatorOpen}
          onClose={() => {
            setIsThemeCreatorOpen(false);
            const pluginInstance = getThemeCreatorPluginInstance();
            if (pluginInstance) {
              pluginInstance.closeThemeCreator();
            }
          }}
        />
      </div>
    </>
  );
};

export default MainContent;
