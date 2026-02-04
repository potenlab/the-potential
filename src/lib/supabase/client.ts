import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client for browser/client-side usage
 *
 * This client:
 * - Automatically manages auth tokens
 * - Persists sessions in browser cookies
 * - Is safe to use in React components
 *
 * @returns Supabase client instance for browser
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Singleton Supabase client for client-side usage
 * Use this in React components and client-side code
 */
export const supabase = createClient();
