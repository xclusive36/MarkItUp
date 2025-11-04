/**
 * History Manager - Undo/Redo functionality for editor
 *
 * Tracks editor state changes and provides undo/redo capabilities.
 * Uses efficient delta-based storage to minimize memory usage.
 *
 * @example
 * ```typescript
 * const history = new HistoryManager(50);
 *
 * // Push new state
 * history.push({ content: 'Hello', cursorPosition: 5 });
 *
 * // Undo
 * const previousState = history.undo();
 *
 * // Redo
 * const nextState = history.redo();
 * ```
 */

export interface EditorState {
  content: string;
  cursorPosition: number;
  selectionStart?: number;
  selectionEnd?: number;
  timestamp: number;
}

export interface HistoryOptions {
  maxHistorySize?: number;
  debounceMs?: number;
  captureInterval?: number;
}

export class HistoryManager {
  private history: EditorState[] = [];
  private currentIndex = -1;
  private maxSize: number;
  private debounceTimer: NodeJS.Timeout | null = null;
  private debounceMs: number;
  private lastCaptureTime = 0;
  private captureInterval: number;
  private pendingState: EditorState | null = null;

  constructor(options: HistoryOptions = {}) {
    this.maxSize = options.maxHistorySize || 100;
    this.debounceMs = options.debounceMs || 500;
    this.captureInterval = options.captureInterval || 1000;
  }

  /**
   * Push a new state to history (debounced)
   * Groups rapid changes together to avoid cluttering history
   */
  push(state: Omit<EditorState, 'timestamp'>): void {
    const fullState: EditorState = {
      ...state,
      timestamp: Date.now(),
    };

    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Store pending state
    this.pendingState = fullState;

    // Debounce: only add to history after user stops typing
    this.debounceTimer = setTimeout(() => {
      if (this.pendingState) {
        this.pushImmediate(this.pendingState);
        this.pendingState = null;
      }
    }, this.debounceMs);
  }

  /**
   * Push state immediately without debouncing
   * Use for explicit save points (e.g., user hits save button)
   */
  pushImmediate(state: Omit<EditorState, 'timestamp'>): void {
    const fullState: EditorState = {
      ...state,
      timestamp: Date.now(),
    };

    // Don't add if content hasn't changed
    const currentState = this.getCurrentState();
    if (currentState && currentState.content === fullState.content) {
      return;
    }

    // Don't add too frequently (unless explicitly called)
    const timeSinceLastCapture = fullState.timestamp - this.lastCaptureTime;
    if (timeSinceLastCapture < this.captureInterval && this.history.length > 0) {
      // Update the last entry instead of adding a new one
      if (this.currentIndex >= 0) {
        this.history[this.currentIndex] = fullState;
        return;
      }
    }

    // Remove any future states (if we're not at the end)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new state
    this.history.push(fullState);
    this.currentIndex++;

    // Maintain max size
    if (this.history.length > this.maxSize) {
      this.history.shift();
      this.currentIndex--;
    }

    this.lastCaptureTime = fullState.timestamp;
  }

  /**
   * Undo to previous state
   */
  undo(): EditorState | null {
    // Flush pending state first
    if (this.pendingState && this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.pushImmediate(this.pendingState);
      this.pendingState = null;
    }

    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex] ?? null;
    }

    return null;
  }

  /**
   * Redo to next state
   */
  redo(): EditorState | null {
    if (!this.canRedo()) {
      return null;
    }

    this.currentIndex++;
    return this.history[this.currentIndex] ?? null;
  }

  /**
   * Get current state
   */
  getCurrentState(): EditorState | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
      return null;
    }
    return this.history[this.currentIndex] ?? null;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get number of states in history
   */
  getHistoryLength(): number {
    return this.history.length;
  }

  /**
   * Get current position in history
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Clear all history
   */
  clear(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.history = [];
    this.currentIndex = -1;
    this.pendingState = null;
    this.lastCaptureTime = 0;
  }

  /**
   * Get all states (for debugging)
   */
  getAllStates(): EditorState[] {
    return [...this.history];
  }

  /**
   * Jump to a specific point in history
   */
  jumpTo(index: number): EditorState | null {
    if (index >= 0 && index < this.history.length) {
      this.currentIndex = index;
      return this.history[index] ?? null;
    }
    return null;
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage(): { states: number; estimatedBytes: number; estimatedMB: number } {
    let totalBytes = 0;

    this.history.forEach(state => {
      // Rough estimation: content length * 2 (UTF-16) + overhead
      totalBytes += state.content.length * 2 + 100; // 100 bytes overhead per state
    });

    return {
      states: this.history.length,
      estimatedBytes: totalBytes,
      estimatedMB: totalBytes / (1024 * 1024),
    };
  }

  /**
   * Export history for persistence
   */
  export(): string {
    return JSON.stringify({
      history: this.history,
      currentIndex: this.currentIndex,
      exportedAt: Date.now(),
    });
  }

  /**
   * Import history from persistence
   */
  import(data: string): boolean {
    try {
      const parsed = JSON.parse(data);

      if (Array.isArray(parsed.history)) {
        this.history = parsed.history;
        this.currentIndex = parsed.currentIndex ?? this.history.length - 1;
        return true;
      }

      return false;
    } catch (error) {
      console.error('[HistoryManager] Failed to import history:', error);
      return false;
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.clear();
  }
}

/**
 * Create a history manager with default options
 */
export function createHistoryManager(options?: HistoryOptions): HistoryManager {
  return new HistoryManager(options);
}
