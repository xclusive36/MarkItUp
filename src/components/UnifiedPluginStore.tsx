// Unified Plugin Store Component
// Demonstrates both Phase 5 and AI Plugin systems working together

'use client';

import { useState, useEffect } from 'react';
import { PluginManifest } from '../lib/types';
import { AIPluginMetadata, aiPluginManager } from '../lib/ai/plugin-manager-unified';
import { PluginBridge, unifiedPluginRegistry, isAIPlugin } from '../lib/ai/plugin-bridge';

interface PluginStoreProps {
  className?: string;
}

export default function UnifiedPluginStore({ className = '' }: PluginStoreProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'phase5' | 'ai' | 'installed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [installedPlugins, setInstalledPlugins] = useState<AIPluginMetadata[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load installed plugins on mount
  useEffect(() => {
    setInstalledPlugins(aiPluginManager.getInstalledPlugins());
  }, []);

  // Filter plugins based on active tab and search
  const getFilteredPlugins = () => {
    let plugins: (PluginManifest | AIPluginMetadata)[] = [];

    switch (activeTab) {
      case 'phase5':
        plugins = unifiedPluginRegistry.phase5Plugins;
        break;
      case 'ai':
        plugins = [...unifiedPluginRegistry.aiPlugins, ...unifiedPluginRegistry.bridgedPlugins];
        break;
      case 'installed':
        plugins = installedPlugins;
        break;
      default:
        plugins = [
          ...unifiedPluginRegistry.phase5Plugins,
          ...unifiedPluginRegistry.aiPlugins,
          ...unifiedPluginRegistry.bridgedPlugins,
        ];
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      plugins = plugins.filter(
        plugin =>
          plugin.name.toLowerCase().includes(query) ||
          plugin.description.toLowerCase().includes(query) ||
          plugin.author.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      plugins = plugins.filter(plugin => {
        if (isAIPlugin(plugin)) {
          return plugin.category === selectedCategory;
        }
        // For Phase 5 plugins, use the bridge to determine category
        const bridged = PluginBridge.convertToAIPlugin(plugin);
        return bridged.category === selectedCategory;
      });
    }

    return plugins;
  };

  const handleInstallPlugin = async (plugin: PluginManifest | AIPluginMetadata) => {
    let aiPlugin: AIPluginMetadata;

    if (isAIPlugin(plugin)) {
      aiPlugin = plugin;
    } else {
      // Convert Phase 5 plugin to AI plugin format
      aiPlugin = PluginBridge.convertToAIPlugin(plugin);
    }

    const success = await aiPluginManager.installPlugin(aiPlugin);
    if (success) {
      setInstalledPlugins(aiPluginManager.getInstalledPlugins());
    }
  };

  const handleUninstallPlugin = async (pluginId: string) => {
    const success = await aiPluginManager.uninstallPlugin(pluginId);
    if (success) {
      setInstalledPlugins(aiPluginManager.getInstalledPlugins());
    }
  };

  const handleTogglePlugin = async (pluginId: string) => {
    const isEnabled = aiPluginManager.isEnabled(pluginId);
    const success = isEnabled
      ? await aiPluginManager.disablePlugin(pluginId)
      : await aiPluginManager.enablePlugin(pluginId);

    if (success) {
      setInstalledPlugins(aiPluginManager.getInstalledPlugins());
    }
  };

  const isInstalled = (pluginId: string) => {
    return aiPluginManager.isInstalled(pluginId);
  };

  const isEnabled = (pluginId: string) => {
    return aiPluginManager.isEnabled(pluginId);
  };

  const getPluginIcon = (plugin: PluginManifest | AIPluginMetadata) => {
    if (isAIPlugin(plugin)) {
      switch (plugin.aiIntegration?.type) {
        case 'content-generation':
          return '✨';
        case 'analysis':
          return '🔍';
        case 'automation':
          return '⚡';
        case 'enhancement':
          return '🚀';
        default:
          return '🤖';
      }
    }
    return '🔧';
  };

  const categories = [
    'all',
    'Core',
    'Productivity',
    'Utility',
    'AI & Learning',
    'Theming',
    'ai-chat',
    'knowledge-enhancement',
    'automation',
    'analysis',
  ];

  return (
    <div className={`unified-plugin-store ${className}`}>
      <div className="plugin-store-header">
        <h2 className="text-2xl font-bold mb-4">Plugin Store</h2>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search plugins..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          {[
            { key: 'all', label: 'All Plugins' },
            { key: 'phase5', label: 'Phase 5 Core' },
            { key: 'ai', label: 'AI Enhanced' },
            { key: 'installed', label: 'Installed' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredPlugins().map(plugin => (
          <div
            key={plugin.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getPluginIcon(plugin)}</span>
                <h3 className="font-semibold text-lg">{plugin.name}</h3>
              </div>
              {isAIPlugin(plugin) && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">AI</span>
              )}
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{plugin.description}</p>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>v{plugin.version}</span>
              <span>by {plugin.author}</span>
            </div>

            {/* AI Integration Info */}
            {isAIPlugin(plugin) && plugin.aiIntegration && (
              <div className="mb-4 p-2 bg-blue-50 rounded text-xs">
                <strong>AI Type:</strong> {plugin.aiIntegration.type}
                <br />
                <strong>Generates:</strong> {plugin.contentGeneration ? 'Yes' : 'No'}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {isInstalled(plugin.id) ? (
                <>
                  <button
                    onClick={() => handleTogglePlugin(plugin.id)}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                      isEnabled(plugin.id)
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {isEnabled(plugin.id) ? 'Enabled' : 'Disabled'}
                  </button>
                  <button
                    onClick={() => handleUninstallPlugin(plugin.id)}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleInstallPlugin(plugin)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Install
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {unifiedPluginRegistry.phase5Plugins.length}
            </div>
            <div className="text-sm text-gray-600">Phase 5 Plugins</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {unifiedPluginRegistry.aiPlugins.length}
            </div>
            <div className="text-sm text-gray-600">AI Native</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {unifiedPluginRegistry.bridgedPlugins.length}
            </div>
            <div className="text-sm text-gray-600">AI Enhanced</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{installedPlugins.length}</div>
            <div className="text-sm text-gray-600">Installed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
