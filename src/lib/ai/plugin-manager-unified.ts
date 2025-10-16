// Unified AI Plugin Manager for MarkItUp PKM System
// Compatible with Phase 5 plugin architecture

import { PluginManifest, PluginAPI, Command, PluginView, ContentProcessor } from '../types';

// AI-specific extensions for plugins
export interface AIPluginMetadata extends PluginManifest {
  // AI integration capabilities
  aiIntegration?: {
    type: 'content-generation' | 'analysis' | 'enhancement' | 'automation';
    description: string;
    inputTypes: string[];
    outputTypes: string[];
  };

  // Analytics and usage tracking
  analytics?: {
    trackUsage: boolean;
    collectMetrics: string[];
  };

  // Content generation capability flag
  contentGeneration?: boolean;

  // Required permissions for AI features
  requiredPermissions?: string[];

  // Plugin state
  enabled?: boolean;
  config?: Record<string, any>;

  // Tags for categorization and search
  tags?: string[];

  // Plugin category (extended from Phase 5)
  category?:
    | 'ai-chat'
    | 'knowledge-enhancement'
    | 'automation'
    | 'analysis'
    | 'Core'
    | 'Productivity'
    | 'Utility'
    | 'AI & Learning'
    | 'Theming';
}

export interface LoadedAIPlugin {
  manifest: AIPluginMetadata;
  api: PluginAPI;
  isActive: boolean;
  config: Record<string, any>;
  commands: Map<string, Command>;
  views: Map<string, PluginView>;
  processors: Map<string, ContentProcessor>;
}

export class UnifiedAIPluginManager {
  private plugins: Map<string, LoadedAIPlugin> = new Map();
  private pluginSettings: Map<string, Record<string, any>> = new Map();
  private persistenceKey = 'markitup-ai-plugins';

  constructor() {
    this.loadPersistedState();
  }

  // Core plugin management
  async installPlugin(manifest: AIPluginMetadata): Promise<boolean> {
    try {
      if (this.plugins.has(manifest.id)) {
        console.warn(`Plugin ${manifest.id} is already installed`);
        return false;
      }

      // Validate plugin
      if (!this.validatePlugin(manifest)) {
        throw new Error(`Invalid plugin manifest: ${manifest.id}`);
      }

      // Create plugin API (simplified for AI context)
      const api = this.createPluginAPI(manifest.id);

      // Load plugin settings
      const settings = this.getPluginSettings(manifest.id);

      // Create loaded plugin instance
      const loadedPlugin: LoadedAIPlugin = {
        manifest,
        api,
        isActive: false,
        config: settings,
        commands: new Map(),
        views: new Map(),
        processors: new Map(),
      };

      // Execute onLoad if defined
      if (manifest.onLoad) {
        await manifest.onLoad();
      }

      // Register capabilities
      if (manifest.commands) {
        for (const command of manifest.commands) {
          loadedPlugin.commands.set(command.id, command);
        }
      }

      if (manifest.views) {
        for (const view of manifest.views) {
          loadedPlugin.views.set(view.id, view);
        }
      }

      if (manifest.processors) {
        for (const processor of manifest.processors) {
          loadedPlugin.processors.set(processor.id, processor);
        }
      }

      // Store and activate plugin
      this.plugins.set(manifest.id, loadedPlugin);
      loadedPlugin.isActive = true;
      manifest.enabled = true;

      // Persist state
      this.savePersistedState();

      console.log(`AI Plugin ${manifest.id} installed successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to install AI plugin ${manifest.id}:`, error);
      return false;
    }
  }

