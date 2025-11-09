'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  ToggleLeft,
  ToggleRight,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
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
  HelpCircle,
} from 'lucide-react';
import { AIPluginMetadata, AIPluginManager } from '@/lib/ai/plugin-manager-simple';
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
  analysis: BarChart3,
  visualization: BarChart3,
  automation: Zap,
  integration: ExternalLink,
  utility: Package,
};

export default function PluginManager({
  isOpen,
  onClose,
  pluginManager,
  onPluginChange,
}: PluginManagerProps) {
  // State
  const [plugins, setPlugins] = useState<PluginStatus[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<PluginStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pluginSettings, setPluginSettings] = useState<Record<string, string | boolean | number>>(
    {}
  );
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [documentationPlugin, setDocumentationPlugin] = useState<PluginStatus | null>(null);

  // Load plugins when opened
  useEffect(() => {
    if (isOpen) {
      loadPlugins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          metadata: plugin.metadata,
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
      setPlugins(prev =>
        prev.map(plugin =>
          plugin.id === pluginId
            ? { ...plugin, enabled, status: enabled ? 'active' : 'disabled' }
            : plugin
        )
      );

      analytics.trackEvent('ai_analysis', {
        action: 'plugin_toggled',
        pluginId,
        enabled,
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
          pluginId,
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
        pluginId: selectedPlugin.id,
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
        onClick={e => e.target === e.currentTarget && setShowSettings(false)}
      >
        <div
          className="w-full max-w-2xl max-h-[80vh] rounded-lg shadow-xl overflow-auto"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
          }}
        >
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedPlugin.name} Settings
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Configure plugin preferences and API keys
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* AI Settings Notice for AI-related plugins or plugins that require API keys */}
            {(selectedPlugin.id.includes('ai-') ||
              selectedPlugin.id.includes('ml-') ||
              selectedPlugin.metadata.category === 'ai-assistant' ||
              selectedPlugin.metadata.category === 'content-generation' ||
              selectedPlugin.metadata.aiRequirements?.requiresApiKey ||
              Object.values(selectedPlugin.metadata.settings || {}).some(
                (s: any) => s.type === 'apikey'
              )) && (
              <div
                className="p-4 rounded-lg border-l-4"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: '#3b82f6',
                }}
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" />
                  <div>
                    <h3
                      className="font-medium text-sm mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      AI Provider Configuration
                    </h3>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      This plugin uses AI features that require provider configuration. Please
                      configure your AI provider (OpenAI, Anthropic, Gemini, or Ollama) and API
                      credentials in the <strong>AI Assistant</strong> panel in the sidebar. The
                      settings below are plugin-specific preferences only.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {Object.entries(settings).map(([key, setting]) => (
              <div key={key}>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {setting.label || key}
                  {setting.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {setting.description && (
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {setting.description}
                  </p>
                )}

                {setting.type === 'boolean' ? (
                  <button
                    onClick={() =>
                      setPluginSettings(prev => ({
                        ...prev,
                        [key]: !prev[key],
                      }))
                    }
                    className="flex items-center gap-2"
                  >
                    {pluginSettings[key] ? (
                      <ToggleRight className="w-6 h-6 text-blue-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {pluginSettings[key] ? 'Enabled' : 'Disabled'}
                    </span>
                  </button>
                ) : setting.type === 'select' ? (
                  <select
                    value={pluginSettings[key] || setting.default || ''}
                    onChange={e =>
                      setPluginSettings(prev => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-secondary)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {setting.options?.map((option: { value: string; label: string }) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : setting.type === 'password' || setting.type === 'apikey' ? (
                  <div className="relative">
                    <input
                      type={showApiKeys ? 'text' : 'password'}
                      value={String(pluginSettings[key] || '')}
                      onChange={e =>
                        setPluginSettings(prev => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      placeholder={setting.placeholder || `Enter ${setting.label || key}`}
                      className="w-full px-3 py-2 pr-10 border rounded-lg text-sm"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderColor: 'var(--border-secondary)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKeys(!showApiKeys)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
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
                    value={String(pluginSettings[key] || '')}
                    onChange={e =>
                      setPluginSettings(prev => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    placeholder={setting.placeholder || `Enter ${setting.label || key}`}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-secondary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                )}
              </div>
            ))}

            <div
              className="flex items-center justify-end gap-3 pt-4 border-t"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
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
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div
          className="w-full max-w-4xl h-full max-h-[90vh] rounded-lg shadow-xl flex flex-col"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Plugin Manager
              </h2>
              <span
                className="text-sm px-3 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                }}
              >
                {plugins.length} plugins installed
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Plugin List */}
          <div className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <p style={{ color: 'var(--text-secondary)' }}>Loading plugins...</p>
                </div>
              </div>
            ) : plugins.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  No Plugins Installed
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Install plugins from the Plugin Store to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* AI Settings Notice - show if any AI plugins are present */}
                {plugins.some(
                  p =>
                    p.id.includes('ai-') ||
                    p.id.includes('ml-') ||
                    p.metadata.category === 'ai-assistant' ||
                    p.metadata.category === 'content-generation'
                ) && (
                  <div
                    className="p-4 rounded-lg border-l-4"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: '#3b82f6',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Brain className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" />
                      <div>
                        <h3
                          className="font-medium text-sm mb-1"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          AI Plugin Configuration
                        </h3>
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          AI plugins use the centralized <strong>AI Assistant</strong> settings for
                          provider configuration (OpenAI, Anthropic, Gemini, or Ollama) and API
                          credentials. Access AI Assistant from the sidebar to configure your AI
                          provider. Plugin-specific settings can be configured using the settings
                          button below each plugin.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {plugins.map(plugin => {
                  const CategoryIcon = categoryIcons[plugin.metadata.category] || Package;

                  return (
                    <div
                      key={plugin.id}
                      className="p-4 rounded-lg border transition-colors"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderColor: 'var(--border-secondary)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border-secondary)';
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="p-2 rounded-lg"
                            style={{
                              backgroundColor: 'var(--bg-primary)',
                            }}
                          >
                            <CategoryIcon
                              className="w-5 h-5"
                              style={{ color: 'var(--text-secondary)' }}
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
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

                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
                          {plugin.metadata.documentation && (
                            <button
                              onClick={() => {
                                setDocumentationPlugin(plugin);
                                setShowDocumentation(true);
                              }}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: 'var(--text-secondary)' }}
                              onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              title="How to Use"
                            >
                              <HelpCircle className="w-4 h-4" />
                            </button>
                          )}

                          {plugin.hasSettings && (
                            <button
                              onClick={() => {
                                setSelectedPlugin(plugin);
                                setPluginSettings({}); // Load from plugin manager
                                setShowSettings(true);
                              }}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: 'var(--text-secondary)' }}
                              onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              title="Plugin Settings"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleTogglePlugin(plugin.id, !plugin.enabled)}
                            disabled={isLoading}
                            className="flex items-center gap-1"
                            title={plugin.enabled ? 'Disable Plugin' : 'Enable Plugin'}
                          >
                            {plugin.enabled ? (
                              <ToggleRight className="w-6 h-6 text-blue-500" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-gray-400" />
                            )}
                          </button>

                          <button
                            onClick={() => handleUninstallPlugin(plugin.id)}
                            disabled={isLoading}
                            className="p-2 rounded-lg transition-colors group"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={e => {
                              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            title="Uninstall Plugin"
                          >
                            <Trash2 className="w-4 h-4 group-hover:text-red-600 dark:group-hover:text-red-400" />
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

      {/* Documentation Modal */}
      {showDocumentation && documentationPlugin && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60"
          onClick={e => e.target === e.currentTarget && setShowDocumentation(false)}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] rounded-lg shadow-xl flex flex-col overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {documentationPlugin.name} - How to Use
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {documentationPlugin.metadata.description}
                </p>
              </div>
              <button
                onClick={() => setShowDocumentation(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Documentation Content */}
            <div className="flex-1 overflow-auto p-6">
              <div
                className="prose dark:prose-invert max-w-none"
                style={{ color: 'var(--text-primary)' }}
              >
                {/* Safe rendering of plugin documentation - plugins are trusted internal code */}
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      documentationPlugin.metadata.documentation || 'No documentation available.',
                  }}
                  className="markdown-content"
                />
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 border-t flex justify-end"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <button
                onClick={() => setShowDocumentation(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
