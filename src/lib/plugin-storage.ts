/**
 * Plugin Storage - IndexedDB-based storage for plugin settings
 *
 * Replaces localStorage with IndexedDB for better performance,
 * larger storage capacity, and structured data storage.
 *
 * @example
 * ```typescript
 * const storage = await PluginStorage.getInstance();
 * await storage.saveSettings('my-plugin', { theme: 'dark' });
 * const settings = await storage.loadSettings('my-plugin');
 * ```
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PluginDB extends DBSchema {
  settings: {
    key: string;
    value: {
      pluginId: string;
      settings: Record<string, any>;
      updatedAt: number;
      version?: number;
    };
    indexes: { updatedAt: number };
  };
  apiKeys: {
    key: string;
    value: {
      provider: string;
      apiKey: string;
      encryptedAt: number;
    };
    indexes: { encryptedAt: number };
  };
  cache: {
    key: string;
    value: {
      key: string;
      data: any;
      expiresAt?: number;
      createdAt: number;
    };
    indexes: { expiresAt: number; createdAt: number };
  };
}

export class PluginStorage {
  private static instance: PluginStorage;
  private db: IDBPDatabase<PluginDB> | null = null;
  private initPromise: Promise<void> | null = null;
  private readonly DB_NAME = 'markitup-plugin-storage';
  private readonly DB_VERSION = 1;

  private constructor() {
    // Private constructor for singleton
  }

  static async getInstance(): Promise<PluginStorage> {
    if (!PluginStorage.instance) {
      PluginStorage.instance = new PluginStorage();
      await PluginStorage.instance.init();
    }
    return PluginStorage.instance;
  }

  /**
   * Initialize the IndexedDB database
   */
  private async init(): Promise<void> {
    // Prevent multiple initializations
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        this.db = await openDB<PluginDB>(this.DB_NAME, this.DB_VERSION, {
          upgrade(db, oldVersion, newVersion, transaction) {
            console.log('[PluginStorage] Upgrading database from', oldVersion, 'to', newVersion);

            // Create object stores if they don't exist
            if (!db.objectStoreNames.contains('settings')) {
              const settingsStore = db.createObjectStore('settings', { keyPath: 'pluginId' });
              settingsStore.createIndex('updatedAt', 'updatedAt');
            }

            if (!db.objectStoreNames.contains('apiKeys')) {
              const apiKeysStore = db.createObjectStore('apiKeys', { keyPath: 'provider' });
              apiKeysStore.createIndex('encryptedAt', 'encryptedAt');
            }

            if (!db.objectStoreNames.contains('cache')) {
              const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
              cacheStore.createIndex('expiresAt', 'expiresAt');
              cacheStore.createIndex('createdAt', 'createdAt');
            }
          },
          blocked() {
            console.warn('[PluginStorage] Database upgrade blocked by another tab');
          },
          blocking() {
            console.warn('[PluginStorage] This tab is blocking a database upgrade');
          },
          terminated() {
            console.error('[PluginStorage] Database connection terminated unexpectedly');
          },
        });

        console.log('[PluginStorage] Database initialized successfully');

        // Migrate data from localStorage if it exists
        await this.migrateFromLocalStorage();
      } catch (error) {
        console.error('[PluginStorage] Failed to initialize database:', error);
        throw error;
      }
    })();

    return this.initPromise;
  }

  /**
   * Migrate existing data from localStorage to IndexedDB
   */
  private async migrateFromLocalStorage(): Promise<void> {
    try {
      const legacyData = localStorage.getItem('markitup-unified-plugin-settings');
      if (!legacyData) return;

      const parsed = JSON.parse(legacyData);

      // Migrate plugin settings
      if (parsed.pluginSettings) {
        for (const [pluginId, settings] of Object.entries(parsed.pluginSettings)) {
          await this.saveSettings(pluginId, settings as Record<string, any>);
        }
        console.log('[PluginStorage] Migrated plugin settings from localStorage');
      }

      // Migrate API keys
      if (parsed.apiKeys) {
        for (const [provider, apiKey] of Object.entries(parsed.apiKeys)) {
          await this.saveApiKey(provider, apiKey as string);
        }
        console.log('[PluginStorage] Migrated API keys from localStorage');
      }

      // Clear old localStorage data
      localStorage.removeItem('markitup-unified-plugin-settings');
      console.log('[PluginStorage] Migration complete, localStorage cleared');
    } catch (error) {
      console.error('[PluginStorage] Migration failed:', error);
    }
  }

  /**
   * Save plugin settings
   */
  async saveSettings(pluginId: string, settings: Record<string, any>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.put('settings', {
      pluginId,
      settings,
      updatedAt: Date.now(),
      version: 1,
    });
  }

  /**
   * Load plugin settings
   */
  async loadSettings(pluginId: string): Promise<Record<string, any> | null> {
    if (!this.db) throw new Error('Database not initialized');

    const record = await this.db.get('settings', pluginId);
    return record?.settings || null;
  }

  /**
   * Delete plugin settings
   */
  async deleteSettings(pluginId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.delete('settings', pluginId);
  }

  /**
   * Get all plugin settings
   */
  async getAllSettings(): Promise<Map<string, Record<string, any>>> {
    if (!this.db) throw new Error('Database not initialized');

    const all = await this.db.getAll('settings');
    const map = new Map<string, Record<string, any>>();

    all.forEach(record => {
      map.set(record.pluginId, record.settings);
    });

    return map;
  }

  /**
   * Save API key (with basic obfuscation, not true encryption)
   */
  async saveApiKey(provider: string, apiKey: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Basic obfuscation (NOT secure encryption, just prevents casual viewing)
    // For true security, use Web Crypto API
    const obfuscated = btoa(apiKey);

    await this.db.put('apiKeys', {
      provider,
      apiKey: obfuscated,
      encryptedAt: Date.now(),
    });
  }

  /**
   * Load API key
   */
  async loadApiKey(provider: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized');

    const record = await this.db.get('apiKeys', provider);
    if (!record) return null;

    // Deobfuscate
    try {
      return atob(record.apiKey);
    } catch (error) {
      console.error('[PluginStorage] Failed to decode API key:', error);
      return null;
    }
  }

  /**
   * Delete API key
   */
  async deleteApiKey(provider: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.delete('apiKeys', provider);
  }

  /**
   * Get all API key providers (not the keys themselves)
   */
  async getAllApiKeyProviders(): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');

    const all = await this.db.getAll('apiKeys');
    return all.map(record => record.provider);
  }

  /**
   * Save data to cache with optional expiration
   */
  async cacheData(key: string, data: any, expiresInMs?: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.put('cache', {
      key,
      data,
      expiresAt: expiresInMs ? Date.now() + expiresInMs : undefined,
      createdAt: Date.now(),
    });
  }

  /**
   * Load data from cache
   */
  async loadFromCache(key: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    const record = await this.db.get('cache', key);
    if (!record) return null;

    // Check if expired
    if (record.expiresAt && record.expiresAt < Date.now()) {
      await this.db.delete('cache', key);
      return null;
    }

    return record.data;
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const all = await this.db.getAll('cache');
    const now = Date.now();
    let cleared = 0;

    for (const record of all) {
      if (record.expiresAt && record.expiresAt < now) {
        await this.db.delete('cache', record.key);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Clear all cache entries
   */
  async clearAllCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.clear('cache');
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    settingsCount: number;
    apiKeysCount: number;
    cacheCount: number;
    estimatedSize: string;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const [settingsCount, apiKeysCount, cacheCount] = await Promise.all([
      this.db.count('settings'),
      this.db.count('apiKeys'),
      this.db.count('cache'),
    ]);

    // Estimate storage size (rough approximation)
    let estimatedBytes = 0;

    if ('estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      estimatedBytes = estimate.usage || 0;
    }

    const estimatedSize = this.formatBytes(estimatedBytes);

    return {
      settingsCount,
      apiKeysCount,
      cacheCount,
      estimatedSize,
    };
  }

  /**
   * Export all data as JSON
   */
  async exportAll(): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const [settings, apiKeys, cache] = await Promise.all([
      this.db.getAll('settings'),
      this.db.getAll('apiKeys'),
      this.db.getAll('cache'),
    ]);

    const data = {
      version: this.DB_VERSION,
      exportedAt: new Date().toISOString(),
      settings,
      apiKeys: apiKeys.map(k => ({ provider: k.provider, hasKey: true })), // Don't export actual keys
      cache,
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await Promise.all([
      this.db.clear('settings'),
      this.db.clear('apiKeys'),
      this.db.clear('cache'),
    ]);

    console.log('[PluginStorage] All data cleared');
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
      console.log('[PluginStorage] Database connection closed');
    }
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

// Convenience functions for common operations

/**
 * Get storage instance
 */
export async function getPluginStorage(): Promise<PluginStorage> {
  return PluginStorage.getInstance();
}

/**
 * Quick save plugin settings
 */
export async function savePluginSettings(
  pluginId: string,
  settings: Record<string, any>
): Promise<void> {
  const storage = await getPluginStorage();
  await storage.saveSettings(pluginId, settings);
}

/**
 * Quick load plugin settings
 */
export async function loadPluginSettings(pluginId: string): Promise<Record<string, any> | null> {
  const storage = await getPluginStorage();
  return storage.loadSettings(pluginId);
}
