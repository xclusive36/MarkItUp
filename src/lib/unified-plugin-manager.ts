// Unified Plugin Manager for MarkItUp PKM System
// Consolidates both regular plugins and AI plugins into a single system

import { PluginManifest, PluginAPI, Command, PluginView, ContentProcessor, Note } from './types';
import { PKMSystem } from './pkm';
import { analytics } from './analytics';
import { PluginSandbox, validatePluginPermissions } from './plugin-sandbox';
import { getPluginStorage } from './plugin-storage';

// Enhanced plugin manifest that supports both regular and AI plugins
export interface UnifiedPluginManifest extends PluginManifest {
  // AI-specific extensions (optional)
  aiIntegration?: {
    type: 'content-generation' | 'analysis' | 'enhancement' | 'automation';
    description: string;
    inputTypes: string[];
    outputTypes: string[];
    requiresApiKey?: boolean;
    supportedProviders?: string[];
    minTokens?: number;
  };

  // Enhanced metadata
  category?: string;
  tags?: string[];
  rating?: number;
  downloads?: number;
  pricing?: 'free' | 'freemium' | 'paid';
  license?: string;
  homepage?: string;
  repository?: string;

  // Plugin capabilities
  capabilities?: {
    chat?: boolean;
    generation?: boolean;
    analysis?: boolean;
    automation?: boolean;
    visualization?: boolean;
    realtime?: boolean;
  };

  // Enhanced settings with UI metadata
  enhancedSettings?: Record<
    string,
    {
      type: 'text' | 'password' | 'number' | 'boolean' | 'select' | 'apikey';
      label?: string;
      description?: string;
      required?: boolean;
      default?: any;
      placeholder?: string;
      options?: Array<{ value: string; label: string }>;
    }
  >;
}

export interface LoadedUnifiedPlugin {
  manifest: UnifiedPluginManifest;
  api: PluginAPI;
  sandbox?: PluginSandbox; // Security sandbox for permission enforcement
  isActive: boolean;
  isAIPlugin: boolean;
  settings: Record<string, any>;
  commands: Map<string, Command>;
  views: Map<string, PluginView>;
  processors: Map<string, ContentProcessor>;
  health: {
    status: 'healthy' | 'warning' | 'error';
    lastExecuted?: Date;
    executionCount: number;
    errorCount: number;
    lastError?: string;
  };
  metrics: {
    usageCount: number;
    lastUsed?: Date;
    averageExecutionTime: number;
  };
}

export class UnifiedPluginManager {
  private plugins: Map<string, LoadedUnifiedPlugin> = new Map();
  private pkmSystem: PKMSystem;
  private pluginSettings: Map<string, Record<string, any>> = new Map();
  private eventListeners: Map<string, Array<(data: any) => void>> = new Map();
  private apiKeyManager: Map<string, string> = new Map();

  constructor(pkmSystem: PKMSystem) {
    this.pkmSystem = pkmSystem;
    // Settings will be loaded from IndexedDB on first access
  }

  // =====================================================
  // UNIFIED PLUGIN MANAGEMENT
  // =====================================================

  async loadPlugin(manifest: UnifiedPluginManifest): Promise<boolean> {
    try {
      if (!this.validatePlugin(manifest)) {
        throw new Error(`Invalid plugin manifest: ${manifest.id}`);
      }

      if (this.plugins.has(manifest.id)) {
        throw new Error(`Plugin ${manifest.id} is already loaded`);
      }

      // Validate permissions
      if (manifest.permissions) {
        const validation = validatePluginPermissions(manifest.permissions);
        if (validation.warnings.length > 0) {
          console.warn(`Plugin ${manifest.id} permission warnings:`, validation.warnings);
        }
      }

      // Check AI requirements
      if (manifest.aiIntegration?.requiresApiKey) {
        const apiKey = this.getApiKey(manifest.aiIntegration.supportedProviders?.[0] || 'openai');
        if (!apiKey) {
          console.warn(`Plugin ${manifest.id} requires API key but none is configured`);
        }
      }

      // Create plugin API with AI extensions
      const fullAPI = this.createUnifiedPluginAPI(manifest.id);

      // Create sandbox if plugin has permissions
      let sandboxedAPI = fullAPI;
      let sandbox: PluginSandbox | undefined;

      if (manifest.permissions && manifest.permissions.length > 0) {
        sandbox = new PluginSandbox(
          manifest.permissions,
          manifest.id,
          process.env.NODE_ENV === 'production' // Strict mode in production
        );
        sandboxedAPI = sandbox.createSandboxedAPI(fullAPI);
        console.log(`[UnifiedPluginManager] Created sandbox for ${manifest.id}`);
      }

      const settings = this.getPluginSettings(manifest.id);

      const loadedPlugin: LoadedUnifiedPlugin = {
        manifest,
        api: sandboxedAPI, // Use sandboxed API
        sandbox, // Store sandbox for inspection
        isActive: false,
        isAIPlugin: !!manifest.aiIntegration,
        settings,
        commands: new Map(),
        views: new Map(),
        processors: new Map(),
        health: {
          status: 'healthy',
          executionCount: 0,
          errorCount: 0,
        },
        metrics: {
          usageCount: 0,
          averageExecutionTime: 0,
        },
      };

      // Register commands, views, processors
      if (manifest.commands) {
        for (const command of manifest.commands) {
          loadedPlugin.commands.set(command.id, command);
        }
      }

      this.plugins.set(manifest.id, loadedPlugin);

      // Execute onLoad if defined
      if (manifest.onLoad) {
        await manifest.onLoad();
      }

      await this.savePersistedSettings();
      analytics.trackEvent('mode_switched', {
        view: 'plugin_loaded',
        pluginId: manifest.id,
        isAI: !!manifest.aiIntegration,
      });

      console.log(`Plugin ${manifest.id} loaded successfully (AI: ${!!manifest.aiIntegration})`);
      return true;
    } catch (error) {
      console.error(`Failed to load plugin ${manifest.id}:`, error);
      return false;
    }
  }

