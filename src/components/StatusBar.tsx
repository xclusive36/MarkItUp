'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Clock,
  Network,
  Brain,
  Save,
  Users,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  BarChart3,
} from 'lucide-react';
import { usePluginManager } from './PluginSystemInitializer';

interface DetailedStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  paragraphs: number;
  sentences: number;
  readingTime: number;
  averageWordsPerSentence: number;
  averageWordsPerParagraph: number;
}

interface StatusBarProps {
  // Note content for detailed stats
  markdown?: string;

  // Note stats (will be calculated if markdown provided)
  wordCount?: number;
  characterCount?: number;
  readingTime?: number;

  // Connection status
  isCollaborationActive?: boolean;
  collaboratorCount?: number;
  isOnline?: boolean;

  // AI provider
  aiProvider?: string;
  aiStatus?: 'idle' | 'processing' | 'error';

  // Save status
  lastSaved?: Date | null;
  isSaving?: boolean;
  saveError?: string | null;

  // Graph stats
  linkCount?: number;
  backlinksCount?: number;

  // Current note info
  currentNoteName?: string;
  currentFolder?: string;

  // Current view for view-specific stats
  currentView?: 'editor' | 'graph' | 'search' | 'analytics' | 'plugins' | 'notes';

  // Theme
  theme?: 'light' | 'dark';

