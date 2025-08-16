import EditorModeToggle from './EditorModeToggle';
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';
import React from 'react';
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
}) => (
  <div
    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-280px)] lg:h-[calc(100vh-200px)] flex flex-col"
    style={{
      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
    }}
  >
    {/* Editor Mode Toggle */}
    <div className="flex justify-end w-full px-0 pt-4 mb-4 pr-4">
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
      <MarkdownEditor value={markdown} onChange={handleMarkdownChange} theme={theme} />
    )}
    {viewMode === 'preview' && <MarkdownPreview markdown={processedMarkdown} theme={theme} />}
    {viewMode === 'split' && (
      <div className="flex flex-col lg:flex-row h-full">
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full">
          <MarkdownEditor value={markdown} onChange={handleMarkdownChange} theme={theme} />
        </div>
        <div className="h-1/2 lg:h-full w-full lg:w-1/2">
          <MarkdownPreview markdown={processedMarkdown} theme={theme} />
        </div>
      </div>
    )}
  </div>
);

export default MainContent;
