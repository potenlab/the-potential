import { QueryClient } from '@tanstack/react-query';

/**
 * Factory function to create a new QueryClient instance
 * Used for both server and client-side rendering
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 seconds
        staleTime: 60 * 1000,
        // Disable automatic refetch on window focus
        refetchOnWindowFocus: false,
        // Only retry failed queries once
        retry: 1,
      },
      mutations: {
        // Don't retry failed mutations
        retry: 0,
      },
    },
  });
}

// Browser singleton to prevent creating multiple QueryClient instances
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Get the QueryClient instance
 * - Server: Creates a new instance for each request
 * - Browser: Returns a singleton instance
 */
export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new QueryClient
    return makeQueryClient();
  }
  // Browser: use singleton pattern
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
