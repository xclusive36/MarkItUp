/**
 * Keyboard Shortcut Manager - Customizable keyboard shortcuts system
 *
 * Allows users to customize keyboard shortcuts and provides
 * a centralized system for managing keyboard events.
 *
 * @example
 * ```typescript
 * const manager = KeyboardShortcutManager.getInstance();
 *
 * manager.register('save-note', 'Cmd+S', () => {
 *   console.log('Saving note...');
 * });
 *
 * // Customize shortcut
 * manager.customize('save-note', 'Ctrl+S');
 * ```
 */

import { getPluginStorage } from './plugin-storage';

export interface ShortcutDefinition {
  id: string;
  name: string;
  description: string;
  defaultKey: string;
  customKey?: string;
  category: string;
  enabled: boolean;
}

export interface ShortcutHandler {
  callback: (event: KeyboardEvent) => void | Promise<void>;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export class KeyboardShortcutManager {
  private static instance: KeyboardShortcutManager;
  private shortcuts: Map<string, ShortcutDefinition> = new Map();
  private handlers: Map<string, ShortcutHandler> = new Map();
  private keyToShortcutId: Map<string, string> = new Map();
  private isListening = false;
  private disabledInInputs = true;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): KeyboardShortcutManager {
    if (!KeyboardShortcutManager.instance) {
      KeyboardShortcutManager.instance = new KeyboardShortcutManager();
    }
    return KeyboardShortcutManager.instance;
  }

  /**
   * Initialize the shortcut manager and load saved customizations
   */
  async initialize(): Promise<void> {
    await this.loadCustomShortcuts();
    this.startListening();
    console.log('[KeyboardShortcutManager] Initialized');
  }

  /**
   * Register a keyboard shortcut
   */
  register(
    id: string,
    defaultKey: string,
    callback: (event: KeyboardEvent) => void | Promise<void>,
    options: {
      name?: string;
      description?: string;
      category?: string;
      preventDefault?: boolean;
      stopPropagation?: boolean;
    } = {}
  ): void {
    const shortcut: ShortcutDefinition = {
      id,
      name: options.name || id,
      description: options.description || '',
      defaultKey,
      category: options.category || 'General',
      enabled: true,
    };

    this.shortcuts.set(id, shortcut);
    this.handlers.set(id, {
      callback,
      preventDefault: options.preventDefault !== false, // Default true
      stopPropagation: options.stopPropagation || false,
    });

    // Map the key (default or custom) to the shortcut ID
    const activeKey = shortcut.customKey || shortcut.defaultKey;
    this.keyToShortcutId.set(activeKey, id);
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(id: string): void {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      const activeKey = shortcut.customKey || shortcut.defaultKey;
      this.keyToShortcutId.delete(activeKey);
    }

    this.shortcuts.delete(id);
    this.handlers.delete(id);
  }

  /**
   * Customize a keyboard shortcut
   */
  async customize(id: string, newKey: string): Promise<boolean> {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut) {
      console.warn(`[KeyboardShortcutManager] Shortcut ${id} not found`);
      return false;
    }

    // Check if the new key is already in use
    const existingId = this.keyToShortcutId.get(newKey);
    if (existingId && existingId !== id) {
      console.warn(`[KeyboardShortcutManager] Key ${newKey} is already used by ${existingId}`);
      return false;
    }

    // Remove old key mapping
    const oldKey = shortcut.customKey || shortcut.defaultKey;
    this.keyToShortcutId.delete(oldKey);

    // Set new key
    shortcut.customKey = newKey;
    this.keyToShortcutId.set(newKey, id);

    // Persist
    await this.saveCustomShortcuts();

