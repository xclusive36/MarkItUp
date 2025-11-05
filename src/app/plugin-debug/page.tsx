'use client';

import { useState, useEffect } from 'react';
import { initializePluginSystem, getPluginManager } from '../../lib/plugin-init';

export default function PluginDebugPage() {
  const [pluginManager, setPluginManager] = useState<any>(null);
  const [localStorage, setLocalStorage] = useState<string>('');
  const [loadedPlugins, setLoadedPlugins] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const manager = await initializePluginSystem();
      setPluginManager(manager);
      refreshState();
    };
    init();
  }, []);

  const refreshState = () => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('markitup-enabled-plugins');
      setLocalStorage(saved || 'null');

      const manager = getPluginManager();
      if (manager) {
        const plugins = manager.getLoadedPlugins();
        setLoadedPlugins(plugins);
      }
    }
  };

  const clearLocalStorage = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('markitup-enabled-plugins');
      refreshState();
    }
  };

  const clearAllPlugins = async () => {
    if (pluginManager) {
      // Unload all plugins
      const plugins = pluginManager.getLoadedPlugins();
      for (const plugin of plugins) {
        await pluginManager.unloadPlugin(plugin.id);
      }
      refreshState();
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Plugin Debug Console</h1>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">LocalStorage State</h2>
          <p className="text-sm text-gray-600 mb-2">markitup-enabled-plugins:</p>
          <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm overflow-x-auto">
            {localStorage}
          </pre>
          <button
            onClick={clearLocalStorage}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear LocalStorage
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Loaded Plugins ({loadedPlugins.length})</h2>
          {loadedPlugins.length === 0 ? (
            <p className="text-gray-500">No plugins loaded</p>
          ) : (
            <ul className="space-y-2">
              {loadedPlugins.map(plugin => (
                <li
                  key={plugin.id}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded"
                >
                  <span>
                    {plugin.name} ({plugin.id})
                  </span>
                  <span className="text-xs text-gray-500">v{plugin.version}</span>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={clearAllPlugins}
            className="mt-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Unload All Plugins
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Actions</h2>
          <div className="space-x-2">
            <button
              onClick={refreshState}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Refresh State
            </button>
            <a
              href="/plugin-manager"
              className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Go to Plugin Manager
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
