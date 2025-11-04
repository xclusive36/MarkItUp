'use client';

import { useEffect } from 'react';
import { KeyboardShortcutManager, keyboardShortcuts } from '@/lib/keyboard-shortcuts';

/**
 * Hook to register a keyboard shortcut
 * Automatically unregisters when component unmounts
 */
export function useKeyboardShortcut(
  id: string,
  defaultKey: string,
  callback: (event: KeyboardEvent) => void | Promise<void>,
  options: {
    name?: string;
    description?: string;
    category?: string;
    preventDefault?: boolean;
    stopPropagation?: boolean;
    enabled?: boolean;
  } = {}
): void {
  useEffect(() => {
    const { enabled = true, ...registerOptions } = options;

    if (!enabled) return;

    keyboardShortcuts.register(id, defaultKey, callback, registerOptions);

    return () => {
      keyboardShortcuts.unregister(id);
    };
  }, [id, defaultKey, callback, options]);
}

/**
 * Hook to get the keyboard shortcut manager instance
 */
export function useKeyboardShortcutManager(): KeyboardShortcutManager {
  return keyboardShortcuts;
}
