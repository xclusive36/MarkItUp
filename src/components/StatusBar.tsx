'use client';

import React from 'react';
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
} from 'lucide-react';

interface StatusBarProps {
  // Note stats
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

  // Theme
  theme?: 'light' | 'dark';
}

export const StatusBar: React.FC<StatusBarProps> = ({
  wordCount = 0,
  readingTime = 0,
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
}) => {
  const formatLastSaved = (date: Date | null | undefined) => {
    if (!date) return 'Never';
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

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-7 flex items-center justify-between px-4 text-xs border-t z-30"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
        color: 'var(--text-secondary)',
      }}
    >
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
        {/* Word count */}
        <div className="flex items-center gap-1.5" title="Word count">
          <FileText className="w-3 h-3" />
          <span>{wordCount.toLocaleString()} words</span>
        </div>

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
  );
};

export default StatusBar;