  async uninstallPlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    try {
      // Execute onUnload if defined
      if (plugin.manifest.onUnload) {
        await plugin.manifest.onUnload();
      }

      // Clear capabilities
      plugin.commands.clear();
      plugin.views.clear();
      plugin.processors.clear();

      // Mark as inactive and remove
      plugin.isActive = false;
      plugin.manifest.enabled = false;
      this.plugins.delete(pluginId);

      // Clean up settings
      this.pluginSettings.delete(pluginId);

      // Persist state
      this.savePersistedState();

      console.log(`AI Plugin ${pluginId} uninstalled successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to uninstall AI plugin ${pluginId}:`, error);
      return false;
    }
  }

  // Plugin state management
  isInstalled(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  isEnabled(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    return plugin ? plugin.isActive && plugin.manifest.enabled === true : false;
  }

  async enablePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    try {
      if (plugin.manifest.onLoad) {
        await plugin.manifest.onLoad();
      }
      plugin.isActive = true;
      plugin.manifest.enabled = true;
      this.savePersistedState();
      return true;
    } catch (error) {
      console.error(`Failed to enable plugin ${pluginId}:`, error);
      return false;
    }
  }

  async disablePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    try {
      if (plugin.manifest.onUnload) {
        await plugin.manifest.onUnload();
      }
      plugin.isActive = false;
      plugin.manifest.enabled = false;
      this.savePersistedState();
      return true;
    } catch (error) {
      console.error(`Failed to disable plugin ${pluginId}:`, error);
      return false;
    }
  }

  // Plugin discovery and information
  getInstalledPlugins(): AIPluginMetadata[] {
    return Array.from(this.plugins.values()).map(p => p.manifest);
  }

  getPlugin(pluginId: string): LoadedAIPlugin | null {
    return this.plugins.get(pluginId) || null;
  }

  getEnabledPlugins(): AIPluginMetadata[] {
    return this.getInstalledPlugins().filter(p => p.enabled);
  }

  searchPlugins(query: string): AIPluginMetadata[] {
    const searchLower = query.toLowerCase();
    return this.getInstalledPlugins().filter(
      plugin =>
        plugin.name.toLowerCase().includes(searchLower) ||
        plugin.description.toLowerCase().includes(searchLower) ||
        plugin.author.toLowerCase().includes(searchLower) ||
        (plugin.tags && plugin.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  }

  // Plugin capabilities
  getPluginsByCapability(
    capability: 'content-generation' | 'analysis' | 'enhancement' | 'automation'
  ): AIPluginMetadata[] {
    return this.getEnabledPlugins().filter(plugin => plugin.aiIntegration?.type === capability);
  }

  async executePluginCapability(pluginId: string, input: any, context?: any): Promise<any> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !plugin.isActive) {
      throw new Error(`Plugin ${pluginId} is not available`);
    }

    // For AI plugins, we can execute processors or custom capabilities
    if (plugin.processors.size > 0) {
      let result = input;
      for (const processor of plugin.processors.values()) {
        result = await processor.process(result, context);
      }
      return result;
    }

    return input; // Return unchanged if no processors
  }

  // Settings management
  getPluginSettings(pluginId: string): Record<string, any> {
    return this.pluginSettings.get(pluginId) || {};
  }

  setPluginSetting(pluginId: string, key: string, value: any): void {
    const settings = this.getPluginSettings(pluginId);
    settings[key] = value;
    this.pluginSettings.set(pluginId, settings);
    this.savePersistedState();
  }

  // Analytics and metrics
  trackPluginUsage(pluginId: string, action: string, metadata?: any): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin?.manifest.analytics?.trackUsage) {
      console.log(`Plugin Usage: ${pluginId} - ${action}`, metadata);
      // In a real implementation, this would send analytics data
    }
  }

  getPluginMetrics(pluginId: string): Record<string, any> {
    // Return usage metrics for the plugin
    return {
      usageCount: 0,
      lastUsed: null,
      // Add more metrics as needed
    };
  }

  // Private helper methods
  private validatePlugin(manifest: AIPluginMetadata): boolean {
    return !!(manifest.id && manifest.name && manifest.version && manifest.author && manifest.main);
  }

  private createPluginAPI(pluginId: string): PluginAPI {
    return {
      notes: {
        create: async (name: string, content: string, folder?: string) => {
          // Simplified implementation - would connect to actual PKM system
          console.log(`Creating note: ${name}`);
          return {} as any;
        },
        update: async (id: string, updates: any) => {
          console.log(`Updating note: ${id}`);
          return {} as any;
        },
        delete: async (id: string) => {
          console.log(`Deleting note: ${id}`);
          return true;
        },
        get: (id: string) => {
          console.log(`Getting note: ${id}`);
          return null;
        },
        getAll: () => {
          console.log('Getting all notes');
          return [];
        },
        search: (query: string) => {
          console.log(`Searching notes: ${query}`);
          return [];
        },
        getActiveNoteId: () => {
          console.log('Getting active note ID');
          return undefined;
        },
      },
      ui: {
        showNotification: (message: string, type = 'info') => {
          console.log(`[${type}] ${message}`);
        },
        showModal: async (title: string, content: any) => {
          console.log(`Modal: ${title}`);
          return Promise.resolve();
        },
        addCommand: (command: Command) => {
          const plugin = this.plugins.get(pluginId);
          if (plugin) {
            plugin.commands.set(command.id, command);
          }
        },
        addView: (view: PluginView) => {
          const plugin = this.plugins.get(pluginId);
          if (plugin) {
            plugin.views.set(view.id, view);
          }
        },
        setStatusBarText: (text: string) => {
          console.log(`Status: ${text}`);
        },
        getEditorContent: () => {
          console.log('Getting editor content');
          return '';
        },
        setEditorContent: (content: string) => {
          console.log(`Setting editor content: ${content.substring(0, 50)}...`);
        },
        openNote: (noteId: string) => {
          console.log(`Opening note: ${noteId}`);
        },
        getSelection: () => {
          console.log('Getting editor selection');
          return { text: '', start: 0, end: 0 };
        },
        replaceSelection: (text: string) => {
          console.log(`Replacing selection with: ${text}`);
        },
        getCursorPosition: () => {
          console.log('Getting cursor position');
          return 0;
        },
        setCursorPosition: (position: number) => {
          console.log(`Setting cursor position to: ${position}`);
        },
      },
      events: {
        on: (event: string, callback: (data: any) => void) => {
          console.log(`Listening to event: ${event}`);
        },
        off: (event: string, callback: (data: any) => void) => {
          console.log(`Removing listener for event: ${event}`);
        },
        emit: (event: string, data: any) => {
          console.log(`Emitting event: ${event}`, data);
        },
      },
      settings: {
        get: (key: string) => this.getPluginSettings(pluginId)[key],
        set: (key: string, value: any) => this.setPluginSetting(pluginId, key, value),
      },
    };
  }

  // Persistence
  private savePersistedState(): void {
    if (typeof window !== 'undefined') {
      const state = {
        plugins: Array.from(this.plugins.entries()).map(([id, plugin]) => ({
          id,
          manifest: plugin.manifest,
          config: plugin.config,
          isActive: plugin.isActive,
        })),
        settings: Array.from(this.pluginSettings.entries()),
      };
      localStorage.setItem(this.persistenceKey, JSON.stringify(state));
    }
  }

  private loadPersistedState(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.persistenceKey);
      if (saved) {
        try {
          const state = JSON.parse(saved);

          // Restore settings
          if (state.settings) {
            this.pluginSettings = new Map(state.settings);
          }

          // Note: Plugin manifests would need to be reinstalled/reloaded
          // This just restores the state, not the actual plugin code
          console.log('AI Plugin state loaded from localStorage');
        } catch (error) {
          console.error('Failed to load AI plugin state:', error);
        }
      }
    }
  }
}

// Export singleton instance
export const aiPluginManager = new UnifiedAIPluginManager();
