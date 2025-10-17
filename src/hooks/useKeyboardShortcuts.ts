import { useEffect } from 'react';

export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Command on Mac, Windows key on Windows
  description: string;
  action: () => void;
};

const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlKey = isMac ? e.metaKey : e.ctrlKey;
        const metaKey = isMac ? e.metaKey : e.ctrlKey;

        const matches =
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          (!shortcut.ctrl || ctrlKey) &&
          (!shortcut.meta || metaKey) &&
          (!shortcut.shift || e.shiftKey) &&
          (!shortcut.alt || e.altKey);

        if (matches) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

export function getShortcutLabel(
  shortcut: Omit<KeyboardShortcut, 'action' | 'description'>
): string {
  const parts: string[] = [];

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}
