'use client';

import { useRef, useCallback, useEffect } from 'react';
import { HistoryManager, EditorState, HistoryOptions } from '@/lib/history-manager';

export interface UseHistoryManagerResult {
  push: (content: string, cursorPosition: number) => void;
  pushImmediate: (content: string, cursorPosition: number) => void;
  undo: () => EditorState | null;
  redo: () => EditorState | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
  getCurrentState: () => EditorState | null;
}

/**
 * Hook for managing editor history with undo/redo
 *
 * @param options - History manager options
 * @returns History management utilities
 */
export function useHistoryManager(options?: HistoryOptions): UseHistoryManagerResult {
  const historyRef = useRef<HistoryManager | null>(null);

  // Initialize history manager only once
  if (historyRef.current == null) {
    historyRef.current = new HistoryManager(options);
  }

  const push = useCallback((content: string, cursorPosition: number) => {
    if (historyRef.current) {
      historyRef.current.push({ content, cursorPosition });
    }
  }, []);

  const pushImmediate = useCallback((content: string, cursorPosition: number) => {
    if (historyRef.current) {
      historyRef.current.pushImmediate({ content, cursorPosition });
    }
  }, []);

  const undo = useCallback(() => {
    return historyRef.current?.undo() ?? null;
  }, []);

  const redo = useCallback(() => {
    return historyRef.current?.redo() ?? null;
  }, []);

  const canUndo = useCallback(() => {
    return historyRef.current?.canUndo() ?? false;
  }, []);

  const canRedo = useCallback(() => {
    return historyRef.current?.canRedo() ?? false;
  }, []);

  const clear = useCallback(() => {
    historyRef.current?.clear();
  }, []);

  const getCurrentState = useCallback(() => {
    return historyRef.current?.getCurrentState() ?? null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (historyRef.current) {
        historyRef.current.destroy();
      }
    };
  }, []);

  return {
    push,
    pushImmediate,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
    getCurrentState,
  };
}
