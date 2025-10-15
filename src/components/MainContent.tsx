import EditorModeToggle from './EditorModeToggle';
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';
import WysiwygEditor from './WysiwygEditor';
import WritingStatsBar from './WritingStatsBar';
import { ThemeCreator } from './ThemeCreator';
import React, { useState, useEffect } from 'react';
import { AnalyticsSystem } from '@/lib/analytics';
import { getThemeCreatorPluginInstance } from '@/plugins/theme-creator';
import { getPluginManager } from '@/lib/plugin-init';

interface MainContentProps {
  markdown: string;
  viewMode: 'edit' | 'preview' | 'split';
  setViewMode: (v: 'edit' | 'preview' | 'split') => void;
  handleMarkdownChange: (v: string) => void;
  processedMarkdown: string;
  theme: string;
  analytics: AnalyticsSystem;
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
}) => {
  const [editorType, setEditorType] = useState<'markdown' | 'wysiwyg'>('markdown');
  const [isThemeCreatorOpen, setIsThemeCreatorOpen] = useState(false);
  const [isThemeCreatorPluginLoaded, setIsThemeCreatorPluginLoaded] = useState(false);

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

  // Register the theme creator open callback with the plugin
  useEffect(() => {
    const pluginInstance = getThemeCreatorPluginInstance();
    if (pluginInstance) {
      pluginInstance.registerOpenCreatorCallback(() => {
        setIsThemeCreatorOpen(true);
      });
    }
  }, []);

  return (
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
          {/* WYSIWYG Toggle */}
          {viewMode === 'edit' && (
            <button
              onClick={() => {
                const newType = editorType === 'markdown' ? 'wysiwyg' : 'markdown';
                setEditorType(newType);
                analytics.trackEvent('mode_switched', { mode: newType });
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-secondary)',
                color: 'var(--text-primary)',
              }}
            >
              <span>{editorType === 'markdown' ? '📝' : '🎨'}</span>
              <span>{editorType === 'markdown' ? 'Markdown' : 'WYSIWYG'}</span>
            </button>
          )}

          {/* Theme Creator Button - Only show if plugin is loaded */}
          {isThemeCreatorPluginLoaded && (
            <button
              onClick={() => setIsThemeCreatorOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors hover:opacity-80"
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

      {/* Writing Statistics Bar - shown in all modes */}
      <WritingStatsBar markdown={markdown} theme={theme} />

      {viewMode === 'edit' && (
        <div className="flex-grow flex flex-col h-full">
          {editorType === 'markdown' ? (
            <MarkdownEditor value={markdown} onChange={handleMarkdownChange} theme={theme} />
          ) : (
            <WysiwygEditor value={markdown} onChange={handleMarkdownChange} theme={theme} />
          )}
        </div>
      )}
      {viewMode === 'preview' && <MarkdownPreview markdown={processedMarkdown} theme={theme} />}
      {viewMode === 'split' && (
        <div className="flex flex-col lg:flex-row h-full flex-grow min-h-0">
          <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col min-h-0">
            {editorType === 'markdown' ? (
              <MarkdownEditor value={markdown} onChange={handleMarkdownChange} theme={theme} />
            ) : (
              <WysiwygEditor value={markdown} onChange={handleMarkdownChange} theme={theme} />
            )}
          </div>
          <div className="h-1/2 lg:h-full w-full lg:w-1/2 flex flex-col min-h-0">
            <MarkdownPreview markdown={processedMarkdown} theme={theme} />
          </div>
        </div>
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
  );
};

export default MainContent;
