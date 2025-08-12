'use client';

import { useEffect, useState } from 'react';
import { initializePluginSystem, getPluginManager } from '@/lib/plugin-init';
import { PluginManager } from '@/lib/plugin-manager';

/**
 * Plugin System Initializer Component
 * This component automatically initializes the plugin system on the client side
 */
export function PluginSystemInitializer() {
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const pluginManager = await initializePluginSystem();
        
        if (mounted) {
          console.log(`Plugin system ready. Loaded ${pluginManager.getLoadedPlugins().length} plugins.`);
          
          // Optional: Dispatch a custom event to notify other parts of the app
          window.dispatchEvent(new CustomEvent('pluginSystemReady', {
            detail: { pluginManager }
          }));
        }
      } catch (error) {
        if (mounted) {
          console.error('Failed to initialize plugin system:', error);
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}

/**
 * Hook to get the plugin manager instance
 */
export function usePluginManager() {
  const [pluginManager, setPluginManager] = useState<PluginManager | null>(null);

  useEffect(() => {
    // Try to get existing instance
    const existing = getPluginManager();
    if (existing) {
      setPluginManager(existing);
      return;
    }

    // Listen for plugin system ready event
    const handlePluginSystemReady = (event: CustomEvent) => {
      setPluginManager(event.detail.pluginManager);
    };

    window.addEventListener('pluginSystemReady', handlePluginSystemReady as EventListener);

    return () => {
      window.removeEventListener('pluginSystemReady', handlePluginSystemReady as EventListener);
    };
  }, []);

  return pluginManager;
}
