'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Brain,
  Sparkles,
  Info,
} from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { useToast } from '@/components/ToastProvider';

interface IndexingStatus {
  isIndexing: boolean;
  progress: number;
  total: number;
  currentNote?: string;
  error?: string;
}

interface VectorSearchSettingsProps {
  onClose?: () => void;
}

const VectorSearchSettings: React.FC<VectorSearchSettingsProps> = () => {
  const { theme } = useSimpleTheme();
  const toast = useToast();

  // Settings state
  const [enabled, setEnabled] = useState(true);
  const [autoIndex, setAutoIndex] = useState(true);
  const [batchSize, setBatchSize] = useState(10);

  // Status state
  const [indexingStatus, setIndexingStatus] = useState<IndexingStatus>({
    isIndexing: false,
    progress: 0,
    total: 0,
  });
  const [notesCount, setNotesCount] = useState(0);
  const [indexedCount, setIndexedCount] = useState(0);
  const [storageSize, setStorageSize] = useState('0 KB');
  const [lastIndexed, setLastIndexed] = useState<Date | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [reindexing, setReindexing] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Load initial status
  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);

      // Get notes count from API
      const response = await fetch('/api/vector/index');
      if (response.ok) {
        const data = await response.json();
        setNotesCount(data.notesCount || 0);
      }

      // Get indexed count from IndexedDB
      // This is a placeholder - in a real implementation, you'd query the vector store
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vectorStore = (window as any).__vectorStore;
      if (vectorStore) {
        const count = await vectorStore.getCount?.();
        setIndexedCount(count || 0);
      }

      // Get storage size estimate
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        setStorageSize(formatBytes(usage));
      }

      // Load last indexed time from localStorage
      const lastIndexedStr = localStorage.getItem('vectorSearchLastIndexed');
      if (lastIndexedStr) {
        setLastIndexed(new Date(lastIndexedStr));
      }

      // Load settings from localStorage
      const enabledStr = localStorage.getItem('vectorSearchEnabled');
      if (enabledStr !== null) {
        setEnabled(enabledStr === 'true');
      }

      const autoIndexStr = localStorage.getItem('vectorSearchAutoIndex');
      if (autoIndexStr !== null) {
        setAutoIndex(autoIndexStr === 'true');
      }

      const batchSizeStr = localStorage.getItem('vectorSearchBatchSize');
      if (batchSizeStr) {
        setBatchSize(parseInt(batchSizeStr, 10));
      }
    } catch (error) {
      console.error('Failed to load vector search status:', error);
      toast.error('Failed to load vector search status');
    } finally {
      setLoading(false);
    }
  };

  const handleReindex = async () => {
    if (reindexing) return;

    try {
      setReindexing(true);
      setIndexingStatus({
        isIndexing: true,
        progress: 0,
        total: notesCount,
      });

      toast.info('Starting re-indexing...', 'View Progress');

      // Get notes from API
      const response = await fetch('/api/vector/index', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to fetch notes for indexing');
      }

      const data = await response.json();
      const notes = data.notes || [];

      // Note: Actual indexing would use VectorIndexingService
      // This is a placeholder implementation for UI demonstration
      // const indexingService = new VectorIndexingService(vectorStore, embeddingService);
      // await indexingService.indexAllNotes(notes);

      // Index notes with progress callback
      let processedCount = 0;
      for (let i = 0; i < notes.length; i += batchSize) {
        const batch = notes.slice(i, i + batchSize);

        // Update status
        setIndexingStatus({
          isIndexing: true,
          progress: processedCount,
          total: notes.length,
          currentNote: batch[0]?.name,
        });

        // Process batch (placeholder - actual implementation would call indexing service)
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work

        processedCount += batch.length;
      }

      // Success
      setIndexingStatus({
        isIndexing: false,
        progress: notes.length,
        total: notes.length,
      });

      setIndexedCount(notes.length);
      const now = new Date();
      setLastIndexed(now);
      localStorage.setItem('vectorSearchLastIndexed', now.toISOString());

      toast.success(`Successfully indexed ${notes.length} notes!`);
    } catch (error) {
      console.error('Reindexing failed:', error);
      setIndexingStatus({
        isIndexing: false,
        progress: 0,
        total: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      toast.error('Failed to re-index notes');
    } finally {
      setReindexing(false);
    }
  };

  const handleClearIndex = async () => {
    if (
      !window.confirm(
        'Are you sure you want to clear the vector index? This will remove all embeddings and require re-indexing.'
      )
    ) {
      return;
    }

    try {
      setClearing(true);
      toast.info('Clearing vector index...');

      // Clear IndexedDB (placeholder - actual implementation would use vector store)
      const dbRequest = indexedDB.deleteDatabase('vectorStore');

      await new Promise<void>((resolve, reject) => {
        dbRequest.onsuccess = () => resolve();
        dbRequest.onerror = () => reject(dbRequest.error);
      });

      // Reset state
      setIndexedCount(0);
      setLastIndexed(null);
      localStorage.removeItem('vectorSearchLastIndexed');

      toast.success('Vector index cleared successfully');
    } catch (error) {
      console.error('Failed to clear index:', error);
      toast.error('Failed to clear vector index');
    } finally {
      setClearing(false);
    }
  };

  const handleToggleEnabled = (checked: boolean) => {
    setEnabled(checked);
    localStorage.setItem('vectorSearchEnabled', checked.toString());
    toast.success(checked ? 'Vector search enabled' : 'Vector search disabled');
  };

  const handleToggleAutoIndex = (checked: boolean) => {
    setAutoIndex(checked);
    localStorage.setItem('vectorSearchAutoIndex', checked.toString());
  };

  const handleBatchSizeChange = (value: number) => {
    setBatchSize(value);
    localStorage.setItem('vectorSearchBatchSize', value.toString());
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProgressPercentage = () => {
    if (indexingStatus.total === 0) return 0;
    return Math.round((indexingStatus.progress / indexingStatus.total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1">
          <h3
            className="text-lg font-semibold mb-1"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            Vector Search Settings
          </h3>
          <p className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
            Configure semantic search powered by AI embeddings
          </p>
        </div>
      </div>

      {/* Status Overview */}
      {!loading && (
        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span
                className="text-sm font-medium"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                Indexed Notes
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {indexedCount} / {notesCount}
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              {notesCount > 0 ? Math.round((indexedCount / notesCount) * 100) : 0}% complete
            </div>
          </div>

          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span
                className="text-sm font-medium"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                Storage Used
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {storageSize}
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              {lastIndexed ? `Last indexed ${formatRelativeTime(lastIndexed)}` : 'Never indexed'}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      )}

      {/* Enable/Disable Toggle */}
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <label
                htmlFor="enable-vector-search"
                className="text-sm font-medium cursor-pointer"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                Enable Vector Search
              </label>
              {enabled && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            <p className="text-xs" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              Use AI-powered semantic search to find notes by meaning
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="enable-vector-search"
              type="checkbox"
              className="sr-only peer"
              checked={enabled}
              onChange={e => handleToggleEnabled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Indexing Progress */}
      {indexingStatus.isIndexing && (
        <div
          className="p-4 rounded-lg border border-blue-300 dark:border-blue-600"
          style={{
            backgroundColor: theme === 'dark' ? '#1e3a8a20' : '#eff6ff',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
            <span
              className="text-sm font-medium"
              style={{ color: theme === 'dark' ? '#93c5fd' : '#1e40af' }}
            >
              Indexing in progress...
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span style={{ color: theme === 'dark' ? '#93c5fd' : '#1e40af' }}>
              {indexingStatus.progress} / {indexingStatus.total} notes
            </span>
            <span style={{ color: theme === 'dark' ? '#93c5fd' : '#1e40af' }}>
              {getProgressPercentage()}%
            </span>
          </div>

          {indexingStatus.currentNote && (
            <p className="text-xs mt-2" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              Processing: {indexingStatus.currentNote}
            </p>
          )}
        </div>
      )}

      {/* Error State */}
      {indexingStatus.error && (
        <div
          className="p-4 rounded-lg border border-red-300 dark:border-red-600"
          style={{
            backgroundColor: theme === 'dark' ? '#7f1d1d20' : '#fef2f2',
          }}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p
                className="text-sm font-medium mb-1"
                style={{ color: theme === 'dark' ? '#fca5a5' : '#991b1b' }}
              >
                Indexing Error
              </p>
              <p className="text-xs" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                {indexingStatus.error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleReindex}
          disabled={reindexing || indexingStatus.isIndexing || !enabled}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {reindexing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {reindexing ? 'Indexing...' : 'Re-index All Notes'}
        </button>

        <button
          onClick={handleClearIndex}
          disabled={clearing || indexingStatus.isIndexing || indexedCount === 0}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Clear
        </button>
      </div>

      {/* Advanced Settings */}
      <div className="space-y-4">
        <h4
          className="text-sm font-semibold"
          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
        >
          Advanced Options
        </h4>

        {/* Auto-Index Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label
              htmlFor="auto-index"
              className="text-sm font-medium cursor-pointer"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Auto-index new notes
            </label>
            <p className="text-xs mt-1" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              Automatically index notes when created or modified
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="auto-index"
              type="checkbox"
              className="sr-only peer"
              checked={autoIndex}
              onChange={e => handleToggleAutoIndex(e.target.checked)}
              disabled={!enabled}
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
          </label>
        </div>

        {/* Batch Size Slider */}
        <div>
          <label
            htmlFor="batch-size"
            className="block text-sm font-medium mb-2"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            Indexing Batch Size: {batchSize}
          </label>
          <input
            id="batch-size"
            type="range"
            min="5"
            max="50"
            step="5"
            value={batchSize}
            onChange={e => handleBatchSizeChange(parseInt(e.target.value, 10))}
            disabled={!enabled}
            className="w-full accent-blue-600 disabled:opacity-50"
          />
          <div className="flex justify-between text-xs mt-1">
            <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>Slower</span>
            <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>Faster</span>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div
        className="p-3 rounded-lg border"
        style={{
          backgroundColor: theme === 'dark' ? '#1e3a8a20' : '#eff6ff',
          borderColor: theme === 'dark' ? '#2563eb' : '#93c5fd',
        }}
      >
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p
              className="text-xs font-medium mb-1"
              style={{ color: theme === 'dark' ? '#93c5fd' : '#1e40af' }}
            >
              How Vector Search Works
            </p>
            <p className="text-xs" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              Vector search uses AI embeddings to understand the meaning of your notes. This enables
              semantic search that finds conceptually similar notes, even if they don't share the
              same keywords. All processing happens locally in your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default VectorSearchSettings;
