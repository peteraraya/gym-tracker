import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes for routine/session data
      staleTime: 5 * 60 * 1000,
      
      // Garbage collection time: 10 minutes
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
