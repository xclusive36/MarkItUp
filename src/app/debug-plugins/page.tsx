"use client";

import React, { useState, useEffect } from 'react';
import { AIPluginManager } from '@/lib/ai/plugin-manager-simple';

export default function DebugPluginsPage() {
  const [mounted, setMounted] = useState(false);
  const [pluginManager, setPluginManager] = useState<AIPluginManager | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [installedPlugins, setInstalledPlugins] = useState<any[]>([]);
  const [storageContent, setStorageContent] = useState<string>('');

  const addDebug = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${timestamp}: ${message}`;
    setDebugInfo(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  const checkStorage = () => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('markitup-installed-plugins');
      setStorageContent(stored || 'null');
      addDebug(`localStorage content: ${stored || 'null'}`);
      return stored;
    }
    return null;
  };

  useEffect(() => {
    setMounted(true);
    addDebug("🚀 Component mounted");
    
    // Check initial storage
    const initialStorage = checkStorage();
    
    // Initialize plugin manager
    addDebug("🔧 Creating plugin manager...");
    const manager = new AIPluginManager();
    setPluginManager(manager);
    addDebug("✅ Plugin manager created");
    
    // Give it a moment to initialize, then load plugins
    setTimeout(() => {
      loadPlugins(manager);
    }, 100);
  }, []);

  const loadPlugins = async (manager: AIPluginManager) => {
    try {
      addDebug("📂 Loading plugins from manager...");
      const plugins = await manager.getInstalledPlugins();
      setInstalledPlugins(plugins);
      addDebug(`📊 Manager reports ${plugins.length} plugins installed`);
      
      if (plugins.length > 0) {
        plugins.forEach(plugin => {
          addDebug(`  - ${plugin.metadata.name} (${plugin.metadata.id})`);
        });
      } else {
        addDebug("  - No plugins found in manager");
      }
      
      // Also check storage again
      checkStorage();
    } catch (error) {
      addDebug(`❌ Error loading plugins: ${error}`);
    }
  };

  const installTestPlugin = async () => {
    if (!pluginManager) {
      addDebug("❌ Plugin manager not ready");
      return;
    }

    try {
      addDebug("🔄 Installing AI Writing Assistant...");
      
      // Check storage before install
      addDebug("📋 Storage before install:");
      checkStorage();
      
      const success = await pluginManager.installPlugin('ai-writing-assistant');
      addDebug(`✅ Install result: ${success}`);
      
      // Check storage immediately after install
      addDebug("📋 Storage immediately after install:");
      checkStorage();
      
      // Reload plugins to see what manager thinks
      await loadPlugins(pluginManager);
      
    } catch (error) {
      addDebug(`❌ Error installing plugin: ${error}`);
    }
  };

  const manualStorageTest = () => {
    addDebug("🧪 Running manual storage test...");
    
    // Test basic localStorage functionality
    try {
      localStorage.setItem('test-key', 'test-value');
      const retrieved = localStorage.getItem('test-key');
      addDebug(`✅ Basic localStorage test: stored 'test-value', retrieved '${retrieved}'`);
      
      // Test JSON storage
      const testData = ['plugin1', 'plugin2'];
      localStorage.setItem('test-json', JSON.stringify(testData));
      const retrievedJson = localStorage.getItem('test-json');
      const parsed = JSON.parse(retrievedJson || '[]');
      addDebug(`✅ JSON storage test: stored ${JSON.stringify(testData)}, retrieved ${JSON.stringify(parsed)}`);
      
      // Clean up
      localStorage.removeItem('test-key');
      localStorage.removeItem('test-json');
      
    } catch (error) {
      addDebug(`❌ Manual storage test failed: ${error}`);
    }
  };

  const clearStorage = () => {
    addDebug("🗑️ Clearing plugin storage...");
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('markitup-installed-plugins');
      addDebug("✅ Storage cleared");
      checkStorage();
      if (pluginManager) {
        loadPlugins(pluginManager);
      }
    }
  };

  const forceReload = () => {
    addDebug("🔄 Forcing page reload...");
    window.location.reload();
  };

  if (!mounted) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Loading debug interface...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🔍 Plugin Persistence Debug Center</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold mb-4">🎛️ Controls</h2>
          
          <button
            onClick={installTestPlugin}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            disabled={!pluginManager}
          >
            📦 Install Plugin
          </button>
          
          <button
            onClick={() => { checkStorage(); if (pluginManager) loadPlugins(pluginManager); }}
            className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            🔍 Check Current State
          </button>
          
          <button
            onClick={manualStorageTest}
            className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            🧪 Test localStorage
          </button>
          
          <button
            onClick={clearStorage}
            className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            🗑️ Clear Storage
          </button>
          
          <button
            onClick={forceReload}
            className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            🔄 Reload Page
          </button>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">📊 Current Status</h2>
          
          <div className="p-4 bg-blue-50 rounded-lg border">
            <h3 className="font-medium mb-2">🔧 Plugin Manager</h3>
            <p className="text-sm">
              Status: <span className={pluginManager ? 'text-green-600 font-medium' : 'text-red-600'}>
                {pluginManager ? '✅ Ready' : '❌ Not Ready'}
              </span>
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border">
            <h3 className="font-medium mb-2">📦 Installed Plugins ({installedPlugins.length})</h3>
            {installedPlugins.length === 0 ? (
              <p className="text-gray-500 text-sm">No plugins installed</p>
            ) : (
              <ul className="space-y-1">
                {installedPlugins.map((plugin, index) => (
                  <li key={index} className="text-sm bg-white p-2 rounded border">
                    <div className="font-medium">{plugin.metadata.name}</div>
                    <div className="text-gray-500 text-xs">ID: {plugin.metadata.id}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg border">
            <h3 className="font-medium mb-2">💾 Storage Content</h3>
            <div className="text-sm font-mono bg-gray-100 p-2 rounded border break-all">
              {storageContent || 'Empty'}
            </div>
          </div>
        </div>

        {/* Debug Log */}
        <div>
          <h2 className="text-xl font-semibold mb-4">📝 Debug Log</h2>
          <div className="bg-black text-green-400 rounded-lg p-4 font-mono text-xs max-h-96 overflow-y-auto">
            {debugInfo.length === 0 ? (
              <p>Waiting for debug info...</p>
            ) : (
              debugInfo.map((info, index) => (
                <div key={index} className="mb-1">{info}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