    console.log(`[KeyboardShortcutManager] Customized ${id}: ${oldKey} → ${newKey}`);
    return true;
  }

  /**
   * Reset a shortcut to its default
   */
  async resetToDefault(id: string): Promise<void> {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut) return;

    // Remove custom key mapping
    if (shortcut.customKey) {
      this.keyToShortcutId.delete(shortcut.customKey);
      shortcut.customKey = undefined;
    }

    // Re-add default key mapping
    this.keyToShortcutId.set(shortcut.defaultKey, id);

    await this.saveCustomShortcuts();
  }

  /**
   * Enable or disable a shortcut
   */
  async setEnabled(id: string, enabled: boolean): Promise<void> {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      shortcut.enabled = enabled;
      await this.saveCustomShortcuts();
    }
  }

  /**
   * Get all registered shortcuts
   */
  getAllShortcuts(): ShortcutDefinition[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcuts by category
   */
  getShortcutsByCategory(category: string): ShortcutDefinition[] {
    return this.getAllShortcuts().filter(s => s.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    this.shortcuts.forEach(shortcut => {
      categories.add(shortcut.category);
    });
    return Array.from(categories).sort();
  }

  /**
   * Format keyboard event to shortcut key string
   */
  formatKey(event: KeyboardEvent): string {
    const parts: string[] = [];

    // Modifiers (in consistent order)
    if (event.ctrlKey || event.metaKey) parts.push('Cmd');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');

    // Main key
    let key = event.key;

    // Normalize some keys
    if (key === ' ') key = 'Space';
    else if (key.length === 1) key = key.toUpperCase();

    parts.push(key);

    return parts.join('+');
  }

  /**
   * Check if an element should ignore keyboard shortcuts
   */
  private shouldIgnoreEvent(event: KeyboardEvent): boolean {
    if (!this.disabledInInputs) return false;

    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();

    // Ignore in input elements
    if (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      target.isContentEditable
    ) {
      // Except for some global shortcuts like Cmd+S
      const key = this.formatKey(event);
      const shortcutId = this.keyToShortcutId.get(key);
      const shortcut = shortcutId ? this.shortcuts.get(shortcutId) : null;

      // Allow shortcuts in the "Global" category even in inputs
      return !(shortcut?.category === 'Global');
    }

    return false;
  }

  /**
   * Handle keyboard event
   */
  private handleKeydown = (event: KeyboardEvent): void => {
    if (this.shouldIgnoreEvent(event)) return;

    const key = this.formatKey(event);
    const shortcutId = this.keyToShortcutId.get(key);

    if (!shortcutId) return;

    const shortcut = this.shortcuts.get(shortcutId);
    const handler = this.handlers.get(shortcutId);

    if (!shortcut || !handler || !shortcut.enabled) return;

    // Prevent default if configured
    if (handler.preventDefault) {
      event.preventDefault();
    }

    // Stop propagation if configured
    if (handler.stopPropagation) {
      event.stopPropagation();
    }

    // Execute callback
    try {
      handler.callback(event);
    } catch (error) {
      console.error(`[KeyboardShortcutManager] Error in shortcut ${shortcutId}:`, error);
    }
  };

  /**
   * Start listening for keyboard events
   */
  startListening(): void {
    if (this.isListening) return;

    window.addEventListener('keydown', this.handleKeydown, true);
    this.isListening = true;
  }

  /**
   * Stop listening for keyboard events
   */
  stopListening(): void {
    if (!this.isListening) return;

    window.removeEventListener('keydown', this.handleKeydown, true);
    this.isListening = false;
  }

  /**
   * Set whether shortcuts should be disabled in input fields
   */
  setDisabledInInputs(disabled: boolean): void {
    this.disabledInInputs = disabled;
  }

  /**
   * Load custom shortcuts from storage
   */
  private async loadCustomShortcuts(): Promise<void> {
    try {
      const storage = await getPluginStorage();
      const data = await storage.loadFromCache('keyboard-shortcuts');

      if (data && data.customizations) {
        for (const [id, customKey] of Object.entries(data.customizations)) {
          const shortcut = this.shortcuts.get(id);
          if (shortcut && typeof customKey === 'string') {
            const oldKey = shortcut.customKey || shortcut.defaultKey;
            this.keyToShortcutId.delete(oldKey);

            shortcut.customKey = customKey;
            this.keyToShortcutId.set(customKey, id);
          }
        }
      }

      if (data && data.disabled) {
        for (const id of data.disabled) {
          const shortcut = this.shortcuts.get(id);
          if (shortcut) {
            shortcut.enabled = false;
          }
        }
      }
    } catch (error) {
      console.error('[KeyboardShortcutManager] Failed to load custom shortcuts:', error);
    }
  }

  /**
   * Save custom shortcuts to storage
   */
  private async saveCustomShortcuts(): Promise<void> {
    try {
      const customizations: Record<string, string> = {};
      const disabled: string[] = [];

      this.shortcuts.forEach((shortcut, id) => {
        if (shortcut.customKey) {
          customizations[id] = shortcut.customKey;
        }
        if (!shortcut.enabled) {
          disabled.push(id);
        }
      });

      const storage = await getPluginStorage();
      await storage.cacheData('keyboard-shortcuts', {
        customizations,
        disabled,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('[KeyboardShortcutManager] Failed to save custom shortcuts:', error);
    }
  }

  /**
   * Export shortcuts configuration
   */
  exportConfig(): string {
    const config = {
      shortcuts: Array.from(this.shortcuts.values()),
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(config, null, 2);
  }

  /**
   * Get shortcut for command
   */
  getShortcut(id: string): ShortcutDefinition | null {
    return this.shortcuts.get(id) || null;
  }

  /**
   * Get active key for a shortcut
   */
  getActiveKey(id: string): string | null {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut) return null;
    return shortcut.customKey || shortcut.defaultKey;
  }
}

// Export singleton instance
export const keyboardShortcuts = KeyboardShortcutManager.getInstance();
