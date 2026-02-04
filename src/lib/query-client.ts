import { QueryClient } from '@tanstack/react-query';

/**
 * Query Client Configuration
 *
 * Optimized settings for The Potential platform:
 * - Deduplication: Prevents duplicate network requests
 * - Caching: Reduces server load with smart stale times
 * - Garbage Collection: Cleans up unused queries after 5 minutes
 *
 * Performance Targets:
 * - No duplicate network requests for same data
 * - Initial bundle < 200KB
 * - LCP < 2.5s
 */

/** Default stale time in milliseconds (60 seconds) */
const DEFAULT_STALE_TIME = 60 * 1000;

/** Garbage collection time in milliseconds (5 minutes) */
const GC_TIME = 5 * 60 * 1000;

/**
 * Factory function to create a new QueryClient instance
 * Used for both server and client-side rendering
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 seconds
        // This prevents refetching on component remount
        staleTime: DEFAULT_STALE_TIME,

        // Garbage collection: remove unused queries after 5 minutes
        // This prevents memory bloat from old data
        gcTime: GC_TIME,

        // Disable automatic refetch on window focus
        // Users can manually refresh if needed
        refetchOnWindowFocus: false,

        // Don't refetch when component remounts
        // The stale time handles freshness
        refetchOnMount: false,

        // Only retry failed queries once
        retry: 1,

        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Network mode: always fetch regardless of online status
        // Supabase handles offline gracefully
        networkMode: 'always',

        // Enable structural sharing to prevent unnecessary re-renders
        // Only re-renders if data actually changed
        structuralSharing: true,
      },
      mutations: {
        // Don't retry failed mutations - user should be notified
        retry: 0,

        // Network mode for mutations
        networkMode: 'always',
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
