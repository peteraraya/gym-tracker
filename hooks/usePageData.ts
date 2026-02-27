/**
 * Hook genérico para el patrón loading + error + data
 * 
 * Centraliza la lógica de fetch que estaba duplicada en profile, sessions, etc.
 */

import { useState, useEffect } from 'react';

interface UsePageDataOptions {
  dependencies?: any[];
}

interface UsePageDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePageData<T>(
  fetchFn: () => Promise<T>,
  options: UsePageDataOptions = {}
): UsePageDataResult<T> {
  const { dependencies = [] } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      console.error('Error en usePageData:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn();
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          const message = err instanceof Error ? err.message : 'Error desconocido';
          setError(message);
          console.error('Error en usePageData:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}
