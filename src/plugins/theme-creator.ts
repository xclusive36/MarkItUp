import { PluginManifest, PluginAPI } from '../lib/types';

// Global plugin instance
let pluginInstance: ThemeCreatorPlugin | null = null;

export const themeCreatorPlugin: PluginManifest = {
  id: 'theme-creator',
  name: 'Theme Creator',
  version: '2.0.0',
  description:
    'Create and customize themes with live preview, undo/redo, and accessibility checking. NEW in v2.0: Real-time preview panel, full undo/redo system, smooth toast notifications, contrast analysis',
  author: 'MarkItUp Team',
  main: 'theme-creator.js',
  documentation: `# Theme Creator Plugin

## Overview
Design custom color themes for MarkItUp with live preview and accessibility checking.

## How to Use

### Opening the Theme Creator
- Press **Ctrl+Shift+T** (or **Cmd+Shift+T** on Mac)
- Or use Command Palette → "Open Theme Creator"

### Creating a Theme

1. **Choose Base Colors**:
   - Background colors (primary, secondary, tertiary)
   - Text colors (primary, secondary, tertiary)
   - Accent color for interactive elements
   - Border colors

2. **Live Preview**:
   - See changes in real-time in the preview panel
   - Test with sample content to ensure readability

3. **Accessibility Check**:
   - Built-in contrast checker (WCAG AAA compliant)
   - Warnings for insufficient contrast ratios
   - Ensures text is readable on backgrounds

4. **Save & Apply**:
   - Save theme with a custom name
   - Auto-apply if enabled in settings
   - Export to share with others

### Undo/Redo
- **Ctrl+Z / Cmd+Z**: Undo color changes
- **Ctrl+Shift+Z / Cmd+Shift+Z**: Redo

### Settings

- **Auto Apply Themes**: Automatically activate themes when saved
- **Show Contrast Warnings**: Display accessibility warnings

## Tips

- Start with a base theme (light or dark)
- Maintain sufficient contrast (4.5:1 minimum for normal text)
- Test with actual notes to verify readability
- Use the preview panel to see changes before saving
- Export themes to share with your team`,

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
  // private api?: PluginAPI; // Not currently used
  private isCreatorOpen = false;
  private onOpenCreatorCallback?: () => void;

  constructor(_api?: PluginAPI) {
    // this.api = api; // Not currently used
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
