'use client';

import { useState, useEffect } from 'react';
import { CustomTheme, PresetTheme } from '../types/theme';
import { PRESET_THEMES } from '../data/preset-themes';
import {
  applyTheme,
  saveTheme,
  loadTheme,
  deleteTheme,
  getAllThemes,
  downloadTheme,
  importTheme,
  generateThemeId,
  checkContrast,
} from '../lib/theme-utils';
import { ColorPicker } from './ColorPicker';

interface ThemeCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeCreator({ isOpen, onClose }: ThemeCreatorProps) {
  const [activeTab, setActiveTab] = useState<
    'colors' | 'typography' | 'layout' | 'presets' | 'manage'
  >('presets');
  const [currentTheme, setCurrentTheme] = useState<CustomTheme>(getDefaultTheme());
  const [savedThemes, setSavedThemes] = useState<CustomTheme[]>([]);
  const [themeName, setThemeName] = useState('My Custom Theme');
  const [showContrastChecker, setShowContrastChecker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSavedThemes(getAllThemes());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: PresetTheme | CustomTheme) => {
    const theme: CustomTheme = {
      ...preset,
      createdAt: 'createdAt' in preset ? preset.createdAt : new Date().toISOString(),
      updatedAt: 'updatedAt' in preset ? preset.updatedAt : new Date().toISOString(),
    };
    setCurrentTheme(theme);
    setThemeName(preset.name);
    applyTheme(theme);
  };

  const handleSaveTheme = () => {
    const theme: CustomTheme = {
      ...currentTheme,
      id: currentTheme.id || generateThemeId(themeName),
      name: themeName,
      author: 'You',
      description: 'Custom theme',
    };

    saveTheme(theme);
    setSavedThemes(getAllThemes());
    setCurrentTheme(theme);
    alert(`Theme "${themeName}" saved successfully!`);
  };

  const handleLoadTheme = (id: string) => {
    const theme = loadTheme(id);
    if (theme) {
      setCurrentTheme(theme);
      setThemeName(theme.name);
      applyTheme(theme);
    }
  };

  const handleDeleteTheme = (id: string) => {
    if (confirm('Are you sure you want to delete this theme?')) {
      deleteTheme(id);
      setSavedThemes(getAllThemes());
    }
  };

