import EditorModeToggle from './EditorModeToggle';
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';
import WysiwygEditor from './WysiwygEditor';
import React, { useState } from 'react';
import { AnalyticsSystem } from '@/lib/analytics';

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

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full min-h-screen"
      style={{
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        minHeight: '100vh',
      }}
    >
      {/* Editor Mode Toggle and WYSIWYG Toggle */}
      <div className="flex justify-between items-center w-full px-4 pt-4 mb-4">
        {/* WYSIWYG Toggle (left side) */}
        {viewMode === 'edit' && (
          <button
            onClick={() => {
              const newType = editorType === 'markdown' ? 'wysiwyg' : 'markdown';
              setEditorType(newType);
              analytics.trackEvent('mode_switched', { mode: newType });
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
              borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
              color: theme === 'dark' ? '#f9fafb' : '#111827',
            }}
          >
            <span>{editorType === 'markdown' ? '📝' : '🎨'}</span>
            <span>{editorType === 'markdown' ? 'Markdown' : 'WYSIWYG'}</span>
          </button>
        )}
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
    </div>
  );
};

export default MainContent;
