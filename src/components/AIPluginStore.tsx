'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  Search,
  Download,
  Trash2,
  Star,
  // Filter,
  // Tag,
  Zap,
  Brain,
  BarChart3,
  Wand2,
  // Settings,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  // Info,
  X,
  RefreshCw,
  Package,
  Sparkles,
} from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { Note } from '@/lib/types';
import { analytics } from '@/lib/analytics';
import { AIPluginMetadata, AIPluginManager } from '@/lib/ai/plugin-manager-simple';

interface AIPluginStoreProps {
  notes: Note[];
  isOpen: boolean;
  onClose: () => void;
  pluginManager: AIPluginManager;
  onPluginChange?: () => Promise<void>;
}

const categoryIcons = {
  'ai-assistant': Brain,
  'content-generation': Wand2,
  analysis: BarChart3,
  visualization: BarChart3,
  automation: Zap,
  integration: ExternalLink,
  utility: Package,
};

const categoryColors = {
  'ai-assistant': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'content-generation': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  analysis: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  visualization: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  automation: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  integration: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  utility: 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300',
};

export default function AIPluginStore({
  notes,
  isOpen,
  onClose,
  pluginManager,
  onPluginChange,
}: AIPluginStoreProps) {
  const { theme } = useSimpleTheme();

  // State
  const [activeTab, setActiveTab] = useState<'discover' | 'installed' | 'suggested'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [plugins, setPlugins] = useState<AIPluginMetadata[]>([]);
  const [installedPlugins, setInstalledPlugins] = useState<Set<string>>(new Set());
  const [suggestedPlugins, setSuggestedPlugins] = useState<AIPluginMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<AIPluginMetadata | null>(null);

  // Load plugins when opened
  useEffect(() => {
    if (isOpen) {
      loadPlugins();
      loadSuggestions();
    }
  }, [isOpen, searchQuery, selectedCategory]);

  const loadPlugins = async () => {
    setIsLoading(true);
    try {
      const discoveredPlugins = await pluginManager.discoverPlugins(searchQuery, selectedCategory);
      setPlugins(discoveredPlugins);

      const installed = new Set<string>();
      discoveredPlugins.forEach(plugin => {
        if (pluginManager.isPluginInstalled(plugin.id)) {
          installed.add(plugin.id);
        }
      });
      setInstalledPlugins(installed);
    } catch (error) {
      console.error('Failed to load plugins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const suggestions = await pluginManager.suggestPlugins({ notes });
      setSuggestedPlugins(suggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleInstallPlugin = async (pluginId: string) => {
    setIsLoading(true);
    try {
      const success = await pluginManager.installPlugin(pluginId);
      if (success) {
        setInstalledPlugins(prev => new Set([...prev, pluginId]));

        // Notify parent about plugin change
        if (onPluginChange) {
          await onPluginChange();
        }

        analytics.trackEvent('ai_analysis', {
          action: 'plugin_installed',
          pluginId,
        });
      }
    } catch (error) {
      console.error('Failed to install plugin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUninstallPlugin = async (pluginId: string) => {
    setIsLoading(true);
    try {
      const success = await pluginManager.uninstallPlugin(pluginId);
      if (success) {
        setInstalledPlugins(prev => {
          const newSet = new Set(prev);
          newSet.delete(pluginId);
          return newSet;
        });

        // Notify parent about plugin change
        if (onPluginChange) {
          await onPluginChange();
        }

        analytics.trackEvent('ai_analysis', {
          action: 'plugin_uninstalled',
          pluginId,
        });
      }
    } catch (error) {
      console.error('Failed to uninstall plugin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">({rating})</span>
      </div>
    );
  };

  const renderPluginCard = (plugin: AIPluginMetadata) => {
    const isInstalled = installedPlugins.has(plugin.id);
    const CategoryIcon = categoryIcons[plugin.category] || Package;
    const categoryColor = categoryColors[plugin.category] || categoryColors.utility;

    return (
      <div
        key={plugin.id}
        className="p-4 rounded-lg border hover:border-blue-200 dark:hover:border-blue-700 transition-colors cursor-pointer"
        style={{
          backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
          borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
        }}
        onClick={() => setSelectedPlugin(plugin)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${categoryColor}`}>
              <CategoryIcon className="w-5 h-5" />
            </div>
            <div>
              <h3
                className="font-semibold text-sm"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                {plugin.name}
              </h3>
              <p className="text-xs" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                by {plugin.author}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {plugin.aiRequirements?.requiresApiKey && (
              <div
                className="p-1 rounded bg-yellow-100 dark:bg-yellow-900/30"
                title="Requires API Key"
              >
                <Sparkles className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
              </div>
            )}

            {plugin.pricing === 'paid' && (
              <span className="text-xs px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                Paid
              </span>
            )}

            {plugin.pricing === 'freemium' && (
              <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                Freemium
              </span>
            )}
          </div>
        </div>

        <p
          className="text-sm mb-3 line-clamp-2"
          style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
        >
          {plugin.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          {renderStarRating(plugin.rating)}
          <span className="text-xs" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
            {plugin.downloads.toLocaleString()} downloads
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {plugin.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
          {plugin.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{plugin.tags.length - 3}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded ${categoryColor}`}>
            {plugin.category.replace('-', ' ')}
          </span>

          {isInstalled ? (
            <button
              onClick={e => {
                e.stopPropagation();
                handleUninstallPlugin(plugin.id);
              }}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
              Uninstall
            </button>
          ) : (
            <button
              onClick={e => {
                e.stopPropagation();
                handleInstallPlugin(plugin.id);
              }}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Download className="w-3 h-3" />
              )}
              Install
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderPluginDetails = () => {
    if (!selectedPlugin) return null;

    const isInstalled = installedPlugins.has(selectedPlugin.id);

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60"
        onClick={e => e.target === e.currentTarget && setSelectedPlugin(null)}
      >
        <div
          className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-auto"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          }}
        >
          <div
            className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
            style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${categoryColors[selectedPlugin.category]}`}>
                {React.createElement(categoryIcons[selectedPlugin.category] || Package, {
                  className: 'w-6 h-6',
                })}
              </div>
              <div>
                <h2
                  className="text-xl font-semibold"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  {selectedPlugin.name}
                </h2>
                <p className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  by {selectedPlugin.author} • v{selectedPlugin.version}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlugin(null)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3
                className="font-medium mb-2"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                Description
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
              >
                {selectedPlugin.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4
                  className="font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                      Category:
                    </span>
                    <span style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}>
                      {selectedPlugin.category.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>Rating:</span>
                    <div>{renderStarRating(selectedPlugin.rating)}</div>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                      Downloads:
                    </span>
                    <span style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}>
                      {selectedPlugin.downloads.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                      Pricing:
                    </span>
                    <span style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}>
                      {selectedPlugin.pricing}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4
                  className="font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Capabilities
                </h4>
                <div className="space-y-1">
                  {Object.entries(selectedPlugin.capabilities).map(
                    ([capability, enabled]) =>
                      enabled && (
                        <div key={capability} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}>
                            {capability.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>

            {selectedPlugin.tags.length > 0 && (
              <div>
                <h4
                  className="font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPlugin.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedPlugin.aiRequirements && (
              <div className="p-3 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="font-medium text-sm text-yellow-800 dark:text-yellow-200">
                    AI Requirements
                  </span>
                </div>
                <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                  {selectedPlugin.aiRequirements.requiresApiKey && <li>• Requires AI API key</li>}
                  <li>
                    • Supported providers:{' '}
                    {selectedPlugin.aiRequirements.supportedProviders?.join(', ')}
                  </li>
                  {selectedPlugin.aiRequirements.minTokens && (
                    <li>• Minimum tokens: {selectedPlugin.aiRequirements.minTokens}</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {selectedPlugin.homepage && (
                  <a
                    href={selectedPlugin.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Homepage
                  </a>
                )}
                {selectedPlugin.repository && (
                  <a
                    href={selectedPlugin.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Source
                  </a>
                )}
              </div>

              {isInstalled ? (
                <button
                  onClick={() => handleUninstallPlugin(selectedPlugin.id)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Uninstall'}
                </button>
              ) : (
                <button
                  onClick={() => handleInstallPlugin(selectedPlugin.id)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Install Plugin'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div
          className="w-full max-w-6xl h-full max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
            style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
          >
            <div className="flex items-center gap-3">
              <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2
                className="text-xl font-semibold text-gray-900 dark:text-white"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                AI Plugin Store
              </h2>
              <span
                className="text-sm px-3 py-1 rounded-full"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                  color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                }}
              >
                {plugins.length} plugins available
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div
            className="flex border-b border-gray-200 dark:border-gray-700"
            style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
          >
            {[
              { id: 'discover', label: 'Discover', icon: Search },
              { id: 'installed', label: 'Installed', icon: CheckCircle },
              { id: 'suggested', label: 'Suggested', icon: Sparkles },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'installed' && installedPlugins.size > 0 && (
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                    {installedPlugins.size}
                  </span>
                )}
                {tab.id === 'suggested' && suggestedPlugins.length > 0 && (
                  <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
                    {suggestedPlugins.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          {(activeTab === 'discover' || activeTab === 'installed') && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search plugins..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      color: theme === 'dark' ? '#f9fafb' : '#111827',
                    }}
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    color: theme === 'dark' ? '#f9fafb' : '#111827',
                  }}
                >
                  <option value="">All Categories</option>
                  <option value="ai-assistant">AI Assistant</option>
                  <option value="content-generation">Content Generation</option>
                  <option value="analysis">Analysis</option>
                  <option value="visualization">Visualization</option>
                  <option value="automation">Automation</option>
                  <option value="integration">Integration</option>
                  <option value="utility">Utility</option>
                </select>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                    Loading plugins...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Discover Tab */}
                {activeTab === 'discover' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plugins.map(plugin => renderPluginCard(plugin))}
                  </div>
                )}

                {/* Installed Tab */}
                {activeTab === 'installed' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plugins
                      .filter(plugin => installedPlugins.has(plugin.id))
                      .map(plugin => renderPluginCard(plugin))}
                    {plugins.filter(plugin => installedPlugins.has(plugin.id)).length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3
                          className="text-lg font-medium mb-2"
                          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                        >
                          No Plugins Installed
                        </h3>
                        <p
                          className="text-sm mb-4"
                          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                        >
                          Browse the discover tab to find and install plugins
                        </p>
                        <button
                          onClick={() => setActiveTab('discover')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Discover Plugins
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Suggested Tab */}
                {activeTab === 'suggested' && (
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        <h3
                          className="font-medium"
                          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                        >
                          AI-Powered Recommendations
                        </h3>
                      </div>
                      <p
                        className="text-sm"
                        style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                      >
                        Based on your {notes.length} notes and usage patterns, we recommend these
                        plugins:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {suggestedPlugins.map(plugin => renderPluginCard(plugin))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Plugin Details Modal */}
      {renderPluginDetails()}
    </>
  );
}
