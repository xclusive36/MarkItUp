import { Plugin, PluginManifest, PluginAPI, Command, PluginView, ContentProcessor, Note } from './types';
import { PKMSystem } from './pkm';

interface UICallbacks {
  setActiveNote: (note: Note) => void;
  setMarkdown: (content: string) => void;
  setFileName: (name: string) => void;
  setFolder: (folder: string) => void;
  refreshNotes: () => Promise<void>;
}

export class PluginManager {
  private plugins: Map<string, LoadedPlugin> = new Map();
  private pkmSystem: PKMSystem;
  private pluginSettings: Map<string, Record<string, any>> = new Map();
  private eventListeners: Map<string, Array<(data: any) => void>> = new Map();
  private uiCallbacks?: UICallbacks;

  constructor(pkmSystem: PKMSystem, uiCallbacks?: UICallbacks) {
    this.pkmSystem = pkmSystem;
    this.uiCallbacks = uiCallbacks;
    this.loadPersistedSettings();
    // Don't call loadPersistedPlugins in constructor - it will be called from plugin-init.ts
  }

  // Load a plugin from a manifest
  async loadPlugin(manifest: PluginManifest): Promise<boolean> {
    try {
      // Validate plugin
      if (!this.validatePlugin(manifest)) {
        throw new Error(`Invalid plugin manifest: ${manifest.id}`);
      }

      // Check if already loaded
      if (this.plugins.has(manifest.id)) {
        throw new Error(`Plugin ${manifest.id} is already loaded`);
      }

      // Check dependencies
      if (manifest.dependencies) {
        for (const depId of manifest.dependencies) {
          if (!this.plugins.has(depId)) {
            throw new Error(`Missing dependency: ${depId}`);
          }
        }
      }

      // Create plugin API
      const api = this.createPluginAPI(manifest.id);

      // Load plugin settings
      const settings = this.getPluginSettings(manifest.id);

      // Create loaded plugin instance
      const loadedPlugin: LoadedPlugin = {
        manifest,
        api,
        settings,
        isActive: false,
        commands: new Map(),
        views: new Map(),
        processors: new Map(),
      };

      // Store plugin BEFORE registering commands so registerCommand can find it
      this.plugins.set(manifest.id, loadedPlugin);

      // Execute onLoad if defined
      if (manifest.onLoad) {
        await manifest.onLoad();
      }

      // Register commands
      if (manifest.commands) {
        console.log(`PluginManager.loadPlugin: Plugin ${manifest.id} has ${manifest.commands.length} commands in manifest`);
        for (const command of manifest.commands) {
          console.log(`PluginManager.loadPlugin: Registering command ${command.id} from plugin ${manifest.id}`);
          this.registerCommand(manifest.id, command);
        }
      } else {
        console.log(`PluginManager.loadPlugin: Plugin ${manifest.id} has no commands in manifest`);
      }

      // Register views
      if (manifest.views) {
        for (const view of manifest.views) {
          this.registerView(manifest.id, view);
        }
      }

      // Register processors
      if (manifest.processors) {
        for (const processor of manifest.processors) {
          this.registerProcessor(manifest.id, processor);
        }
      }

      // Plugin was already stored earlier, just mark as active
      loadedPlugin.isActive = true;

      // Persist the loaded plugin list
      this.persistLoadedPlugins();

      console.log(`Plugin ${manifest.id} loaded successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to load plugin ${manifest.id}:`, error);
      return false;
    }
  }

