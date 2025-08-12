'use client';

import React, { useEffect, useState } from 'react';

interface RealPluginDemo {
  loadedPlugins: any[];
  availablePlugins: any[];
  pluginManager: any;
  isLoading: boolean;
  error: string | null;
}

export function RealPluginDemo() {
  const [state, setState] = useState<RealPluginDemo>({
    loadedPlugins: [],
    availablePlugins: [],
    pluginManager: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const initializePlugins = async () => {
      try {
        // Import the plugin system
        const { initializePluginSystem, getPluginManager } = await import('@/lib/plugin-init');
        const { AVAILABLE_PLUGINS } = await import('@/plugins/plugin-registry');
        
        // Get or initialize plugin manager
        let pluginManager = getPluginManager();
        if (!pluginManager) {
          pluginManager = await initializePluginSystem();
        }

        // Restore plugins from localStorage
        if (typeof window !== 'undefined') {
          const storedEnabled = localStorage.getItem('markitup-enabled-plugins');
          if (storedEnabled) {
            try {
              const enabledPluginIds = JSON.parse(storedEnabled);
              console.log('Restoring plugins from localStorage:', enabledPluginIds);
              
              // Load each enabled plugin
              for (const pluginId of enabledPluginIds) {
                const plugin = AVAILABLE_PLUGINS.find(p => p.id === pluginId);
                if (plugin && !pluginManager.getLoadedPlugins().some(loaded => loaded.id === pluginId)) {
                  console.log('Auto-loading plugin:', pluginId);
                  await pluginManager.loadPlugin(plugin);
                }
              }
            } catch (error) {
              console.error('Failed to restore plugins:', error);
            }
          }
        }

        // Get current state
        const loadedPlugins = pluginManager.getLoadedPlugins();
        
        setState({
          loadedPlugins,
          availablePlugins: AVAILABLE_PLUGINS,
          pluginManager,
          isLoading: false,
          error: null
        });

      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : String(error)
        }));
      }
    };

    initializePlugins();
  }, []);

  const loadPlugin = async (pluginId: string) => {
    if (!state.pluginManager) return;
    
    try {
      // Find the plugin manifest
      const plugin = state.availablePlugins.find(p => p.id === pluginId);
      if (!plugin) {
        console.error('Plugin not found:', pluginId);
        return;
      }

      // Load the plugin
      console.log('Loading plugin:', pluginId);
      const success = await state.pluginManager.loadPlugin(plugin);
      console.log('Load result:', success);

      // Manually persist to localStorage (backup method)
      if (typeof window !== 'undefined') {
        const currentEnabled = JSON.parse(localStorage.getItem('markitup-enabled-plugins') || '[]');
        if (!currentEnabled.includes(pluginId)) {
          currentEnabled.push(pluginId);
          localStorage.setItem('markitup-enabled-plugins', JSON.stringify(currentEnabled));
          console.log('Manually persisted to localStorage:', currentEnabled);
        }
      }

      // Update state
      const newLoadedPlugins = state.pluginManager.getLoadedPlugins();
      setState(prev => ({ ...prev, loadedPlugins: newLoadedPlugins }));

    } catch (error) {
      console.error('Failed to load plugin:', error);
      setState(prev => ({ ...prev, error: `Failed to load ${pluginId}: ${error}` }));
    }
  };

  const unloadPlugin = async (pluginId: string) => {
    if (!state.pluginManager) return;
    
    try {
      console.log('Unloading plugin:', pluginId);
      const success = await state.pluginManager.unloadPlugin(pluginId);
      console.log('Unload result:', success);

      // Manually remove from localStorage (backup method)
      if (typeof window !== 'undefined') {
        const currentEnabled = JSON.parse(localStorage.getItem('markitup-enabled-plugins') || '[]');
        const updated = currentEnabled.filter((id: string) => id !== pluginId);
        localStorage.setItem('markitup-enabled-plugins', JSON.stringify(updated));
        console.log('Manually updated localStorage:', updated);
      }

      // Update state
      const newLoadedPlugins = state.pluginManager.getLoadedPlugins();
      setState(prev => ({ ...prev, loadedPlugins: newLoadedPlugins }));

    } catch (error) {
      console.error('Failed to unload plugin:', error);
      setState(prev => ({ ...prev, error: `Failed to unload ${pluginId}: ${error}` }));
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const clearStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('markitup-enabled-plugins');
    }
    setState(prev => ({ ...prev, loadedPlugins: [] }));
  };

  if (state.isLoading) {
    return (
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <p className="text-blue-700 dark:text-blue-300">🔄 Initializing real plugin system...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">❌ Plugin System Error</h3>
        <p className="text-red-700 dark:text-red-300 text-sm">{state.error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
          ✅ Real Plugin System Test
        </h3>
        <p className="text-green-700 dark:text-green-300 text-sm">
          This tests the actual MarkItUp plugin system with {state.availablePlugins.length} real plugins available.
          Load plugins and refresh to test persistence!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currently Loaded Plugins */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Currently Loaded ({state.loadedPlugins.length})
          </h3>
          {state.loadedPlugins.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No plugins loaded yet. Load some real plugins to test persistence!
            </p>
          ) : (
            <div className="space-y-2">
              {state.loadedPlugins.map((plugin) => (
                <div
                  key={plugin.id}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded"
                >
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">
                      {plugin.name}
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      {plugin.description}
                    </p>
                  </div>
                  <button
                    onClick={() => unloadPlugin(plugin.id)}
                    className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded border border-red-300 dark:border-red-600 transition-colors"
                  >
                    Unload
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Plugins */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Available Plugins ({state.availablePlugins.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {state.availablePlugins
              .filter((plugin) => !state.loadedPlugins.some(loaded => loaded.id === plugin.id))
              .slice(0, 8) // Show first 8 for testing
              .map((plugin) => (
                <div
                  key={plugin.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                >
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      {plugin.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {plugin.description}
                    </p>
                  </div>
                  <button
                    onClick={() => loadPlugin(plugin.id)}
                    className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded border border-blue-300 dark:border-blue-600 transition-colors"
                  >
                    Load
                  </button>
                </div>
              ))}
          </div>
          {state.availablePlugins.length > 8 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ... and {state.availablePlugins.length - 8} more plugins available
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={refreshPage}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          🔄 Refresh & Test Persistence
        </button>
        <button
          onClick={clearStorage}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🗑️ Clear Plugin Storage
        </button>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded">
        <strong>Plugin localStorage:</strong>
        <br />
        {typeof window !== 'undefined' ? (localStorage.getItem('markitup-enabled-plugins') || '(empty)') : '(SSR)'}
      </div>
    </div>
  );
}
