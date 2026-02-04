/**
 * Supabase client exports
 *
 * Usage:
 * - Browser/Client Components: import { createClient } from '@/lib/supabase/client' or import { supabase } from '@/lib/supabase/client'
 * - Server Components/Route Handlers: import { createClient } from '@/lib/supabase/server'
 * - Middleware: import { createClient, updateSession } from '@/lib/supabase/middleware'
 */

export { createClient as createBrowserClient, supabase } from './client';
export { createClient as createServerClient } from './server';
export {
  createClient as createMiddlewareClient,
  updateSession,
  routeConfig,
} from './middleware';