  // Unload a plugin
  async unloadPlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    try {
      // Execute onUnload if defined
      if (plugin.manifest.onUnload) {
        await plugin.manifest.onUnload();
      }

      // Unregister commands
      for (const commandId of plugin.commands.keys()) {
        this.pkmSystem.unregisterCommand(commandId);
      }

      // Unregister views and processors
      plugin.views.clear();
      plugin.processors.clear();

      // Mark as inactive and remove
      plugin.isActive = false;
      this.plugins.delete(pluginId);

      // Persist the updated plugin list
      this.persistLoadedPlugins();

      console.log(`Plugin ${pluginId} unloaded successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to unload plugin ${pluginId}:`, error);
      return false;
    }
  }

  // Get all loaded plugins
  getLoadedPlugins(): Plugin[] {
    return Array.from(this.plugins.values()).map(p => p.manifest);
  }

  // Get a specific plugin
  getPlugin(pluginId: string): LoadedPlugin | null {
    return this.plugins.get(pluginId) || null;
  }

  // Get all commands from loaded plugins
  getAllCommands(): Array<{ command: Command; pluginId: string; pluginName: string }> {
    const allCommands: Array<{ command: Command; pluginId: string; pluginName: string }> = [];
    
    console.log('PluginManager.getAllCommands: Checking', this.plugins.size, 'loaded plugins');
    console.log('PluginManager.getAllCommands: PKM system has', this.pkmSystem.getAllCommands().length, 'commands registered');
    
    for (const plugin of this.plugins.values()) {
      console.log(`PluginManager: Plugin ${plugin.manifest.id} has ${plugin.commands.size} commands`);
      for (const command of plugin.commands.values()) {
        allCommands.push({
          command,
          pluginId: plugin.manifest.id,
          pluginName: plugin.manifest.name
        });
      }
    }
    
    console.log('PluginManager.getAllCommands: Returning', allCommands.length, 'total commands');
    return allCommands;
  }

  // Process content through registered processors
  async processContent(content: string, type: string, context?: any): Promise<string> {
    let processedContent = content;

    for (const plugin of this.plugins.values()) {
      for (const processor of plugin.processors.values()) {
        if (processor.type === type) {
          try {
            processedContent = await processor.process(processedContent, context);
          } catch (error) {
            console.error(`Error processing content with ${processor.id}:`, error);
          }
        }
      }
    }

    return processedContent;
  }

  // Plugin settings management
  getPluginSettings(pluginId: string): Record<string, any> {
    return this.pluginSettings.get(pluginId) || {};
  }

  setPluginSetting(pluginId: string, key: string, value: any): void {
    const settings = this.getPluginSettings(pluginId);
    settings[key] = value;
    this.pluginSettings.set(pluginId, settings);
    
    // Persist settings (in a real implementation, this would save to disk/localStorage)
    this.persistPluginSettings();
  }

  // Event system for plugins
  emitPluginEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in plugin event listener for ${event}:`, error);
      }
    });
  }

  // Private methods
  private validatePlugin(manifest: PluginManifest): boolean {
    return !!(
      manifest.id &&
      manifest.name &&
      manifest.version &&
      manifest.author &&
      manifest.main
    );
  }

  private createPluginAPI(pluginId: string): PluginAPI {
    return {
      notes: {
        create: async (name, content, folder) => {
          // Make API call to save the file to filesystem
          const response = await fetch('/api/files', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, content, folder }),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to create note: ${response.statusText}`);
          }
          
          // Create in PKM system for immediate availability
          const note = await this.pkmSystem.createNote(name, content, folder);
          
          // Refresh the notes list in the UI
          if (this.uiCallbacks?.refreshNotes) {
            await this.uiCallbacks.refreshNotes();
          }
          
          // Set the newly created note as active
          if (this.uiCallbacks?.setActiveNote) {
            this.uiCallbacks.setActiveNote(note);
            this.uiCallbacks.setMarkdown(note.content);
            this.uiCallbacks.setFileName(note.name.replace('.md', ''));
            this.uiCallbacks.setFolder(note.folder || '');
          }
          
          return note;
        },
        update: (id, updates) => this.pkmSystem.updateNote(id, updates),
        delete: (id) => this.pkmSystem.deleteNote(id),
        get: (id) => this.pkmSystem.getNote(id),
        getAll: () => this.pkmSystem.getAllNotes(),
        search: (query) => this.pkmSystem.search(query),
      },
      ui: {
        showNotification: (message, type = 'info') => {
          // Implementation would depend on your UI framework
          console.log(`[${type}] ${message}`);
        },
        showModal: async (title, content) => {
          // Implementation for modal display
          return Promise.resolve();
        },
        addCommand: (command) => {
          this.registerCommand(pluginId, command);
        },
        addView: (view) => {
          this.registerView(pluginId, view);
        },
        setStatusBarText: (text) => {
          // Implementation for status bar
          console.log(`Status: ${text}`);
        },
      },
      events: {
        on: (event, callback) => {
          if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
          }
          this.eventListeners.get(event)!.push(callback);
        },
        off: (event, callback) => {
          const listeners = this.eventListeners.get(event);
          if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
              listeners.splice(index, 1);
            }
          }
        },
        emit: (event, data) => {
          this.emitPluginEvent(event, data);
        },
      },
      settings: {
        get: (key) => this.getPluginSettings(pluginId)[key],
        set: (key, value) => this.setPluginSetting(pluginId, key, value),
      },
    };
  }

  private registerCommand(pluginId: string, command: Command): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      console.log(`PluginManager.registerCommand: Registering command ${command.id} for plugin ${pluginId}`);
      
      // Create a new command with the plugin API bound to the callback
      const commandWithAPI: Command = {
        ...command,
        callback: () => {
          // Call the original callback with the plugin API
          return command.callback(plugin.api);
        }
      };
      
      plugin.commands.set(command.id, commandWithAPI);
      this.pkmSystem.registerCommand(commandWithAPI);
      console.log(`PluginManager.registerCommand: Plugin ${pluginId} now has ${plugin.commands.size} commands`);
    } else {
      console.warn(`PluginManager.registerCommand: Plugin ${pluginId} not found when trying to register command ${command.id}`);
    }
  }

  private registerView(pluginId: string, view: PluginView): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.views.set(view.id, view);
      // Implementation would register the view with the UI system
    }
  }

  private registerProcessor(pluginId: string, processor: ContentProcessor): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.processors.set(processor.id, processor);
    }
  }

  private persistPluginSettings(): void {
    // In a real implementation, this would save to localStorage or a file
    if (typeof window !== 'undefined') {
      localStorage.setItem('markitup-plugin-settings', JSON.stringify(Array.from(this.pluginSettings.entries())));
    }
  }

  private persistLoadedPlugins(): void {
    // Persist the list of loaded plugin IDs
    if (typeof window !== 'undefined') {
      const loadedPluginIds = Array.from(this.plugins.keys());
      localStorage.setItem('markitup-enabled-plugins', JSON.stringify(loadedPluginIds));
      console.log('Persisted loaded plugins:', loadedPluginIds);
    }
  }

  async loadPersistedPlugins(): Promise<void> {
    // Load previously enabled plugins from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('markitup-enabled-plugins');
      if (saved) {
        try {
          const pluginIds = JSON.parse(saved);
          console.log('Found persisted plugins:', pluginIds);
          
          // Import the plugin registry to get plugin manifests
          const { AVAILABLE_PLUGINS } = await import('../plugins/plugin-registry');
          
          // Load each persisted plugin without triggering persistence again
          for (const pluginId of pluginIds) {
            const plugin = AVAILABLE_PLUGINS.find(p => p.id === pluginId);
            if (plugin && !this.plugins.has(pluginId)) {
              console.log('Auto-loading persisted plugin:', pluginId);
              await this.loadPluginWithoutPersisting(plugin);
            }
          }
        } catch (error) {
          console.error('Failed to load persisted plugins:', error);
        }
      } else {
        console.log('No persisted plugins found');
      }
    }
  }

  // Debug method to clear persistence
  clearPersistedPlugins(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('markitup-enabled-plugins');
      console.log('Cleared persisted plugins from localStorage');
    }
  }

  // Internal method to load a plugin without triggering persistence (used during restoration)
  private async loadPluginWithoutPersisting(manifest: PluginManifest): Promise<boolean> {
    try {
      // Validate plugin
      if (!this.validatePlugin(manifest)) {
        throw new Error(`Invalid plugin manifest: ${manifest.id}`);
      }

      // Check if already loaded
      if (this.plugins.has(manifest.id)) {
        throw new Error(`Plugin ${manifest.id} is already loaded`);
      }

      // Check dependencies
      if (manifest.dependencies) {
        for (const depId of manifest.dependencies) {
          if (!this.plugins.has(depId)) {
            throw new Error(`Missing dependency: ${depId}`);
          }
        }
      }

      // Create plugin API
      const api = this.createPluginAPI(manifest.id);

      // Load plugin settings
      const settings = this.getPluginSettings(manifest.id);

      // Create loaded plugin instance
      const loadedPlugin: LoadedPlugin = {
        manifest,
        api,
        settings,
        isActive: false,
        commands: new Map(),
        views: new Map(),
        processors: new Map(),
      };

      // Store plugin BEFORE registering commands so registerCommand can find it
      this.plugins.set(manifest.id, loadedPlugin);

      // Execute onLoad if defined
      if (manifest.onLoad) {
        await manifest.onLoad();
      }

      // Register commands
      if (manifest.commands) {
        console.log(`PluginManager.loadPluginWithoutPersisting: Plugin ${manifest.id} has ${manifest.commands.length} commands in manifest`);
        for (const command of manifest.commands) {
          console.log(`PluginManager.loadPluginWithoutPersisting: Registering command ${command.id} from plugin ${manifest.id}`);
          this.registerCommand(manifest.id, command);
        }
      } else {
        console.log(`PluginManager.loadPluginWithoutPersisting: Plugin ${manifest.id} has no commands in manifest`);
      }

      // Register views
      if (manifest.views) {
        for (const view of manifest.views) {
          this.registerView(manifest.id, view);
        }
      }

      // Register processors
      if (manifest.processors) {
        for (const processor of manifest.processors) {
          this.registerProcessor(manifest.id, processor);
        }
      }

      // Plugin was already stored earlier, just mark as active
      loadedPlugin.isActive = true;

      // NOTE: Don't persist here to avoid circular calls during restoration

      console.log(`Plugin ${manifest.id} loaded successfully (from persistence)`);
      return true;
    } catch (error) {
      console.error(`Failed to load plugin ${manifest.id}:`, error);
      return false;
    }
  }

  private loadPersistedSettings(): void {
    // In a real implementation, this would load from localStorage or a file
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('markitup-plugin-settings');
      if (saved) {
        try {
          const entries = JSON.parse(saved);
          this.pluginSettings = new Map(entries);
        } catch (error) {
          console.error('Failed to load plugin settings:', error);
        }
      }
    }
  }
}

interface LoadedPlugin {
  manifest: PluginManifest;
  api: PluginAPI;
  settings: Record<string, any>;
  isActive: boolean;
  commands: Map<string, Command>;
  views: Map<string, PluginView>;
  processors: Map<string, ContentProcessor>;
}

// Example plugin loader from URL/file
export class PluginLoader {
  static async loadFromUrl(url: string): Promise<PluginManifest | null> {
    try {
      const response = await fetch(url);
      const manifest = await response.json();
      return manifest as PluginManifest;
    } catch (error) {
      console.error(`Failed to load plugin from ${url}:`, error);
      return null;
    }
  }

  static async loadFromFile(file: File): Promise<PluginManifest | null> {
    try {
      const text = await file.text();
      const manifest = JSON.parse(text);
      return manifest as PluginManifest;
    } catch (error) {
      console.error('Failed to load plugin from file:', error);
      return null;
    }
  }
}
