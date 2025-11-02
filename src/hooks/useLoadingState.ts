import { useState, useCallback } from 'react';

export interface UseLoadingStateOptions {
  /** Initial loading state (default: false) */
  initialLoading?: boolean;
  /** Callback when operation starts */
  onStart?: () => void;
  /** Callback when operation succeeds */
  onSuccess?: () => void;
  /** Callback when operation fails */
  onError?: (error: Error) => void;
}

export interface UseLoadingStateReturn<T> {
  /** Whether an operation is currently in progress */
  isLoading: boolean;
  /** Error from the last failed operation */
  error: Error | null;
  /** Data from the last successful operation */
  data: T | null;
  /** Execute an async operation with automatic loading state management */
  execute: (operation: () => Promise<T>) => Promise<T | null>;
  /** Reset the state to initial values */
  reset: () => void;
  /** Set loading state manually */
  setLoading: (loading: boolean) => void;
  /** Set error manually */
  setError: (error: Error | null) => void;
}

/**
 * Custom hook for managing loading states with async operations
 * Provides a clean API for handling loading, error, and data states
 * 
 * @param options - Configuration options
 * 
 * @example
 * ```tsx
 * const { isLoading, error, execute } = useLoadingState();
 * 
 * const handleSave = async () => {
 *   await execute(async () => {
 *     const response = await fetch('/api/save', { method: 'POST' });
 *     return response.json();
 *   });
 * };
 * ```
 */
export function useLoadingState<T = unknown>(
  options: UseLoadingStateOptions = {}
): UseLoadingStateReturn<T> {
  const {
    initialLoading = false,
    onStart,
    onSuccess,
    onError,
  } = options;

  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);
        onStart?.();

        const result = await operation();
        
        setData(result);
        onSuccess?.();
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Operation failed');
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [onStart, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    isLoading,
    error,
    data,
    execute,
    reset,
    setLoading: setIsLoading,
    setError,
  };
}

/**
 * Optimistic update helper
 * Performs an optimistic UI update, then reverts if the operation fails
 * 
 * @example
 * ```tsx
 * const { optimisticUpdate } = useOptimisticUpdate();
 * 
 * const handleDelete = async (id: string) => {
 *   optimisticUpdate(
 *     // Optimistic update
 *     () => setItems(items.filter(item => item.id !== id)),
 *     // API call
 *     () => fetch(`/api/items/${id}`, { method: 'DELETE' }),
 *     // Revert on error
 *     () => fetchItems()
 *   );
 * };
 * ```
 */
export function useOptimisticUpdate() {
  const [isOptimistic, setIsOptimistic] = useState(false);

  const optimisticUpdate = useCallback(
    async <T,>(
      optimisticFn: () => void,
      apiCall: () => Promise<T>,
      revertFn: () => void | Promise<void>
    ): Promise<{ success: boolean; data?: T; error?: Error }> => {
      try {
        // Apply optimistic update immediately
        setIsOptimistic(true);
        optimisticFn();

        // Perform API call
        const data = await apiCall();

        setIsOptimistic(false);
        return { success: true, data };
      } catch (error) {
        // Revert optimistic update on error
        await revertFn();
        setIsOptimistic(false);
        
        return {
          success: false,
          error: error instanceof Error ? error : new Error('Operation failed'),
        };
      }
    },
    []
  );

  return {
    isOptimistic,
    optimisticUpdate,
  };
}
