import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time por defecto: 5 minutos para datos de usuario (rutinas, sesiones, perfil)
      staleTime: 5 * 60 * 1000,

      // Garbage collection time: 10 minutos
      gcTime: 10 * 60 * 1000,

      // Retry configuration
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch configuration
      // Keep workout/PWA flows stable when the app regains focus after lock screen
      // or app switching. Mutations still invalidate queries explicitly.
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,

      // Network mode - offline first
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry mutations up to 3 times
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Network mode - offline first
      networkMode: 'offlineFirst',
    },
  },
});

/**
 * Configuración de queries para datos estáticos (ejercicios, grupos musculares).
 * Estos datos cambian muy raramente, por lo que se cachean prácticamente para siempre.
 */
export const staticQueryOptions = {
  staleTime: Infinity,
  gcTime: 24 * 60 * 60 * 1000, // 24 horas
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
} as const;
