'use client';

import { useEffect, useState } from 'react';

interface PluginState {
  simplePlugins: string[];
  realPlugins: any[];
  availablePlugins: any[];
  pluginManager: any;
  error: string | null;
  loading: boolean;
}

export default function WorkingPluginTest() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<PluginState>({
    simplePlugins: [],
    realPlugins: [],
    availablePlugins: [],
    pluginManager: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    setMounted(true);
    initializeEverything();
  }, []);

  const initializeEverything = async () => {
    try {
      // 1. Load simple plugins from localStorage
      const storedSimple = localStorage.getItem('ultra-simple-test');
      const simplePlugins = storedSimple ? JSON.parse(storedSimple) : [];

      // 2. Initialize real plugin system
      console.log('🔄 Initializing plugin system...');
      const { initializePluginSystem, getPluginManager } = await import('@/lib/plugin-init');
      const { AVAILABLE_PLUGINS } = await import('@/plugins/plugin-registry');
      
      let pluginManager = getPluginManager();
      if (!pluginManager) {
        console.log('🆕 Creating new plugin manager...');
        pluginManager = await initializePluginSystem();
      }

      console.log('📦 Available plugins:', AVAILABLE_PLUGINS.length);

      // 3. Load enabled real plugins from localStorage
      const storedReal = localStorage.getItem('working-real-plugins');
      const enabledPluginIds = storedReal ? JSON.parse(storedReal) : [];
      
      console.log('💾 Stored plugin IDs:', enabledPluginIds);

      // 4. Load each enabled plugin
      for (const pluginId of enabledPluginIds) {
        const plugin = AVAILABLE_PLUGINS.find(p => p.id === pluginId);
        if (plugin) {
          try {
            console.log('⚡ Loading plugin:', pluginId);
            await pluginManager.loadPlugin(plugin);
          } catch (error) {
            console.error('❌ Failed to load plugin:', pluginId, error);
          }
        } else {
          console.warn('⚠️ Plugin not found in registry:', pluginId);
        }
      }

      const currentlyLoaded = pluginManager.getLoadedPlugins();
      console.log('✅ Currently loaded plugins:', currentlyLoaded.length);

      setState({
        simplePlugins,
        realPlugins: currentlyLoaded,
        availablePlugins: AVAILABLE_PLUGINS,
        pluginManager,
        error: null,
        loading: false
      });

    } catch (error) {
      console.error('💥 Initialization error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : String(error),
        loading: false
      }));
    }
  };

  // Simple plugin functions
  const addSimplePlugin = (id: string) => {
    const newPlugins = [...state.simplePlugins, id];
    setState(prev => ({ ...prev, simplePlugins: newPlugins }));
    localStorage.setItem('ultra-simple-test', JSON.stringify(newPlugins));
  };

  const removeSimplePlugin = (id: string) => {
    const newPlugins = state.simplePlugins.filter(p => p !== id);
    setState(prev => ({ ...prev, simplePlugins: newPlugins }));
    localStorage.setItem('ultra-simple-test', JSON.stringify(newPlugins));
  };

  // Real plugin functions
  const loadRealPlugin = async (pluginId: string) => {
    if (!state.pluginManager) return;
    
    try {
      const plugin = state.availablePlugins.find(p => p.id === pluginId);
      if (!plugin) {
        console.error('Plugin not found:', pluginId);
        return;
      }

      console.log('🔄 Loading real plugin:', pluginId);
      await state.pluginManager.loadPlugin(plugin);
      
      // Update localStorage with loaded plugins
      const currentEnabled = JSON.parse(localStorage.getItem('working-real-plugins') || '[]');
      if (!currentEnabled.includes(pluginId)) {
        currentEnabled.push(pluginId);
        localStorage.setItem('working-real-plugins', JSON.stringify(currentEnabled));
        console.log('💾 Saved to localStorage:', currentEnabled);
      }

      // Update state
      const newRealPlugins = state.pluginManager.getLoadedPlugins();
      setState(prev => ({ ...prev, realPlugins: newRealPlugins }));

    } catch (error) {
      console.error('❌ Failed to load real plugin:', error);
    }
  };

  const unloadRealPlugin = async (pluginId: string) => {
    if (!state.pluginManager) return;
    
    try {
      console.log('🗑️ Unloading real plugin:', pluginId);
      await state.pluginManager.unloadPlugin(pluginId);
      
      // Update localStorage
      const currentEnabled = JSON.parse(localStorage.getItem('working-real-plugins') || '[]');
      const updated = currentEnabled.filter((id: string) => id !== pluginId);
      localStorage.setItem('working-real-plugins', JSON.stringify(updated));
      console.log('💾 Updated localStorage:', updated);

      // Update state
      const newRealPlugins = state.pluginManager.getLoadedPlugins();
      setState(prev => ({ ...prev, realPlugins: newRealPlugins }));

    } catch (error) {
      console.error('❌ Failed to unload real plugin:', error);
    }
  };

  const clearAllData = () => {
    localStorage.removeItem('ultra-simple-test');
    localStorage.removeItem('working-real-plugins');
    setState(prev => ({ 
      ...prev, 
      simplePlugins: [],
      realPlugins: []
    }));
  };

  if (!mounted) {
    return <div className="p-4">🔄 Mounting...</div>;
  }

  if (state.loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h1 className="text-xl font-bold text-blue-800 mb-2">
            🔄 Loading Plugin System...
          </h1>
          <p className="text-blue-700 text-sm">
            Initializing plugin manager and restoring saved plugins...
          </p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h1 className="text-xl font-bold text-red-800 mb-2">
            ❌ Plugin System Error
          </h1>
          <p className="text-red-700 text-sm">{state.error}</p>
          <button
            onClick={initializeEverything}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h1 className="text-2xl font-bold text-green-800 mb-2">
          ✅ Working Plugin Persistence System
        </h1>
        <p className="text-green-700 text-sm">
          Both simple and real plugin persistence are now working! Load plugins and refresh to test.
        </p>
      </div>

      {/* Simple Plugins (Known Working) */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          🧪 Simple Plugins ({state.simplePlugins.length} loaded)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Loaded:</h4>
            {state.simplePlugins.length === 0 ? (
              <p className="text-gray-500 text-sm">None</p>
            ) : (
              <div className="space-y-1">
                {state.simplePlugins.map(id => (
                  <div key={id} className="flex justify-between items-center p-2 bg-green-100 rounded">
                    <span className="text-green-800">{id}</span>
                    <button
                      onClick={() => removeSimplePlugin(id)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Available:</h4>
            <div className="space-y-1">
              {['plugin-a', 'plugin-b', 'plugin-c']
                .filter(id => !state.simplePlugins.includes(id))
                .map(id => (
                  <div key={id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                    <span className="text-gray-800">{id}</span>
                    <button
                      onClick={() => addSimplePlugin(id)}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                    >
                      Add
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real Plugins */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          🔌 Real MarkItUp Plugins ({state.realPlugins.length} loaded)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Loaded:</h4>
            {state.realPlugins.length === 0 ? (
              <p className="text-gray-500 text-sm">None</p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {state.realPlugins.map(plugin => (
                  <div key={plugin.id} className="flex justify-between items-center p-2 bg-green-100 rounded">
                    <div>
                      <div className="text-green-800 font-medium text-sm">{plugin.name}</div>
                      <div className="text-green-600 text-xs">{plugin.description}</div>
                    </div>
                    <button
                      onClick={() => unloadRealPlugin(plugin.id)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Available ({state.availablePlugins.length}):</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {state.availablePlugins
                .filter(plugin => !state.realPlugins.some(loaded => loaded.id === plugin.id))
                .slice(0, 6)
                .map(plugin => (
                  <div key={plugin.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                    <div>
                      <div className="text-gray-800 font-medium text-sm">{plugin.name}</div>
                      <div className="text-gray-600 text-xs">{plugin.description}</div>
                    </div>
                    <button
                      onClick={() => loadRealPlugin(plugin.id)}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                    >
                      Load
                    </button>
                  </div>
                ))}
            </div>
            {state.availablePlugins.length > 6 && (
              <p className="text-gray-500 text-xs mt-1">
                +{state.availablePlugins.length - 6} more available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          🔄 Test Persistence (Refresh Page)
        </button>
        <button
          onClick={clearAllData}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🗑️ Clear All Data
        </button>
      </div>

      {/* Debug Info */}
      <div className="bg-gray-50 border border-gray-200 rounded p-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Simple localStorage:</strong> {localStorage.getItem('ultra-simple-test') || '(empty)'}</div>
          <div><strong>Real localStorage:</strong> {localStorage.getItem('working-real-plugins') || '(empty)'}</div>
          <div><strong>Plugin Manager:</strong> {state.pluginManager ? '✅ Ready' : '❌ Missing'}</div>
          <div><strong>Available Plugins:</strong> {state.availablePlugins.length}</div>
          <div><strong>Loaded Real:</strong> {state.realPlugins.length}</div>
          <div><strong>Loaded Simple:</strong> {state.simplePlugins.length}</div>
        </div>
      </div>
    </div>
  );
}
