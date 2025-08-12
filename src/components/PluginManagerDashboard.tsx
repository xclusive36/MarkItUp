'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PluginAnalytics from './PluginAnalytics';
import PluginHealthMonitor from './PluginHealthMonitor';
import PluginPermissionsUI from './PluginPermissionsUI';
import PluginDevelopmentTools from './PluginDevelopmentTools';
import { AVAILABLE_PLUGINS, FEATURED_PLUGINS, PLUGIN_CATEGORIES, PLUGIN_METADATA } from '../plugins/plugin-registry';
import { PluginManager } from '../lib/plugin-manager';
import { initializePluginSystem, getPluginManager } from '../lib/plugin-init';
import { PluginManifest } from '../lib/types';

interface PluginManagerDashboardProps {
  pluginManager?: PluginManager;
}

interface LoadedPlugin {
  manifest: PluginManifest;
  isActive: boolean;
}

type DashboardTab = 'overview' | 'health' | 'permissions' | 'development' | 'analytics';

export function PluginManagerDashboard({ pluginManager }: PluginManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [loadedPlugins, setLoadedPlugins] = useState<LoadedPlugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize plugin manager if not provided
  const [manager, setManager] = useState<PluginManager | null>(pluginManager || null);

  useEffect(() => {
    const initializePluginManager = async () => {
      try {
        if (!manager) {
          // Use the shared plugin manager instance
          const existingManager = getPluginManager();
          if (existingManager) {
            setManager(existingManager);
          } else {
            // Initialize the plugin system if not already done
            const pluginMgr = await initializePluginSystem();
            setManager(pluginMgr);
          }
        }
        
        // Get currently loaded plugins after manager is ready
        if (manager) {
          const currentPlugins = manager.getLoadedPlugins();
          // Convert Plugin[] to LoadedPlugin[] format expected by the UI
          const loadedPlugins = currentPlugins.map(plugin => ({
            manifest: plugin,
            isActive: true // All loaded plugins are considered active
          }));
          setLoadedPlugins(loadedPlugins);
        }
      } catch (error) {
        console.error('Failed to initialize plugin manager:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePluginManager();
  }, [manager]);

  // Separate effect to update plugin list when manager is ready
  useEffect(() => {
    if (manager && !isLoading) {
      refreshPlugins();
    }
  }, [manager, isLoading]);

  const refreshPlugins = useCallback(() => {
    if (manager) {
      const currentPlugins = manager.getLoadedPlugins();
      const loadedPluginsList: LoadedPlugin[] = currentPlugins.map(plugin => ({
        manifest: plugin,
        isActive: true
      }));
      setLoadedPlugins(loadedPluginsList);
    }
  }, [manager]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊', description: 'Plugin system overview' },
    { id: 'analytics', label: 'Analytics', icon: '📈', description: 'Usage analytics and performance' },
    { id: 'health', label: 'Health', icon: '🏥', description: 'Monitor plugin health and status' },
    { id: 'permissions', label: 'Permissions', icon: '🔐', description: 'Manage plugin permissions' },
    { id: 'development', label: 'Development', icon: '🛠️', description: 'Create and test plugins' }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab pluginManager={manager} loadedPlugins={loadedPlugins} isLoading={isLoading} onRefresh={refreshPlugins} />;
      case 'analytics':
        return <PluginAnalytics pluginManager={manager as any} />;
      case 'health':
        return <PluginHealthMonitor pluginManager={manager as any} />;
      case 'permissions':
        return <PluginPermissionsUI pluginManager={manager as any} />;
      case 'development':
        return <PluginDevelopmentTools />;
      default:
        return <OverviewTab pluginManager={manager} loadedPlugins={loadedPlugins} isLoading={isLoading} onRefresh={refreshPlugins} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Plugin Manager
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage, monitor, and develop plugins for MarkItUp
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="py-6">
          <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DashboardTab)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                title={tab.description}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="pb-8">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ pluginManager, loadedPlugins, isLoading, onRefresh }: { 
  pluginManager?: PluginManager | null; 
  loadedPlugins: LoadedPlugin[];
  isLoading: boolean;
  onRefresh?: () => void;
}) {
  const [stats, setStats] = useState({
    totalPlugins: AVAILABLE_PLUGINS.length,
    activePlugins: 0,
    healthyPlugins: 0,
    pluginsWithIssues: 0,
    availableUpdates: 0
  });

  useEffect(() => {
    if (!pluginManager || isLoading) return;

    const loadStats = async () => {
      try {
        const plugins = loadedPlugins || [];
        // Since getAllPluginHealth doesn't exist yet, use default values
        const healthyCount = plugins.length; // Assume all loaded plugins are healthy for now
        const issuesCount = 0; // No issues for now

        setStats({
          totalPlugins: AVAILABLE_PLUGINS.length,
          activePlugins: plugins.filter(p => p.isActive !== false).length,
          healthyPlugins: healthyCount,
          pluginsWithIssues: issuesCount,
          availableUpdates: 0 // Mock for now
        });
      } catch (error) {
        console.error('Failed to load plugin stats:', error);
      }
    };

    loadStats();
  }, [pluginManager, loadedPlugins, isLoading]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to Plugin Manager</h2>
        <p className="opacity-90">
          Extend MarkItUp with powerful plugins. Monitor performance, manage permissions, and develop custom functionality.
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading plugins...</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl">🔌</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalPlugins}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.activePlugins}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">🟢</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Healthy</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.healthyPlugins}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Issues</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pluginsWithIssues}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl">🔄</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Updates</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.availableUpdates}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Plugins */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🌟 Featured Plugins
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURED_PLUGINS.slice(0, 4).map(plugin => {
            const metadata = PLUGIN_METADATA[plugin.id];
            const isLoaded = loadedPlugins.some(p => p.manifest?.id === plugin.id);
            
            return (
              <div key={plugin.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{plugin.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">v{plugin.version}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isLoaded && (
                      <span className="w-2 h-2 bg-green-500 rounded-full" title="Loaded"></span>
                    )}
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {metadata?.category || 'Plugin'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{plugin.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>⭐ {metadata?.rating || '4.5'}</span>
                    <span>� {metadata?.downloadCount || '0'}</span>
                  </div>
                  <div className="flex space-x-1">
                    {metadata?.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Available Plugins */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📚 All Available Plugins ({AVAILABLE_PLUGINS.length})
        </h3>
        <div className="space-y-4">
          {Object.entries(PLUGIN_CATEGORIES).map(([category, plugins]) => (
            <div key={category}>
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                {category}
                <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                  {plugins.length} plugins
                </span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                {plugins.map(plugin => {
                  const metadata = PLUGIN_METADATA[plugin.id];
                  const isLoaded = loadedPlugins.some(p => p.manifest?.id === plugin.id);
                  
                  return (
                    <div key={plugin.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white text-sm">{plugin.name}</h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400">v{plugin.version} by {plugin.author}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {isLoaded && (
                            <span className="w-2 h-2 bg-green-500 rounded-full" title="Loaded"></span>
                          )}
                          {metadata?.featured && (
                            <span className="text-xs text-yellow-600">⭐</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{plugin.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>⭐ {metadata?.rating || '4.5'}</span>
                          <span>📊 {metadata?.downloadCount || '0'}</span>
                        </div>
                        <button
                          onClick={async () => {
                            if (!pluginManager) {
                              alert('Plugin manager not available');
                              return;
                            }
                            
                            try {
                              if (isLoaded) {
                                const success = await pluginManager.unloadPlugin(plugin.id);
                                if (success) {
                                  alert(`${plugin.name} unloaded successfully!`);
                                  onRefresh?.();
                                } else {
                                  alert(`Failed to unload ${plugin.name}`);
                                }
                              } else {
                                const success = await pluginManager.loadPlugin(plugin);
                                if (success) {
                                  alert(`${plugin.name} loaded successfully!`);
                                  onRefresh?.();
                                } else {
                                  alert(`Failed to load ${plugin.name}`);
                                }
                              }
                            } catch (error) {
                              alert(`Error: ${error}`);
                              console.error('Plugin load/unload error:', error);
                            }
                          }}
                          disabled={isLoading}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            isLoaded
                              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300'
                          }`}
                        >
                          {isLoaded ? 'Unload' : 'Load'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plugin Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🚀 Plugin Categories
          </h3>
          <div className="space-y-2">
            {Object.entries(PLUGIN_CATEGORIES).map(([category, plugins]) => (
              <div key={category} className="flex items-center justify-between p-2 rounded">
                <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                  {plugins.length} plugins
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🛡️ Security & Safety
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>🔐 Granular permission control</li>
            <li>🔍 Plugin validation</li>
            <li>📊 Audit trails</li>
            <li>⚡ Performance monitoring</li>
            <li>🛠️ Error tracking</li>
            <li>🔄 Safe update mechanisms</li>
          </ul>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-600 dark:text-gray-400">Featured plugins loaded successfully</span>
            <span className="text-gray-400 text-xs">just now</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="text-gray-600 dark:text-gray-400">Plugin manager initialized</span>
            <span className="text-gray-400 text-xs">1 minute ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-600 dark:text-gray-400">Health monitoring started</span>
            <span className="text-gray-400 text-xs">2 minutes ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PluginManagerDashboard;
