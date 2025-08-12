'use client';

import React, { useEffect, useState } from 'react';

export function PluginDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPluginSystem = async () => {
      try {
        // Check if localStorage has any data
        const storedPlugins = localStorage.getItem('markitup-enabled-plugins');
        
        // Try to get plugin manager
        const { getPluginManager } = await import('@/lib/plugin-init');
        const pluginManager = getPluginManager();
        
        // Try to get available plugins
        const { AVAILABLE_PLUGINS } = await import('@/plugins/plugin-registry');
        
        setDebugInfo({
          localStorage: {
            hasStoredPlugins: !!storedPlugins,
            storedPlugins: storedPlugins ? JSON.parse(storedPlugins) : null,
            allLocalStorageKeys: Object.keys(localStorage),
          },
          pluginManager: {
            exists: !!pluginManager,
            loadedCount: pluginManager?.getLoadedPlugins()?.length || 0,
            enabledCount: pluginManager?.getLoadedPlugins()?.length || 0, // In this architecture, loaded plugins are enabled
          },
          registry: {
            availableCount: AVAILABLE_PLUGINS?.length || 0,
            firstFewPlugins: AVAILABLE_PLUGINS?.slice(0, 3)?.map(p => ({ id: p.id, name: p.name })) || [],
          },
          browser: {
            userAgent: navigator.userAgent,
            localStorage: typeof localStorage !== 'undefined',
            window: typeof window !== 'undefined',
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    checkPluginSystem();
  }, []);

  const testLoadPlugin = async () => {
    try {
      const { getPluginManager } = await import('@/lib/plugin-init');
      const { AVAILABLE_PLUGINS } = await import('@/plugins/plugin-registry');
      
      let pluginManager = getPluginManager();
      
      if (!pluginManager) {
        const { initializePluginSystem } = await import('@/lib/plugin-init');
        pluginManager = await initializePluginSystem();
      }
      
      if (AVAILABLE_PLUGINS.length > 0) {
        const firstPlugin = AVAILABLE_PLUGINS[0];
        console.log('Attempting to load plugin:', firstPlugin.id);
        
        const success = await pluginManager.loadPlugin(firstPlugin);
        console.log('Load result:', success);
        
        // Check localStorage after loading
        const stored = localStorage.getItem('markitup-enabled-plugins');
        console.log('localStorage after load:', stored);
        
        // Update debug info
        setDebugInfo((prev: any) => ({
          ...prev,
          lastTest: {
            pluginId: firstPlugin.id,
            success,
            storedAfterLoad: stored,
            loadedPlugins: pluginManager.getLoadedPlugins().map(p => p.id),
          }
        }));
      }
    } catch (err) {
      setError(`Test failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('markitup-enabled-plugins');
    setDebugInfo((prev: any) => ({ ...prev, storageCleared: true }));
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        🔍 Plugin System Debugger
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-700 p-4 rounded border">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Debug Information:</h3>
          <pre className="text-xs overflow-auto bg-gray-50 dark:bg-gray-600 p-2 rounded text-gray-800 dark:text-gray-200">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={testLoadPlugin}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            Test Load Plugin
          </button>
          <button
            onClick={clearStorage}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
          >
            Clear Storage
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
