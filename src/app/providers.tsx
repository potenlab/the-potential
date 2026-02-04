'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '@/lib/query-client';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Client-side providers wrapper for the application
 * Includes:
 * - React Query Provider for server state management
 * - React Query Devtools for development debugging
 */
export function Providers({ children }: ProvidersProps) {
  // Get or create the QueryClient instance
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
