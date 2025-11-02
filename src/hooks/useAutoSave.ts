import { useEffect, useRef, useCallback } from 'react';

export interface UseAutoSaveOptions {
  /** Delay in milliseconds before triggering save (default: 2000ms) */
  delay?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
  /** Callback when save starts */
  onSaveStart?: () => void;
  /** Callback when save completes successfully */
  onSaveSuccess?: () => void;
  /** Callback when save fails */
  onSaveError?: (error: Error) => void;
}

/**
 * Custom hook for auto-saving content with debouncing
 * Prevents data loss by automatically saving after user stops typing
 * 
 * @param content - The content to auto-save
 * @param onSave - Async function to save the content
 * @param options - Configuration options
 * 
 * @example
 * ```tsx
 * const { isSaving, saveNow, cancelSave } = useAutoSave(
 *   markdownContent,
 *   async (content) => {
 *     await fetch('/api/save', {
 *       method: 'POST',
 *       body: JSON.stringify({ content })
 *     });
 *   },
 *   { delay: 2000 }
 * );
 * ```
 */
export function useAutoSave(
  content: string,
  onSave: (content: string) => Promise<void>,
  options: UseAutoSaveOptions = {}
) {
  const {
    delay = 2000,
    enabled = true,
    onSaveStart,
    onSaveSuccess,
    onSaveError,
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSavedContentRef = useRef<string>(content);
  const isSavingRef = useRef<boolean>(false);

  /**
   * Save immediately, bypassing the debounce
   */
  const saveNow = useCallback(async () => {
    if (isSavingRef.current) {
      return; // Already saving
    }

    if (content === lastSavedContentRef.current) {
      return; // No changes to save
    }

    try {
      isSavingRef.current = true;
      onSaveStart?.();

      await onSave(content);
      
      lastSavedContentRef.current = content;
      onSaveSuccess?.();
    } catch (error) {
      console.error('Auto-save error:', error);
      onSaveError?.(error instanceof Error ? error : new Error('Save failed'));
    } finally {
      isSavingRef.current = false;
    }
  }, [content, onSave, onSaveStart, onSaveSuccess, onSaveError]);

  /**
   * Cancel any pending save
   */
  const cancelSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  // Auto-save effect with debouncing
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Clear existing timeout
    cancelSave();

    // Don't save if content hasn't changed
    if (content === lastSavedContentRef.current) {
      return;
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveNow();
    }, delay);

    // Cleanup on unmount or when dependencies change
    return () => {
      cancelSave();
    };
  }, [content, delay, enabled, saveNow, cancelSave]);

  // Save on unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      if (enabled && content !== lastSavedContentRef.current && !isSavingRef.current) {
        // Use setTimeout to avoid state updates during unmount
        setTimeout(() => {
          onSave(content).catch((error) => {
            console.error('Auto-save on unmount error:', error);
          });
        }, 0);
      }
    };
  }, [content, enabled, onSave]);

  return {
    /** Whether a save operation is currently in progress */
    isSaving: isSavingRef.current,
    /** Manually trigger a save immediately */
    saveNow,
    /** Cancel any pending auto-save */
    cancelSave,
  };
}
