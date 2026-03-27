import { QueryClient } from '@tanstack/react-query';

export function setupQueryErrorHandling(queryClient: QueryClient) {
  queryClient.setDefaultOptions({
    queries: {
      onError: (error: Error) => {
        console.error('[React Query] Query error:', error);
        
        // Toast will be shown by individual components if needed
        // Global error handling logs for debugging
      },
      retry: (failureCount, error: any) => {
        // Don't retry on 404 or 401
        if (error?.status === 404 || error?.status === 401) {
          return false;
        }
        
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
    },
    mutations: {
      onError: (error: Error) => {
        console.error('[React Query] Mutation error:', error);
        
        // Toast will be shown by individual components if needed
        // Global error handling logs for debugging
      },
    },
  });
}
