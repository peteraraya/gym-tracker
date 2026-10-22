'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/infrastructure/react-query/queryKeys';
import * as storageService from '@/lib/infrastructure/storage/storage';
import { useAuth } from '@/context/AuthContext';

const STALE_TIME = 5 * 60 * 1000;

/**
 * Pre-carga rutinas y sesiones en el caché de React Query al arrancar la app,
 * para que las páginas muestren datos al instante sin skeleton en la primera navegación.
 * Usa las mismas queryKeys y queryFn que GymContext: React Query deduplica la petición
 * si esta ya está en vuelo.
 */
export function PrefetchData() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.routines.listForUser(userId),
      queryFn: () => storageService.getRoutines(),
      staleTime: STALE_TIME,
    });
    void queryClient.prefetchQuery({
      queryKey: queryKeys.sessions.listForUser(userId),
      queryFn: () => storageService.getSessions(),
      staleTime: STALE_TIME,
    });
  }, [queryClient, userId]);

  return null;
}