  async unloadPlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    try {
      // Execute onUnload if defined
      if (plugin.manifest.onUnload) {
        await plugin.manifest.onUnload();
      }

      this.plugins.delete(pluginId);
      this.savePersistedSettings();

      analytics.trackEvent('mode_switched', {
        view: 'plugin_unloaded',
        pluginId,
        isAI: plugin.isAIPlugin,
      });
      return true;
    } catch (error) {
      console.error(`Failed to unload plugin ${pluginId}:`, error);
      return false;
    }
  }

  // =====================================================
  // PLUGIN DISCOVERY & FILTERING
  // =====================================================

  getLoadedPlugins(): LoadedUnifiedPlugin[] {
    return Array.from(this.plugins.values());
  }

  getRegularPlugins(): LoadedUnifiedPlugin[] {
    return this.getLoadedPlugins().filter(p => !p.isAIPlugin);
  }

  getAIPlugins(): LoadedUnifiedPlugin[] {
    return this.getLoadedPlugins().filter(p => p.isAIPlugin);
  }

  getPluginsByCategory(category: string): LoadedUnifiedPlugin[] {
    return this.getLoadedPlugins().filter(p => p.manifest.category === category);
  }

  getPluginsByCapability(capability: string): LoadedUnifiedPlugin[] {
    return this.getLoadedPlugins().filter(
      p => p.manifest.capabilities?.[capability as keyof typeof p.manifest.capabilities] === true
    );
  }

  searchPlugins(query: string): LoadedUnifiedPlugin[] {
    const searchLower = query.toLowerCase();
    return this.getLoadedPlugins().filter(
      plugin =>
        plugin.manifest.name.toLowerCase().includes(searchLower) ||
        plugin.manifest.description.toLowerCase().includes(searchLower) ||
        plugin.manifest.author.toLowerCase().includes(searchLower) ||
        (plugin.manifest.tags &&
          plugin.manifest.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  }

  // =====================================================
  // AI-SPECIFIC FUNCTIONALITY
  // =====================================================

  async executeAICapability(
    pluginId: string,
    action: string,
    input: any,
    context?: any
  ): Promise<any> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !plugin.isAIPlugin) {
      throw new Error(`AI plugin ${pluginId} not found`);
    }

    try {
      const startTime = Date.now();

      // Execute AI capability through the plugin's API
      const result = await this.callPluginMethod(pluginId, action, input, context);

      // Update metrics
      const executionTime = Date.now() - startTime;
      plugin.metrics.usageCount++;
      plugin.metrics.lastUsed = new Date();
      plugin.metrics.averageExecutionTime =
        (plugin.metrics.averageExecutionTime + executionTime) / 2;

      plugin.health.executionCount++;
      plugin.health.lastExecuted = new Date();

      analytics.trackEvent('ai_analysis', {
        action: 'ai_plugin_executed',
        pluginId,
        executionTime,
      });

      return result;
    } catch (error) {
      plugin.health.errorCount++;
      plugin.health.lastError = error instanceof Error ? error.message : 'Unknown error';
      plugin.health.status = 'error';

      console.error(`AI plugin execution failed for ${pluginId}:`, error);
      throw error;
    }
  }

  // =====================================================
  // API KEY MANAGEMENT
  // ===== API KEY MANAGEMENT =====

  async setApiKey(provider: string, apiKey: string): Promise<void> {
    this.apiKeyManager.set(provider, apiKey);
    const storage = await getPluginStorage();
    await storage.saveApiKey(provider, apiKey);
  }

  getApiKey(provider: string): string | undefined {
    // Synchronous access from memory cache
    return this.apiKeyManager.get(provider);
  }

  async getApiKeyAsync(provider: string): Promise<string | undefined> {
    // Check memory cache first
    if (this.apiKeyManager.has(provider)) {
      return this.apiKeyManager.get(provider);
    }

    // Load from IndexedDB
    const storage = await getPluginStorage();
    const apiKey = await storage.loadApiKey(provider);
    if (apiKey) {
      this.apiKeyManager.set(provider, apiKey);
      return apiKey;
    }

    return undefined;
  }

  async removeApiKey(provider: string): Promise<void> {
    this.apiKeyManager.delete(provider);
    const storage = await getPluginStorage();
    await storage.deleteApiKey(provider);
  }

  // =====================================================
  // ENHANCED PLUGIN API
  // =====================================================

  private createUnifiedPluginAPI(pluginId: string): PluginAPI {
    const plugin = this.plugins.get(pluginId);
    const isAI = plugin?.isAIPlugin || false;

    return {
      // Standard plugin API
      notes: {
        get: (id: string) => {
          // For sync compatibility, return cached note or null
          const cachedNotes = this.pkmSystem.getAllNotes();
          return cachedNotes.find(note => note.id === id) || null;
        },
        getAll: () => this.pkmSystem.getAllNotes(),
        create: async (content: string, title?: string) => {
          return this.pkmSystem.createNote(title || 'Untitled', content);
        },
        update: async (id: string, updates: Partial<Note>) =>
          this.pkmSystem.updateNote(id, updates),
        delete: async (id: string) => this.pkmSystem.deleteNote(id),
        search: (query: string) => this.pkmSystem.search(query),
        getActiveNoteId: () => {
          return this.pkmSystem.viewState?.activeNoteId;
        },
      },

      // AI extensions (only available for AI plugins)
      ...(isAI && {
        ai: {
          analyzeContent: async (_content: string, _noteId?: string) => {
            // Parameters unused in stub
            const apiKey = this.getApiKey('openai');
            if (!apiKey) {
              throw new Error('AI API key not configured');
            }
            // Return mock data for plugin compatibility
            return {
              summary: 'Content analysis placeholder',
              keyTopics: [],
              suggestedTags: [],
              suggestedConnections: [],
              sentiment: 'neutral' as const,
              complexity: 0,
              readabilityScore: 0,
            };
          },
          isAvailable: () => {
            return (
              !!this.getApiKey('openai') ||
              !!this.getApiKey('anthropic') ||
              !!this.getApiKey('gemini')
            );
          },
          getProvider: () => {
            if (this.getApiKey('openai')) return 'openai';
            if (this.getApiKey('anthropic')) return 'anthropic';
            if (this.getApiKey('gemini')) return 'gemini';
            return 'none';
          },
        },
      }),

      ui: {
        showNotification: (message: string, type?: string) => {
          console.log(`[Notification ${type || 'info'}]:`, message);
          // Use event listeners directly since we can't reference events API here
          const listeners = this.eventListeners.get('notification');
          if (listeners) {
            listeners.forEach(callback => callback({ message, type }));
          }
        },
        showModal: async (title: string, content: any) => {
          console.log('Show modal:', title);
          const listeners = this.eventListeners.get('modal');
          if (listeners) {
            listeners.forEach(callback => callback({ title, content }));
          }
        },
        addCommand: (command: Command) => {
          console.log('Add command:', command.id);
          const listeners = this.eventListeners.get('command');
          if (listeners) {
            listeners.forEach(callback => callback(command));
          }
        },
        addView: (view: PluginView) => {
          console.log('Add view:', view.id);
          const listeners = this.eventListeners.get('view');
          if (listeners) {
            listeners.forEach(callback => callback(view));
          }
        },
        setStatusBarText: (text: string) => {
          console.log('Status bar:', text);
          const listeners = this.eventListeners.get('status-bar');
          if (listeners) {
            listeners.forEach(callback => callback({ text }));
          }
        },
        getEditorContent: () => {
          console.log('Getting editor content');
          return '';
        },
        setEditorContent: (content: string) => {
          console.log('Setting editor content:', content.substring(0, 50));
        },
        openNote: (noteId: string) => {
          console.log('Opening note:', noteId);
        },
        getSelection: () => {
          console.log('Getting editor selection');
          return { text: '', start: 0, end: 0 };
        },
        replaceSelection: (text: string) => {
          console.log('Replacing selection with:', text);
        },
        getCursorPosition: () => {
          console.log('Getting cursor position');
          return 0;
        },
        setCursorPosition: (position: number) => {
          console.log('Setting cursor position to:', position);
        },
      },

      events: {
        on: (event: string, callback: (data: any) => void) => {
          if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
          }
          this.eventListeners.get(event)!.push(callback);
        },
        off: (event: string, callback: (data: any) => void) => {
          const listeners = this.eventListeners.get(event);
          if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
              listeners.splice(index, 1);
            }
          }
        },
        emit: (event: string, data: any) => {
          const listeners = this.eventListeners.get(event);
          if (listeners) {
            listeners.forEach(callback => callback(data));
          }
        },
      },

      settings: {
        get: async (key: string) => {
          const settings = await this.getPluginSettings(pluginId);
          return settings[key];
        },
        set: async (key: string, value: any) => {
          const settings = await this.getPluginSettings(pluginId);
          settings[key] = value;
          this.pluginSettings.set(pluginId, settings);
          await this.savePersistedSettings();
        },
      },
    };
  }

  // =====================================================
  // HEALTH & ANALYTICS
  // =====================================================

  getPluginHealth(pluginId: string): LoadedUnifiedPlugin['health'] | null {
    return this.plugins.get(pluginId)?.health || null;
  }

  getPluginMetrics(pluginId: string): LoadedUnifiedPlugin['metrics'] | null {
    return this.plugins.get(pluginId)?.metrics || null;
  }

  getSystemStats() {
    const plugins = this.getLoadedPlugins();
    const aiPlugins = this.getAIPlugins();
    const regularPlugins = this.getRegularPlugins();

    return {
      totalPlugins: plugins.length,
      aiPlugins: aiPlugins.length,
      regularPlugins: regularPlugins.length,
      activePlugins: plugins.filter(p => p.isActive).length,
      healthyPlugins: plugins.filter(p => p.health.status === 'healthy').length,
      pluginsWithErrors: plugins.filter(p => p.health.status === 'error').length,
      pluginsWithWarnings: plugins.filter(p => p.health.status === 'warning').length,
      totalExecutions: plugins.reduce((sum, p) => sum + p.health.executionCount, 0),
      totalErrors: plugins.reduce((sum, p) => sum + p.health.errorCount, 0),
    };
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private validatePlugin(manifest: UnifiedPluginManifest): boolean {
    if (!manifest.id || !manifest.name || !manifest.version || !manifest.main) {
      return false;
    }
    return true;
  }

  private async callPluginMethod(pluginId: string, method: string, ..._args: any[]): Promise<any> {
    // args parameter unused
    // Implementation for calling plugin methods would go here
    return Promise.resolve(`Method ${method} called on plugin ${pluginId}`);
  }

  private async getPluginSettings(pluginId: string): Promise<Record<string, any>> {
    // Check memory cache
    if (this.pluginSettings.has(pluginId)) {
      return this.pluginSettings.get(pluginId)!;
    }

    // Load from IndexedDB
    try {
      const storage = await getPluginStorage();
      const settings = await storage.loadSettings(pluginId);
      if (settings) {
        this.pluginSettings.set(pluginId, settings);
        return settings;
      }
    } catch (error) {
      console.error(`Failed to load settings for ${pluginId}:`, error);
    }

    return {};
  }

  // private async loadPersistedSettings(): Promise<void> { // Commented out: method not used
  //   try {
  //     const storage = await getPluginStorage();
  //     const allSettings = await storage.getAllSettings();
  //     this.pluginSettings = allSettings;

  //     // Load API keys into memory
  //     const providers = await storage.getAllApiKeyProviders();
  //     for (const provider of providers) {
  //       const apiKey = await storage.loadApiKey(provider);
  //       if (apiKey) {
  //         this.apiKeyManager.set(provider, apiKey);
  //       }
  //     }

  //     console.log('[UnifiedPluginManager] Loaded settings from IndexedDB');
  //   } catch (error) {
  //     console.error('Failed to load persisted plugin settings:', error);
  //   }
  // }

  private async savePersistedSettings(): Promise<void> {
    try {
      const storage = await getPluginStorage();

      // Save all plugin settings
      for (const [pluginId, settings] of this.pluginSettings.entries()) {
        await storage.saveSettings(pluginId, settings);
      }

      console.log('[UnifiedPluginManager] Settings saved to IndexedDB');
    } catch (error) {
      console.error('Failed to save plugin settings:', error);
    }
  }
}

// Export singleton instance factory
export function createUnifiedPluginManager(pkmSystem: PKMSystem): UnifiedPluginManager {
  return new UnifiedPluginManager(pkmSystem);
}
