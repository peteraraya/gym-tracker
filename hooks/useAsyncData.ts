import { useState, useCallback, useRef } from 'react';

interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

/**
 * Hook para manejar llamadas asíncronas de datos con estados consistentes.
 * Asegura que no haya datos ficticios y que los errores se manejen adecuadamente.
 */
export function useAsyncData<T>(fetchFn: () => Promise<T>, initialData: T | null = null) {
  const [state, setState] = useState<AsyncDataState<T>>({
    data: initialData,
    loading: false,
    error: null,
    lastFetch: null,
  });
  const fetchRef = useRef<(() => Promise<void>) | null>(null);

  const fetch = useCallback(async () => {
    if (state.loading) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await fetchFn();
      setState({
        data,
        loading: false,
        error: null,
        lastFetch: Date.now(),
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar los datos';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
        // Mantener datos previos si los hay para evitar flashes de vacío
        data: prev.data ?? null,
      }));
    }
  }, [state.loading, fetchFn]);

  const retry = useCallback(() => {
    setState((prev) => ({ ...prev, loading: false, error: null }));
    fetch();
  }, [fetch]);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data, error: null }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetch,
    retry,
    setData,
    clearError,
    isEmpty: state.data === null || state.data === undefined || (Array.isArray(state.data) && state.data.length === 0),
    hasError: state.error !== null,
    isIdle: !state.loading && !state.error && state.data === null && state.lastFetch === null,
  };
}