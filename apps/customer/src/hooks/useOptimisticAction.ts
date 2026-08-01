import { useState, useCallback } from 'react';

export interface OptimisticConfig<T> {
  initialState: T;
  onSuccess?: (newState: T) => void;
  onError?: (error: any, rollbackState: T) => void;
  enableHaptics?: boolean;
}

/**
 * Custom hook for Optimistic UI Updates.
 * Instantly updates local UI state, runs the async task in the background,
 * and automatically rolls back if the task fails.
 */
export function useOptimisticAction<T>({
  initialState,
  onSuccess,
  onError,
  enableHaptics = true
}: OptimisticConfig<T>) {
  const [state, setState] = useState<T>(initialState);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const execute = useCallback(
    async (
      optimisticValue: T | ((prev: T) => T),
      asyncTask: (optimisticState: T) => Promise<any>
    ) => {
      // 1. Calculate optimistic state
      const nextState = typeof optimisticValue === 'function'
        ? (optimisticValue as (prev: T) => T)(state)
        : optimisticValue;

      const previousState = state;

      // 2. Trigger haptic feedback if supported
      if (enableHaptics && typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(25);
        } catch (_) {
          // Ignore vibration error
        }
      }

      // 3. Immediately update UI state
      setState(nextState);
      setIsSyncing(true);
      setLastError(null);

      try {
        // 4. Perform background server action
        await asyncTask(nextState);
        setIsSyncing(false);
        if (onSuccess) onSuccess(nextState);
      } catch (err: any) {
        // 5. Automatic rollback on error
        console.warn('Optimistic action failed, rolling back:', err);
        setState(previousState);
        setIsSyncing(false);
        setLastError(err instanceof Error ? err : new Error(String(err)));
        if (onError) onError(err, previousState);
      }
    },
    [state, enableHaptics, onSuccess, onError]
  );

  return {
    state,
    setState,
    isSyncing,
    lastError,
    execute
  };
}

/**
 * Specialized hook for Optimistic Favorite Toggling
 */
export function useOptimisticFavorite(initialFavorite = false, onToggle?: (isFav: boolean) => Promise<void>) {
  return useOptimisticAction<boolean>({
    initialState: initialFavorite,
    enableHaptics: true
  });
}
