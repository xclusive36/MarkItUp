import { PluginManifest, PluginAPI } from '../lib/types';

// Global plugin instance
let pluginInstance: ThemeCreatorPlugin | null = null;

export const themeCreatorPlugin: PluginManifest = {
  id: 'theme-creator',
  name: 'Theme Creator',
  version: '1.0.0',
  description:
    'Create and customize your own themes with visual editor, presets, and accessibility checking',
  author: 'MarkItUp Team',
  main: 'theme-creator.js',

  permissions: [
    {
      type: 'clipboard',
      description: 'Export themes to clipboard',
    },
  ],

  commands: [
    {
      id: 'open-theme-creator',
      name: 'Open Theme Creator',
      description: 'Open the visual theme creator interface',
      keybinding: 'Ctrl+Shift+T',
      callback: () => {
        if (pluginInstance) {
          pluginInstance.openThemeCreator();
        }
      },
    },
  ],

  settings: [
    {
      id: 'autoApplyThemes',
      name: 'Auto Apply Themes',
      type: 'boolean',
      default: true,
      description: 'Automatically apply themes when saved',
    },
    {
      id: 'showContrastWarnings',
      name: 'Show Contrast Warnings',
      type: 'boolean',
      default: true,
      description: 'Show warnings for poor contrast ratios',
    },
  ],

  async onLoad(api?: PluginAPI): Promise<void> {
    pluginInstance = new ThemeCreatorPlugin(api);
    await pluginInstance.onLoad();
  },

  async onUnload(): Promise<void> {
    if (pluginInstance) {
      await pluginInstance.onUnload();
      pluginInstance = null;
    }
  },
};

export class ThemeCreatorPlugin {
  private api?: PluginAPI;
  private isCreatorOpen = false;
  private onOpenCreatorCallback?: () => void;

  constructor(api?: PluginAPI) {
    this.api = api;
  }

  async onLoad(): Promise<void> {
    console.log('[ThemeCreator] Plugin loaded');
  }

  async onUnload(): Promise<void> {
    console.log('[ThemeCreator] Plugin unloaded');
  }

  /**
   * Register a callback to open the theme creator UI
   */
  registerOpenCreatorCallback(callback: () => void): void {
    this.onOpenCreatorCallback = callback;
  }

  /**
   * Open the theme creator interface
   */
  openThemeCreator(): void {
    if (this.onOpenCreatorCallback) {
      this.isCreatorOpen = true;
      this.onOpenCreatorCallback();
    } else {
      console.warn('[ThemeCreator] No creator callback registered');
    }
  }

  /**
   * Close the theme creator interface
   */
  closeThemeCreator(): void {
    this.isCreatorOpen = false;
  }

  /**
   * Check if theme creator is currently open
   */
  isOpen(): boolean {
    return this.isCreatorOpen;
  }
}

// Export plugin instance getter
export function getThemeCreatorPluginInstance(): ThemeCreatorPlugin | null {
  return pluginInstance;
}
