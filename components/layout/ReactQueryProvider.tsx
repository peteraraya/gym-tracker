'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/react-query/queryClient';
import { setupQueryErrorHandling } from '@/lib/react-query/errorHandling';
import { useEffect, useState } from 'react';

// Setup error handling once
setupQueryErrorHandling(queryClient);

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const mounted = true;
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {mounted && process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
