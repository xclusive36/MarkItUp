'use client';

import { useState, useEffect } from 'react';
import { PluginManifest } from '../lib/types';

interface PluginSettingsModalProps {
  plugin: PluginManifest;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (pluginId: string, settings: Record<string, unknown>) => void;
}

function PluginSettingsModal({ plugin, isOpen, onClose, onSave }: PluginSettingsModalProps) {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize settings with default values
  useEffect(() => {
    if (plugin.settings) {
      const defaultSettings: Record<string, unknown> = {};
      plugin.settings.forEach(setting => {
        // Try to load saved value from localStorage
        const savedValue = localStorage.getItem(`plugin.${plugin.id}.${setting.id}`);
        if (savedValue !== null) {
          try {
            defaultSettings[setting.id] = JSON.parse(savedValue);
          } catch {
            defaultSettings[setting.id] = savedValue;
          }
        } else {
          defaultSettings[setting.id] = setting.default;
        }
      });
      setSettings(defaultSettings);
      setHasChanges(false);
    }
  }, [plugin]);

  const handleSettingChange = (settingId: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save to localStorage
    Object.entries(settings).forEach(([key, value]) => {
      localStorage.setItem(`plugin.${plugin.id}.${key}`, JSON.stringify(value));
    });

    // Call onSave callback if provided
    if (onSave) {
      onSave(plugin.id, settings);
    }

    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    if (plugin.settings) {
      const defaultSettings: Record<string, unknown> = {};
      plugin.settings.forEach(setting => {
        defaultSettings[setting.id] = setting.default;
        localStorage.removeItem(`plugin.${plugin.id}.${setting.id}`);
      });
      setSettings(defaultSettings);
      setHasChanges(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{plugin.name} Settings</h2>
              <p className="text-sm text-blue-100">
                Configure {plugin.name} v{plugin.version}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl leading-none p-1"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!plugin.settings || plugin.settings.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">⚙️</span>
              <p className="text-gray-600 dark:text-gray-400">
                This plugin has no configurable settings.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* AI Settings Notice for AI-related plugins */}
              {(plugin.id.includes('ai-') ||
                plugin.id.includes('ml-') ||
                plugin.id.includes('chatbot') ||
                plugin.id.includes('neural') ||
                plugin.id.includes('writing-assistant') ||
                plugin.id.includes('summarizer')) && (
                <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">ℹ️</span>
                    <div>
                      <h3 className="font-semibold text-sm mb-1 text-blue-900 dark:text-blue-100">
                        AI Provider Configuration
                      </h3>
                      <p className="text-xs leading-relaxed text-blue-800 dark:text-blue-200">
                        This plugin uses AI features that require provider configuration. Please
                        configure your AI provider (OpenAI, Anthropic, Gemini, or Ollama) and API
                        credentials in the <strong>AI Assistant</strong> panel in the sidebar. The
                        settings below are plugin-specific preferences only.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {plugin.settings.map((setting, idx) => (
                <div key={`${setting.id}-${idx}`} className="space-y-2">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {setting.name}
                    </span>
                    {setting.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {setting.description}
                      </p>
                    )}
                  </label>

                  {/* String Input */}
                  {setting.type === 'string' && (
                    <input
                      type="text"
                      value={(settings[setting.id] as string) || ''}
                      onChange={e => handleSettingChange(setting.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={String(setting.default)}
                    />
                  )}

                  {/* Number Input */}
                  {setting.type === 'number' && (
                    <input
                      type="number"
                      value={(settings[setting.id] as number) || 0}
                      onChange={e => handleSettingChange(setting.id, parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}

                  {/* Boolean Toggle */}
                  {setting.type === 'boolean' && (
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={(settings[setting.id] as boolean) || false}
                          onChange={e => handleSettingChange(setting.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div
                          className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                                   peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer 
                                   dark:bg-gray-700 peer-checked:after:translate-x-full 
                                   peer-checked:after:border-white after:content-[''] after:absolute 
                                   after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 
                                   after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                                   dark:border-gray-600 peer-checked:bg-blue-600"
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {(settings[setting.id] as boolean) ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  )}

                  {/* Select Dropdown */}
                  {setting.type === 'select' && setting.options && (
                    <select
                      value={(settings[setting.id] as string) || setting.default}
                      onChange={e => handleSettingChange(setting.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {setting.options.map(option => {
                        const optionValue = typeof option === 'string' ? option : option.value;
                        const optionLabel = typeof option === 'string' ? option : option.label;
                        return (
                          <option key={String(optionValue)} value={String(optionValue)}>
                            {optionLabel}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {plugin.settings && plugin.settings.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Reset to Defaults
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg 
                           hover:from-blue-600 hover:to-purple-600 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200 font-medium shadow-lg"
                >
                  {hasChanges ? 'Save Changes' : 'Saved'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-start gap-2 text-xs text-blue-800 dark:text-blue-200">
            <span>💡</span>
            <div>
              <strong>Note:</strong> Settings are saved locally in your browser. Changes take effect
              immediately for most settings, but some may require a page reload or plugin restart.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PluginSettingsModal;
