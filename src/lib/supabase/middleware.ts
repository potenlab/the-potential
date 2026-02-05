import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client for middleware usage
 *
 * This client:
 * - Refreshes expired auth tokens
 * - Updates cookies in the response
 * - Can be used for route protection
 *
 * @param request - Next.js request object
 * @returns Object containing supabase client and response
 */
export async function createClient(request: NextRequest) {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: DO NOT remove auth.getUser()
  // This refreshes the auth token if expired and updates cookies
  // Removing this will cause users to be logged out after token expiration
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, response: supabaseResponse, user };
}

/**
 * Configuration for protected and public routes
 */
export const routeConfig = {
  // Routes that require authentication
  protectedRoutes: ['/thread', '/experts', '/profile', '/clubs', '/support-programs', '/expert-registration'],
  // Routes that are only accessible when NOT authenticated
  authRoutes: ['/login', '/signup'],
  // Routes that require admin role
  adminRoutes: ['/admin'],
};

/**
 * Updates the Supabase auth session and handles route protection
 *
 * @param request - Next.js request object
 * @returns NextResponse with updated cookies and potential redirects
 */
export async function updateSession(request: NextRequest) {
  const { supabase, response, user } = await createClient(request);

  const pathname = request.nextUrl.pathname;

  // Extract locale from pathname (e.g., /ko/home -> ko)
  const localeMatch = pathname.match(/^\/(ko|en)(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : 'ko';
  const pathWithoutLocale = pathname.replace(/^\/(ko|en)/, '') || '/';

  // Check if path matches protected routes
  const isProtectedRoute = routeConfig.protectedRoutes.some(
    (route) => pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );

  // Check if path matches auth routes (login, signup)
  const isAuthRoute = routeConfig.authRoutes.some(
    (route) => pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );

  // Check if path matches admin routes
  const isAdminRoute = routeConfig.adminRoutes.some(
    (route) => pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );

  // Redirect unauthenticated users from protected routes to login
  if (!user && isProtectedRoute) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to home
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Check admin routes - requires fetching user profile
  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, approval_status')
      .eq('id', user.id)
      .single();

    // Redirect non-admin users from admin routes
    if (!profile || profile.role !== 'admin' || profile.approval_status !== 'approved') {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  return response;
}