  // Callback for when stats are clicked
  onStatsClick?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  markdown,
  wordCount: propWordCount,
  readingTime: propReadingTime,
  isCollaborationActive = false,
  collaboratorCount = 0,
  isOnline = true,
  aiProvider,
  aiStatus = 'idle',
  lastSaved,
  isSaving = false,
  saveError = null,
  linkCount = 0,
  backlinksCount = 0,
  currentNoteName,
  currentFolder,
  theme = 'light',
  onStatsClick,
}) => {
  const pluginManager = usePluginManager();
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [isPluginLoaded, setIsPluginLoaded] = useState(false);

  // Check if the Enhanced Word Count plugin is loaded
  useEffect(() => {
    if (!pluginManager) {
      setIsPluginLoaded(false);
      return;
    }

    const loadedPlugins = pluginManager.getLoadedPlugins();
    const isLoaded = loadedPlugins.some(plugin => plugin.id === 'enhanced-word-count');
    setIsPluginLoaded(isLoaded);
  }, [pluginManager]);

  // Calculate detailed stats from markdown if plugin is loaded
  const detailedStats = useMemo<DetailedStats | null>(() => {
    if (!isPluginLoaded || !markdown || markdown.trim().length === 0) {
      return null;
    }

    const text = markdown
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]*`/g, '') // Remove inline code
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
      .replace(/#+ /g, '') // Remove headers
      .trim();

    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const paragraphs = markdown.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
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
  }, [markdown, isPluginLoaded]);

  // Use calculated stats if available, otherwise use props
  const wordCount = detailedStats?.words ?? propWordCount ?? 0;
  const readingTime = detailedStats?.readingTime ?? propReadingTime ?? 0;
  const formatLastSaved = (date: Date | null | undefined) => {
    if (!date) return 'Never saved';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getAIStatusColor = () => {
    switch (aiStatus) {
      case 'processing':
        return theme === 'dark' ? '#3b82f6' : '#2563eb';
      case 'error':
        return theme === 'dark' ? '#ef4444' : '#dc2626';
      default:
        return theme === 'dark' ? '#10b981' : '#059669';
    }
  };

  const getSaveStatusIcon = () => {
    if (isSaving) {
      return <Save className="w-3 h-3 animate-pulse" />;
    }
    if (saveError) {
      return <AlertCircle className="w-3 h-3" style={{ color: '#ef4444' }} />;
    }
    return <CheckCircle2 className="w-3 h-3" style={{ color: '#10b981' }} />;
  };

  // Hide the entire status bar if the plugin is not loaded
  if (!isPluginLoaded) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 border-t z-30 transition-all duration-200"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
        color: 'var(--text-secondary)',
        height: showDetailedStats && detailedStats ? 'auto' : '28px',
      }}
    >
      {/* Main status bar */}
      <div className="flex items-center justify-between px-4 text-xs h-7">
        {/* Left side - Note info */}
        <div className="flex items-center gap-4">
          {/* Current note */}
          {currentNoteName && (
            <div className="flex items-center gap-1.5" title="Current note">
              <FileText className="w-3 h-3" />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {currentNoteName}
              </span>
              {currentFolder && (
                <span className="text-gray-500 dark:text-gray-400">in {currentFolder}</span>
              )}
            </div>
          )}

          {/* Save status */}
          <div
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
            title={saveError || `Last saved: ${formatLastSaved(lastSaved)}`}
          >
            {getSaveStatusIcon()}
            <span>{isSaving ? 'Saving...' : saveError ? 'Error' : formatLastSaved(lastSaved)}</span>
          </div>
        </div>

        {/* Center - Stats */}
        <div className="hidden md:flex items-center gap-4">
          {/* Word count - clickable to show detailed stats */}
          <button
            onClick={onStatsClick}
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
            title="Click for detailed statistics"
          >
            <FileText className="w-3 h-3" />
            <span>{wordCount.toLocaleString()} words</span>
          </button>

          {/* Reading time */}
          <div className="flex items-center gap-1.5" title="Estimated reading time">
            <Clock className="w-3 h-3" />
            <span>{readingTime}m read</span>
          </div>

          {/* Links */}
          {linkCount > 0 && (
            <div
              className="flex items-center gap-1.5"
              title={`${linkCount} outgoing links, ${backlinksCount} backlinks`}
            >
              <Network className="w-3 h-3" />
              <span>{linkCount} links</span>
              {backlinksCount > 0 && (
                <span className="text-gray-500 dark:text-gray-400">· {backlinksCount} back</span>
              )}
            </div>
          )}

          {/* Detailed stats toggle - only show if plugin loaded */}
          {isPluginLoaded && detailedStats && (
            <button
              onClick={() => setShowDetailedStats(!showDetailedStats)}
              className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-opacity-10 transition-colors"
              style={{
                backgroundColor: showDetailedStats ? 'var(--accent-primary)' : 'transparent',
                color: showDetailedStats ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
              title={showDetailedStats ? 'Hide detailed stats' : 'Show detailed stats'}
            >
              <BarChart3 className="w-3 h-3" />
              {showDetailedStats ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronUp className="w-3 h-3" />
              )}
            </button>
          )}
        </div>

        {/* Right side - System status */}
        <div className="flex items-center gap-4">
          {/* Collaboration status */}
          {isCollaborationActive && (
            <div
              className="flex items-center gap-1.5"
              title={`${collaboratorCount} active collaborator${collaboratorCount !== 1 ? 's' : ''}`}
            >
              <Users className="w-3 h-3" style={{ color: '#10b981' }} />
              <span>{collaboratorCount}</span>
            </div>
          )}

          {/* AI provider */}
          {aiProvider && (
            <div
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
              title={`AI Provider: ${aiProvider} - ${aiStatus}`}
            >
              <Brain className="w-3 h-3" style={{ color: getAIStatusColor() }} />
              <span className="hidden sm:inline">{aiProvider}</span>
            </div>
          )}

          {/* Connection status */}
          <div className="flex items-center gap-1.5" title={isOnline ? 'Connected' : 'Offline'}>
            {isOnline ? (
              <Wifi className="w-3 h-3" style={{ color: '#10b981' }} />
            ) : (
              <WifiOff className="w-3 h-3" style={{ color: '#ef4444' }} />
            )}
          </div>
        </div>
      </div>

      {/* Detailed stats panel - only shown when expanded and plugin loaded */}
      {showDetailedStats && detailedStats && (
        <div
          className="px-4 py-2 border-t text-xs"
          style={{
            borderColor: 'var(--border-primary)',
            backgroundColor: 'var(--bg-tertiary)',
          }}
        >
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span style={{ color: 'var(--text-secondary)' }}>Characters:</span>
              <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
                {detailedStats.characters.toLocaleString()}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                ({detailedStats.charactersNoSpaces.toLocaleString()} no spaces)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span style={{ color: 'var(--text-secondary)' }}>Paragraphs:</span>
              <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
                {detailedStats.paragraphs}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span style={{ color: 'var(--text-secondary)' }}>Sentences:</span>
              <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
                {detailedStats.sentences}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span style={{ color: 'var(--text-secondary)' }}>Avg per sentence:</span>
              <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
                {detailedStats.averageWordsPerSentence}
              </span>
              <span className="text-gray-500 dark:text-gray-400">words</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span style={{ color: 'var(--text-secondary)' }}>Avg per paragraph:</span>
              <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
                {detailedStats.averageWordsPerParagraph}
              </span>
              <span className="text-gray-500 dark:text-gray-400">words</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusBar;
