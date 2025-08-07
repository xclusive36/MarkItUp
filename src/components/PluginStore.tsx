'use client';

import React, { useState, useEffect } from 'react';
import { Plugin, PluginManifest } from '@/lib/types';
import { PluginManager, PluginLoader } from '@/lib/plugin-manager';

interface PluginStoreProps {
  pluginManager: PluginManager;
  onClose: () => void;
}

const PluginStore: React.FC<PluginStoreProps> = ({ pluginManager, onClose }) => {
  const [loadedPlugins, setLoadedPlugins] = useState<Plugin[]>([]);
  const [availablePlugins, setAvailablePlugins] = useState<PluginManifest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'installed' | 'store'>('installed');

  useEffect(() => {
    refreshPlugins();
  }, []);

  const refreshPlugins = () => {
    setLoadedPlugins(pluginManager.getLoadedPlugins());
  };

  const handleInstallPlugin = async (manifest: PluginManifest) => {
    setIsLoading(true);
    try {
      const success = await pluginManager.loadPlugin(manifest);
      if (success) {
        refreshPlugins();
        alert(`Plugin "${manifest.name}" installed successfully!`);
      } else {
        alert(`Failed to install plugin "${manifest.name}"`);
      }
    } catch (error) {
      alert(`Error installing plugin: ${error}`);
    }
    setIsLoading(false);
  };

  const handleUninstallPlugin = async (pluginId: string) => {
    if (confirm('Are you sure you want to uninstall this plugin?')) {
      setIsLoading(true);
      try {
        const success = await pluginManager.unloadPlugin(pluginId);
        if (success) {
          refreshPlugins();
          alert('Plugin uninstalled successfully!');
        } else {
          alert('Failed to uninstall plugin');
        }
      } catch (error) {
        alert(`Error uninstalling plugin: ${error}`);
      }
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        const manifest = await PluginLoader.loadFromFile(file);
        if (manifest) {
          await handleInstallPlugin(manifest);
        } else {
          alert('Invalid plugin file');
        }
      } catch (error) {
        alert(`Error loading plugin file: ${error}`);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-3/4 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plugin Store</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('installed')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'installed'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Installed Plugins ({loadedPlugins.length})
            </button>
            <button
              onClick={() => setActiveTab('store')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'store'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Plugin Store
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'installed' ? (
              <div className="space-y-4">
                {loadedPlugins.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      No plugins installed
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Install plugins to extend MarkItUp's functionality
                    </p>
                  </div>
                ) : (
                  loadedPlugins.map((plugin) => (
                    <div key={plugin.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {plugin.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {plugin.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>v{plugin.version}</span>
                            <span>by {plugin.author}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUninstallPlugin(plugin.id)}
                          disabled={isLoading}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          Uninstall
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Install from file */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Install Plugin from File
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Upload a plugin manifest file (.json) to install
                    </p>
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                      Choose File
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </label>
                  </div>
                </div>

                {/* Featured plugins */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Featured Plugins
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">Enhanced Word Count</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Detailed word count statistics and reading time estimates
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">by MarkItUp Team</span>
                        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                          Install
                        </button>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">Markdown Export</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Export notes to PDF, HTML, and DOCX formats
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">by Community</span>
                        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                          Install
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                {isLoading ? 'Processing...' : `${loadedPlugins.length} plugins installed`}
              </span>
              <button
                onClick={refreshPlugins}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PluginStore;
