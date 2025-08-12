import { PluginManager } from './plugin-manager';
import { PKMSystem } from './pkm';
import { AVAILABLE_PLUGINS } from '../plugins/plugin-registry';

let pluginManagerInstance: PluginManager | null = null;

/**
 * Initialize the plugin system and auto-load enabled plugins
 */
export async function initializePluginSystem(): Promise<PluginManager> {
  if (pluginManagerInstance) {
    return pluginManagerInstance;
  }

  // Create PKM system (this might need to be passed in from your app)
  const pkmSystem = new PKMSystem();
  
  // Create plugin manager
  pluginManagerInstance = new PluginManager(pkmSystem);
  
  // Enhance plugin manager with registry access
  enhancePluginManagerWithRegistry(pluginManagerInstance);
  
  // Load persisted plugins first
  await (pluginManagerInstance as any).loadPersistedPlugins();
  
  // Don't auto-load all plugins - only load what's persisted
  console.log('Plugin system initialized with persisted plugins');
  
  console.log('Plugin system initialized');
  return pluginManagerInstance;
}

/**
 * Get the current plugin manager instance
 */
export function getPluginManager(): PluginManager | null {
  return pluginManagerInstance;
}

/**
 * Enhance plugin manager with registry methods
 */
function enhancePluginManagerWithRegistry(manager: PluginManager) {
  // Override getAvailablePlugins to return plugins from registry
  (manager as any).getAvailablePlugins = () => AVAILABLE_PLUGINS;
  
  // Override loadPluginById to load plugin by ID from registry
  (manager as any).loadPluginById = async (pluginId: string) => {
    const plugin = AVAILABLE_PLUGINS.find(p => p.id === pluginId);
    if (plugin) {
      return await manager.loadPlugin(plugin);
    }
    return false;
  };

  // Add loadEnabledPluginsFromRegistry method
  (manager as any).loadEnabledPluginsFromRegistry = async (plugins: any[]) => {
    // For now, just load all available plugins
    for (const plugin of plugins) {
      try {
        await manager.loadPlugin(plugin);
      } catch (error) {
        console.warn(`Failed to load plugin ${plugin.id}:`, error);
      }
    }
  };
}

/**
 * Auto-initialize plugin system when DOM is ready (for browser environments)
 * DISABLED: Let components initialize the plugin system on-demand
 */
// if (typeof window !== 'undefined') {
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => {
//       initializePluginSystem().catch(console.error);
//     });
//   } else {
//     // DOM is already ready
//     initializePluginSystem().catch(console.error);
//   }
// }
