"use client";

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  Package,
  Zap,
  Brain,
  BarChart3,
  Wand2,
  X,
  Save,
  Eye,
  EyeOff,
  Key
} from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { AIPluginMetadata, AIPluginManager, AIPlugin } from '@/lib/ai/plugin-manager-simple';
import { analytics } from '@/lib/analytics';

interface PluginManagerProps {
  isOpen: boolean;
  onClose: () => void;
  pluginManager: AIPluginManager;
  onPluginChange?: () => Promise<void>;
}

interface PluginStatus {
  id: string;
  name: string;
  enabled: boolean;
  hasSettings: boolean;
  status: 'active' | 'error' | 'disabled';
  lastError?: string;
  metadata: AIPluginMetadata;
}

const categoryIcons = {
  'ai-assistant': Brain,
  'content-generation': Wand2,
  'analysis': BarChart3,
  'visualization': BarChart3,
  'automation': Zap,
  'integration': ExternalLink,
  'utility': Package
};

export default function PluginManager({ 
  isOpen, 
  onClose, 
  pluginManager,
  onPluginChange 
}: PluginManagerProps) {
  const { theme } = useSimpleTheme();
  
  // State
  const [plugins, setPlugins] = useState<PluginStatus[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<PluginStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pluginSettings, setPluginSettings] = useState<Record<string, any>>({});
  const [showApiKeys, setShowApiKeys] = useState(false);

  // Load plugins when opened
  useEffect(() => {
    if (isOpen) {
      loadPlugins();
    }
  }, [isOpen]);

  const loadPlugins = async () => {
    setIsLoading(true);
    try {
      const installedPlugins = await pluginManager.getInstalledPlugins();
      const pluginStatuses: PluginStatus[] = [];

      for (const plugin of installedPlugins) {
        const status: PluginStatus = {
          id: plugin.metadata.id,
          name: plugin.metadata.name,
          enabled: pluginManager.isPluginEnabled(plugin.metadata.id),
          hasSettings: Object.keys(plugin.metadata.settings || {}).length > 0,
          status: pluginManager.isPluginEnabled(plugin.metadata.id) ? 'active' : 'disabled',
          metadata: plugin.metadata
        };

        // Check for errors
        try {
          // This would check plugin health status
          // For now, we'll just mark as active if enabled
        } catch (error) {
          status.status = 'error';
          status.lastError = (error as Error).message;
        }

        pluginStatuses.push(status);
      }

      setPlugins(pluginStatuses);
    } catch (error) {
      console.error('Failed to load plugins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePlugin = async (pluginId: string, enabled: boolean) => {
    setIsLoading(true);
    try {
      if (enabled) {
        await pluginManager.enablePlugin(pluginId);
      } else {
        await pluginManager.disablePlugin(pluginId);
      }
      
      // Update local state
      setPlugins(prev => prev.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, enabled, status: enabled ? 'active' : 'disabled' }
          : plugin
      ));

      analytics.trackEvent('ai_analysis', {
        action: 'plugin_toggled',
        pluginId,
        enabled
      });
    } catch (error) {
      console.error('Failed to toggle plugin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUninstallPlugin = async (pluginId: string) => {
    if (!confirm('Are you sure you want to uninstall this plugin? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await pluginManager.uninstallPlugin(pluginId);
      if (success) {
        setPlugins(prev => prev.filter(plugin => plugin.id !== pluginId));
        if (selectedPlugin?.id === pluginId) {
          setSelectedPlugin(null);
        }
        
        // Notify parent about plugin change
        if (onPluginChange) {
          await onPluginChange();
        }
        
        analytics.trackEvent('ai_analysis', {
          action: 'plugin_uninstalled',
          pluginId
        });
      }
    } catch (error) {
      console.error('Failed to uninstall plugin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!selectedPlugin) return;

    setIsLoading(true);
    try {
      await pluginManager.updatePluginSettings(selectedPlugin.id, pluginSettings);
      setShowSettings(false);
      
      analytics.trackEvent('ai_analysis', {
        action: 'plugin_settings_updated',
        pluginId: selectedPlugin.id
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPluginSettings = () => {
    if (!selectedPlugin || !showSettings) return null;

    const settings = selectedPlugin.metadata.settings || {};

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60"
        onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}>
        
        <div 
          className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-auto"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
          }}>
          
          <div 
            className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
            style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
            
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              <div>
                <h2 
                  className="text-xl font-semibold"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                  {selectedPlugin.name} Settings
                </h2>
                <p 
                  className="text-sm"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Configure plugin preferences and API keys
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {Object.entries(settings).map(([key, setting]) => (
              <div key={key}>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                  {setting.label || key}
                  {setting.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {setting.description && (
                  <p 
                    className="text-xs mb-2"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                    {setting.description}
                  </p>
                )}

                {setting.type === 'boolean' ? (
                  <button
                    onClick={() => setPluginSettings(prev => ({
                      ...prev,
                      [key]: !prev[key]
                    }))}
                    className="flex items-center gap-2">
                    {pluginSettings[key] ? (
                      <ToggleRight className="w-6 h-6 text-blue-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                    <span 
                      className="text-sm"
                      style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}>
                      {pluginSettings[key] ? 'Enabled' : 'Disabled'}
                    </span>
                  </button>
                ) : setting.type === 'select' ? (
                  <select
                    value={pluginSettings[key] || setting.default || ''}
                    onChange={(e) => setPluginSettings(prev => ({
                      ...prev,
                      [key]: e.target.value
                    }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      color: theme === 'dark' ? '#f9fafb' : '#111827'
                    }}>
                    {setting.options?.map((option: any) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : setting.type === 'password' || setting.type === 'apikey' ? (
                  <div className="relative">
                    <input
                      type={showApiKeys ? 'text' : 'password'}
                      value={pluginSettings[key] || ''}
                      onChange={(e) => setPluginSettings(prev => ({
                        ...prev,
                        [key]: e.target.value
                      }))}
                      placeholder={setting.placeholder || `Enter ${setting.label || key}`}
                      className="w-full px-3 py-2 pr-10 border rounded-lg text-sm"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                        color: theme === 'dark' ? '#f9fafb' : '#111827'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKeys(!showApiKeys)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {showApiKeys ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                ) : (
                  <input
                    type={setting.type || 'text'}
                    value={pluginSettings[key] || ''}
                    onChange={(e) => setPluginSettings(prev => ({
                      ...prev,
                      [key]: e.target.value
                    }))}
                    placeholder={setting.placeholder || `Enter ${setting.label || key}`}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      color: theme === 'dark' ? '#f9fafb' : '#111827'
                    }}
                  />
                )}
              </div>
            ))}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Settings
              </button>
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
        onClick={(e) => e.target === e.currentTarget && onClose()}>
        
        <div 
          className="w-full max-w-4xl h-full max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
          }}>
          
          {/* Header */}
          <div 
            className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
            style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
            
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 
                className="text-xl font-semibold text-gray-900 dark:text-white"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                Plugin Manager
              </h2>
              <span 
                className="text-sm px-3 py-1 rounded-full"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                  color: theme === 'dark' ? '#d1d5db' : '#6b7280'
                }}>
                {plugins.length} plugins installed
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Plugin List */}
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
            ) : plugins.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 
                  className="text-lg font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                  No Plugins Installed
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Install plugins from the Plugin Store to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {plugins.map(plugin => {
                  const CategoryIcon = categoryIcons[plugin.metadata.category] || Package;
                  
                  return (
                    <div
                      key={plugin.id}
                      className="p-4 rounded-lg border hover:border-blue-200 dark:hover:border-blue-700 transition-colors"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                        borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                      }}>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div 
                            className="p-2 rounded-lg"
                            style={{
                              backgroundColor: theme === 'dark' ? '#4b5563' : '#ffffff'
                            }}>
                            <CategoryIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 
                                className="font-medium"
                                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                                {plugin.name}
                              </h3>
                              
                              <div className="flex items-center gap-1">
                                {plugin.status === 'active' && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                                {plugin.status === 'error' && (
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                )}
                                {plugin.status === 'disabled' && (
                                  <div className="w-4 h-4 rounded-full bg-gray-400" />
                                )}
                              </div>
                            </div>
                            
                            <p 
                              className="text-sm"
                              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                              {plugin.metadata.description}
                            </p>
                            
                            {plugin.lastError && (
                              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                Error: {plugin.lastError}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {plugin.hasSettings && (
                            <button
                              onClick={() => {
                                setSelectedPlugin(plugin);
                                setPluginSettings({}); // Load from plugin manager
                                setShowSettings(true);
                              }}
                              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              title="Plugin Settings">
                              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleTogglePlugin(plugin.id, !plugin.enabled)}
                            disabled={isLoading}
                            className="flex items-center gap-1"
                            title={plugin.enabled ? 'Disable Plugin' : 'Enable Plugin'}>
                            {plugin.enabled ? (
                              <ToggleRight className="w-6 h-6 text-blue-500" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-gray-400" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleUninstallPlugin(plugin.id)}
                            disabled={isLoading}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group"
                            title="Uninstall Plugin">
                            <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {renderPluginSettings()}
    </>
  );
}