  const handleExportTheme = () => {
    const theme: CustomTheme = {
      ...currentTheme,
      id: currentTheme.id || generateThemeId(themeName),
      name: themeName,
    };
    downloadTheme(theme);
  };

  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const json = e.target?.result as string;
        const theme = importTheme(json);
        setCurrentTheme(theme);
        setThemeName(theme.name);
        applyTheme(theme);
        alert(`Theme "${theme.name}" imported successfully!`);
      } catch (error) {
        alert(`Failed to import theme: ${(error as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyTheme = () => {
    applyTheme(currentTheme);
    alert('Theme applied successfully!');
  };

  const updateColor = (key: keyof CustomTheme['colors'], value: string) => {
    setCurrentTheme({
      ...currentTheme,
      colors: {
        ...currentTheme.colors,
        [key]: value,
      },
    });
  };

  const contrastResult = showContrastChecker
    ? checkContrast(currentTheme.colors.textPrimary, currentTheme.colors.bgPrimary)
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Theme Creator</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Create and customize your own themes
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Theme Name Input */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <input
            type="text"
            value={themeName}
            onChange={e => setThemeName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Theme Name"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {['presets', 'colors', 'typography', 'layout', 'manage'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-6 py-3 font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Choose a Preset Theme
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {PRESET_THEMES.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {preset.name}
                      </h4>
                      {preset.popular && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {preset.description}
                    </p>
                    <div className="flex gap-2">
                      {[
                        preset.colors.bgPrimary,
                        preset.colors.accentPrimary,
                        preset.colors.accentSecondary,
                        preset.colors.successColor,
                        preset.colors.warningColor,
                      ].map((color, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="grid grid-cols-2 gap-x-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Background Colors
                </h3>
                <ColorPicker
                  label="Primary Background"
                  value={currentTheme.colors.bgPrimary}
                  onChange={v => updateColor('bgPrimary', v)}
                  description="Main background color"
                />
                <ColorPicker
                  label="Secondary Background"
                  value={currentTheme.colors.bgSecondary}
                  onChange={v => updateColor('bgSecondary', v)}
                  description="Panels and cards"
                />
                <ColorPicker
                  label="Tertiary Background"
                  value={currentTheme.colors.bgTertiary}
                  onChange={v => updateColor('bgTertiary', v)}
                  description="Hover states"
                />

                <h3 className="text-lg font-semibold mb-4 mt-6 text-gray-900 dark:text-gray-100">
                  Text Colors
                </h3>
                <ColorPicker
                  label="Primary Text"
                  value={currentTheme.colors.textPrimary}
                  onChange={v => updateColor('textPrimary', v)}
                  description="Main text color"
                />
                <ColorPicker
                  label="Secondary Text"
                  value={currentTheme.colors.textSecondary}
                  onChange={v => updateColor('textSecondary', v)}
                  description="Subtitles and labels"
                />
                <ColorPicker
                  label="Muted Text"
                  value={currentTheme.colors.textMuted}
                  onChange={v => updateColor('textMuted', v)}
                  description="Disabled text"
                />

                <h3 className="text-lg font-semibold mb-4 mt-6 text-gray-900 dark:text-gray-100">
                  Accent Colors
                </h3>
                <ColorPicker
                  label="Primary Accent"
                  value={currentTheme.colors.accentPrimary}
                  onChange={v => updateColor('accentPrimary', v)}
                  description="Links and highlights"
                />
                <ColorPicker
                  label="Secondary Accent"
                  value={currentTheme.colors.accentSecondary}
                  onChange={v => updateColor('accentSecondary', v)}
                  description="Alternative accents"
                />
                <ColorPicker
                  label="Accent Hover"
                  value={currentTheme.colors.accentHover}
                  onChange={v => updateColor('accentHover', v)}
                  description="Hover state"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Status Colors
                </h3>
                <ColorPicker
                  label="Success"
                  value={currentTheme.colors.successColor}
                  onChange={v => updateColor('successColor', v)}
                  description="Success messages"
                />
                <ColorPicker
                  label="Warning"
                  value={currentTheme.colors.warningColor}
                  onChange={v => updateColor('warningColor', v)}
                  description="Warning messages"
                />
                <ColorPicker
                  label="Error"
                  value={currentTheme.colors.errorColor}
                  onChange={v => updateColor('errorColor', v)}
                  description="Error messages"
                />
                <ColorPicker
                  label="Info"
                  value={currentTheme.colors.infoColor}
                  onChange={v => updateColor('infoColor', v)}
                  description="Info messages"
                />

                <h3 className="text-lg font-semibold mb-4 mt-6 text-gray-900 dark:text-gray-100">
                  Syntax Highlighting
                </h3>
                <ColorPicker
                  label="Keywords"
                  value={currentTheme.colors.syntaxKeyword}
                  onChange={v => updateColor('syntaxKeyword', v)}
                />
                <ColorPicker
                  label="Strings"
                  value={currentTheme.colors.syntaxString}
                  onChange={v => updateColor('syntaxString', v)}
                />
                <ColorPicker
                  label="Comments"
                  value={currentTheme.colors.syntaxComment}
                  onChange={v => updateColor('syntaxComment', v)}
                />
                <ColorPicker
                  label="Numbers"
                  value={currentTheme.colors.syntaxNumber}
                  onChange={v => updateColor('syntaxNumber', v)}
                />
                <ColorPicker
                  label="Functions"
                  value={currentTheme.colors.syntaxFunction}
                  onChange={v => updateColor('syntaxFunction', v)}
                />
                <ColorPicker
                  label="Variables"
                  value={currentTheme.colors.syntaxVariable}
                  onChange={v => updateColor('syntaxVariable', v)}
                />

                {/* Contrast Checker */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <button
                    onClick={() => setShowContrastChecker(!showContrastChecker)}
                    className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
                  >
                    {showContrastChecker ? '▼' : '▶'} Contrast Checker
                  </button>
                  {showContrastChecker && contrastResult && (
                    <div className="mt-2 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        Ratio: {contrastResult.ratio}:1
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        WCAG AA: {contrastResult.wcagAA ? '✓ Pass' : '✗ Fail'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        WCAG AAA: {contrastResult.wcagAAA ? '✓ Pass' : '✗ Fail'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Rating: {contrastResult.rating}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === 'typography' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Typography Settings
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Base Font Family
                </label>
                <input
                  type="text"
                  value={currentTheme.typography.fontFamilyBase}
                  onChange={e =>
                    setCurrentTheme({
                      ...currentTheme,
                      typography: {
                        ...currentTheme.typography,
                        fontFamilyBase: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Heading Font Family
                </label>
                <input
                  type="text"
                  value={currentTheme.typography.fontFamilyHeading}
                  onChange={e =>
                    setCurrentTheme({
                      ...currentTheme,
                      typography: {
                        ...currentTheme.typography,
                        fontFamilyHeading: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Monospace Font Family
                </label>
                <input
                  type="text"
                  value={currentTheme.typography.fontFamilyMono}
                  onChange={e =>
                    setCurrentTheme({
                      ...currentTheme,
                      typography: {
                        ...currentTheme.typography,
                        fontFamilyMono: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Base Font Size: {currentTheme.typography.fontSizeBase}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="18"
                  value={currentTheme.typography.fontSizeBase}
                  onChange={e =>
                    setCurrentTheme({
                      ...currentTheme,
                      typography: {
                        ...currentTheme.typography,
                        fontSizeBase: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Line Height: {currentTheme.typography.lineHeight}
                </label>
                <input
                  type="range"
                  min="1.2"
                  max="2.0"
                  step="0.1"
                  value={currentTheme.typography.lineHeight}
                  onChange={e =>
                    setCurrentTheme({
                      ...currentTheme,
                      typography: {
                        ...currentTheme.typography,
                        lineHeight: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Letter Spacing: {currentTheme.typography.letterSpacing}px
                </label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={currentTheme.typography.letterSpacing}
                  onChange={e =>
                    setCurrentTheme({
                      ...currentTheme,
                      typography: {
                        ...currentTheme.typography,
                        letterSpacing: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Layout Settings
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Border Radius: {currentTheme.layout.borderRadius}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="16"
                  value={currentTheme.layout.borderRadius}
                  onChange={e =>
                    setCurrentTheme({
                      ...currentTheme,
                      layout: {
                        ...currentTheme.layout,
                        borderRadius: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Shadow Intensity
                </label>
                <select
                  value={currentTheme.layout.shadowIntensity}
                  onChange={e =>
                    setCurrentTheme({
                      ...currentTheme,
                      layout: {
                        ...currentTheme.layout,
                        shadowIntensity: e.target.value as 'none' | 'subtle' | 'medium' | 'strong',
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="none">None</option>
                  <option value="subtle">Subtle</option>
                  <option value="medium">Medium</option>
                  <option value="strong">Strong</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Padding Scale: {currentTheme.layout.paddingScale}
                </label>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.1"
                  value={currentTheme.layout.paddingScale}
                  onChange={e =>
                    setCurrentTheme({
                      ...currentTheme,
                      layout: {
                        ...currentTheme.layout,
                        paddingScale: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Manage Tab */}
          {activeTab === 'manage' && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Saved Themes
              </h3>

              {savedThemes.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No saved themes yet.</p>
              ) : (
                <div className="grid gap-3">
                  {savedThemes.map(theme => (
                    <div
                      key={theme.id}
                      className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {theme.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {theme.mode} theme by {theme.author}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadTheme(theme.id)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteTheme(theme.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleExportTheme}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md transition-colors"
            >
              Export
            </button>
            <label className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md transition-colors cursor-pointer">
              Import
              <input type="file" accept=".json" onChange={handleImportTheme} className="hidden" />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApplyTheme}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
            >
              Apply Theme
            </button>
            <button
              onClick={handleSaveTheme}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              Save Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDefaultTheme(): CustomTheme {
  return {
    id: '',
    name: 'Custom Theme',
    author: 'You',
    description: 'A custom theme',
    mode: 'dark',
    colors: {
      bgPrimary: '#1a1b26',
      bgSecondary: '#16161e',
      bgTertiary: '#24283b',
      textPrimary: '#c0caf5',
      textSecondary: '#a9b1d6',
      textMuted: '#565f89',
      accentPrimary: '#7aa2f7',
      accentSecondary: '#bb9af7',
      accentHover: '#92b9ff',
      borderPrimary: '#414868',
      borderSecondary: '#343b58',
      borderFocus: '#7aa2f7',
      sidebarBg: '#24283b',
      sidebarText: '#c0caf5',
      toolbarBg: '#16161e',
      toolbarText: '#c0caf5',
      linkColor: '#7aa2f7',
      linkHover: '#92b9ff',
      buttonBg: '#7aa2f7',
      buttonText: '#1a1b26',
      buttonHover: '#92b9ff',
      syntaxKeyword: '#bb9af7',
      syntaxString: '#9ece6a',
      syntaxComment: '#565f89',
      syntaxNumber: '#ff9e64',
      syntaxFunction: '#7aa2f7',
      syntaxVariable: '#c0caf5',
      successColor: '#9ece6a',
      warningColor: '#e0af68',
      errorColor: '#f7768e',
      infoColor: '#7dcfff',
    },
    typography: {
      fontFamilyBase: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontFamilyHeading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontFamilyMono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
      fontSizeBase: 14,
      lineHeight: 1.6,
      letterSpacing: 0,
    },
    layout: {
      borderRadius: 5,
      shadowIntensity: 'medium',
      paddingScale: 1.0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
