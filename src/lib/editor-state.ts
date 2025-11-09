/**
 * Editor State Persistence
 * Tracks editor state (scroll position, recent files) in localStorage
 * Based on Sentiment's implementation
 */

interface EditorState {
  scrollPosition: number;
  lastAccessed: number;
}

interface RecentFile {
  path: string;
  title: string;
  lastAccessed: number;
}

const STORAGE_PREFIX = 'markitup-editor-';
const RECENT_FILES_KEY = 'markitup-recent-files';
const MAX_RECENT_FILES = 10;
const STATE_CLEANUP_DAYS = 30;

export class EditorStatePersistence {
  /**
   * Save editor state for a file
   */
  static saveState(filePath: string, scrollPosition: number): void {
    if (typeof window === 'undefined') return;

    const state: EditorState = {
      scrollPosition,
      lastAccessed: Date.now(),
    };

    try {
      localStorage.setItem(`${STORAGE_PREFIX}${filePath}`, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save editor state:', error);
    }
  }

  /**
   * Get editor state for a file
   */
  static getState(filePath: string): EditorState {
    if (typeof window === 'undefined') {
      return { scrollPosition: 0, lastAccessed: 0 };
    }

    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${filePath}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load editor state:', error);
    }

    return { scrollPosition: 0, lastAccessed: 0 };
  }

  /**
   * Add a file to recent files list
   */
  static addRecentFile(path: string, title: string): void {
    if (typeof window === 'undefined') return;

    try {
      const recentFiles = this.getRecentFiles();

      // Remove if already exists
      const filtered = recentFiles.filter(f => f.path !== path);

      // Add to front
      filtered.unshift({
        path,
        title,
        lastAccessed: Date.now(),
      });

      // Keep only MAX_RECENT_FILES
      const trimmed = filtered.slice(0, MAX_RECENT_FILES);

      localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.warn('Failed to update recent files:', error);
    }
  }

  /**
   * Get recent files list
   */
  static getRecentFiles(): RecentFile[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(RECENT_FILES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load recent files:', error);
    }

    return [];
  }

  /**
   * Clear recent files list
   */
  static clearRecentFiles(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(RECENT_FILES_KEY);
    } catch (error) {
      console.warn('Failed to clear recent files:', error);
    }
  }

  /**
   * Cleanup old editor states (older than STATE_CLEANUP_DAYS)
   */
  static cleanupOldStates(): void {
    if (typeof window === 'undefined') return;

    try {
      const cutoffTime = Date.now() - STATE_CLEANUP_DAYS * 24 * 60 * 60 * 1000;
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const state: EditorState = JSON.parse(stored);
            if (state.lastAccessed < cutoffTime) {
              keysToRemove.push(key);
            }
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      if (keysToRemove.length > 0) {
        console.log(`Cleaned up ${keysToRemove.length} old editor states`);
      }
    } catch (error) {
      console.warn('Failed to cleanup old states:', error);
    }
  }

  /**
   * Clear all editor states
   */
  static clearAllStates(): void {
    if (typeof window === 'undefined') return;

    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      this.clearRecentFiles();

      console.log('Cleared all editor states');
    } catch (error) {
      console.warn('Failed to clear editor states:', error);
    }
  }
}
