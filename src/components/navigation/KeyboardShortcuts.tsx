'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcutsProps {
  onCommandPalette: () => void;
}

export default function KeyboardShortcuts({ onCommandPalette }: KeyboardShortcutsProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette: Cmd/Ctrl+P
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        onCommandPalette();
        return;
      }

      // New Note: Cmd/Ctrl+E
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        router.push('/editor/new');
        return;
      }

      // Search: Cmd/Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        router.push('/search');
        return;
      }

      // Graph: Cmd/Ctrl+G
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
        e.preventDefault();
        router.push('/graph');
        return;
      }

      // Daily Notes: Cmd/Ctrl+D
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        router.push('/daily-notes');
        return;
      }

      // Settings: Cmd/Ctrl+,
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        router.push('/settings');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCommandPalette, router]);

  return null; // This component doesn't render anything
}
