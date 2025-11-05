'use client';

import { useState, useEffect } from 'react';
import { PluginHealth, PluginUpdateInfo } from '../lib/types';

interface PluginAnalyticsProps {
  pluginManager?: {
    getAllPluginHealth?: () => Map<string, PluginHealth>;
    getLoadedPlugins?: () => any[];
    checkForUpdates?: () => Promise<PluginUpdateInfo[]>;
  };
}

interface PluginStats {
  id: string;
  name: string;
  health: PluginHealth;
  hasUpdates: boolean;
}

export function PluginAnalytics({ pluginManager }: PluginAnalyticsProps) {
  const [pluginStats, setPluginStats] = useState<PluginStats[]>([]);
  const [updates, setUpdates] = useState<PluginUpdateInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);

  useEffect(() => {
    if (!pluginManager) return;

    const loadAnalytics = async () => {
      try {
        // Check if methods exist before calling them
        const healthMap = pluginManager.getAllPluginHealth?.() || new Map();
        const plugins = pluginManager.getLoadedPlugins?.() || [];
        const availableUpdates = pluginManager.checkForUpdates
          ? await pluginManager.checkForUpdates()
          : [];

        setUpdates(availableUpdates);

        const stats: PluginStats[] = plugins.map(plugin => {
          const health = healthMap.get(plugin.id) || {
            status: 'healthy' as const,
            errorCount: 0,
            responseTime: 0,
            memoryUsage: 0,
            executionCount: 0,
          };

          return {
            id: plugin.id,
            name: plugin.name,
            health,
            hasUpdates: availableUpdates.some(
              update => update.currentVersion !== update.latestVersion
            ),
          };
        });

        setPluginStats(stats);
      } catch (error) {
        console.error('Failed to load plugin analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [pluginManager]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'disabled':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✗';
      case 'disabled':
        return '⏸';
      default:
        return '?';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedPluginData = selectedPlugin ? pluginStats.find(p => p.id === selectedPlugin) : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Plugin Analytics Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor plugin performance, health, and updates
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Plugins</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{pluginStats.length}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Healthy</h3>
          <p className="text-2xl font-bold text-green-600">
            {pluginStats.filter(p => p.health.status === 'healthy').length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Issues</h3>
          <p className="text-2xl font-bold text-red-600">
            {
              pluginStats.filter(p => p.health.status === 'error' || p.health.status === 'warning')
                .length
            }
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Updates Available
          </h3>
          <p className="text-2xl font-bold text-blue-600">{updates.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plugin List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Plugin Status</h3>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {pluginStats.map(plugin => (
                <div
                  key={plugin.id}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    selectedPlugin === plugin.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => setSelectedPlugin(plugin.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`text-lg ${getStatusColor(plugin.health.status)}`}>
                        {getStatusIcon(plugin.health.status)}
                      </span>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {plugin.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{plugin.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{plugin.health.executionCount || 0} executions</span>
                      <span>{plugin.health.responseTime?.toFixed(2) || 0}ms avg</span>
                      {plugin.hasUpdates && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Update
                        </span>
                      )}
                    </div>
                  </div>

                  {plugin.health.errorCount > 0 && (
                    <div className="mt-2 text-xs text-red-600">
                      {plugin.health.errorCount} error(s) - Last: {plugin.health.lastError}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plugin Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {selectedPluginData ? selectedPluginData.name : 'Select a Plugin'}
            </h3>
          </div>

          <div className="p-4">
            {selectedPluginData ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Health Status
                  </h4>
                  <div
                    className={`flex items-center space-x-2 ${getStatusColor(selectedPluginData.health.status)}`}
                  >
                    <span className="text-lg">
                      {getStatusIcon(selectedPluginData.health.status)}
                    </span>
                    <span className="capitalize">{selectedPluginData.health.status}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Performance
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Executions:</span>
                      <span>{selectedPluginData.health.executionCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Response:</span>
                      <span>{selectedPluginData.health.responseTime?.toFixed(2) || 0}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Errors:</span>
                      <span
                        className={selectedPluginData.health.errorCount > 0 ? 'text-red-600' : ''}
                      >
                        {selectedPluginData.health.errorCount}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedPluginData.health.lastExecuted && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Last Activity
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(selectedPluginData.health.lastExecuted).toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedPluginData.health.lastError && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Last Error
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      {selectedPluginData.health.lastError}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Click on a plugin to view detailed analytics
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Updates Section */}
      {updates.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Available Updates</h3>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {updates.map((update, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Plugin Update Available
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {update.currentVersion} → {update.latestVersion}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {update.changelogUrl && (
                    <a
                      href={update.changelogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      Changelog
                    </a>
                  )}
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PluginAnalytics;
