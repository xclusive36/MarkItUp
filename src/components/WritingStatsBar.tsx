'use client';

import React, { useEffect, useState } from 'react';
import { usePluginManager } from './PluginSystemInitializer';

interface WritingStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  paragraphs: number;
  sentences: number;
  readingTime: number;
  averageWordsPerSentence: number;
  averageWordsPerParagraph: number;
}

interface WritingStatsBarProps {
  markdown: string;
  theme: string;
}

const WritingStatsBar: React.FC<WritingStatsBarProps> = ({ markdown, theme }) => {
  const pluginManager = usePluginManager();
  const [stats, setStats] = useState<WritingStats | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPluginLoaded, setIsPluginLoaded] = useState(false);

  // Check if the Detailed Writing Statistics plugin is loaded
  useEffect(() => {
    if (!pluginManager) {
      setIsPluginLoaded(false);
      return;
    }

    const loadedPlugins = pluginManager.getLoadedPlugins();
    const isLoaded = loadedPlugins.some(plugin => plugin.id === 'enhanced-word-count');
    setIsPluginLoaded(isLoaded);
  }, [pluginManager]);

  useEffect(() => {
    const calculateStats = (content: string): WritingStats => {
      const text = content
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`[^`]*`/g, '') // Remove inline code
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
        .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
        .replace(/#+ /g, '') // Remove headers
        .trim();

      const words = text.split(/\s+/).filter(word => word.length > 0).length;
      const characters = text.length;
      const charactersNoSpaces = text.replace(/\s/g, '').length;
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      const readingTime = Math.max(1, Math.ceil(words / 200)); // 200 WPM

      return {
        words,
        characters,
        charactersNoSpaces,
        paragraphs,
        sentences,
        readingTime,
        averageWordsPerSentence: sentences > 0 ? Math.round(words / sentences) : 0,
        averageWordsPerParagraph: paragraphs > 0 ? Math.round(words / paragraphs) : 0,
      };
    };

    if (markdown && markdown.trim().length > 0) {
      setStats(calculateStats(markdown));
    } else {
      setStats(null);
    }
  }, [markdown]);

  // Don't show the bar if the plugin is not loaded
  if (!isPluginLoaded) {
    return null;
  }

  if (!stats) {
    return null;
  }

  return (
    <div
      className="border-b transition-all duration-200"
      style={{
        backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
      }}
    >
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-wrap text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">📊</span>
              <span
                className="font-medium"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                Writing Statistics
              </span>
            </div>

            {!isCollapsed && (
              <>
                <div
                  className="flex items-center gap-1"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  <span
                    className="font-semibold"
                    style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}
                  >
                    {stats.words.toLocaleString()}
                  </span>
                  <span>words</span>
                </div>

                <div
                  className="flex items-center gap-1"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  <span
                    className="font-semibold"
                    style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}
                  >
                    {stats.characters.toLocaleString()}
                  </span>
                  <span>characters</span>
                </div>

                <div
                  className="flex items-center gap-1"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  <span
                    className="font-semibold"
                    style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}
                  >
                    {stats.paragraphs}
                  </span>
                  <span>paragraphs</span>
                </div>

                <div
                  className="flex items-center gap-1"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  <span
                    className="font-semibold"
                    style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}
                  >
                    {stats.sentences}
                  </span>
                  <span>sentences</span>
                </div>

                <div
                  className="flex items-center gap-1"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  <span>⏱️</span>
                  <span
                    className="font-semibold"
                    style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}
                  >
                    {stats.readingTime}
                  </span>
                  <span>min read</span>
                </div>

                <div
                  className="flex items-center gap-1"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  <span>~{stats.averageWordsPerSentence} words/sentence</span>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xs px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            title={isCollapsed ? 'Expand statistics' : 'Collapse statistics'}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WritingStatsBar;
