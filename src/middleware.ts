import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { createClient, routeConfig } from '@/lib/supabase/middleware';

/**
 * Combined Next.js middleware for:
 * 1. Automatic locale detection and routing (next-intl)
 * 2. Supabase authentication and route protection
 *
 * Flow:
 * 1. First, apply next-intl middleware for locale handling
 * 2. Then, check authentication for protected routes
 * 3. Redirect based on auth state and route requirements
 *
 * Route protection:
 * - Protected routes: Handled client-side by AuthGuard (opens auth modal)
 * - Auth routes (login, signup): Redirect authenticated users to /[locale]/home
 * - Admin routes: Require admin role, redirect non-admins to /[locale]/home
 */

// Create the next-intl middleware handler
const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Step 1: Apply next-intl middleware for locale handling
  // This handles locale detection, redirects, and sets locale cookies
  const intlResponse = intlMiddleware(request);

  // Get the pathname from the request
  const pathname = request.nextUrl.pathname;

  // Skip auth checks for static files, API routes, etc.
  // These are already excluded by the matcher, but double-check
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/trpc') ||
    pathname.includes('.')
  ) {
    return intlResponse;
  }

  // Extract locale from pathname (e.g., /ko/home -> ko)
  const localeMatch = pathname.match(/^\/(ko|en)(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : 'ko';
  const pathWithoutLocale = pathname.replace(/^\/(ko|en)/, '') || '/';

  // Check route types
  const isProtectedRoute = routeConfig.protectedRoutes.some(
    (route) =>
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );

  const isAuthRoute = routeConfig.authRoutes.some(
    (route) =>
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );

  const isAdminRoute = routeConfig.adminRoutes.some(
    (route) =>
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );

  // Protected routes are handled client-side by AuthGuard (opens auth modal)
  // Only run server-side auth checks for auth routes and admin routes
  if (!isAuthRoute && !isAdminRoute) {
    return intlResponse;
  }

  // Step 2: Create Supabase client and get user session
  const { supabase, response: supabaseResponse, user } = await createClient(request);

  // Merge cookies from intl middleware into supabase response
  // This ensures locale cookies are preserved alongside auth cookies
  const finalResponse = supabaseResponse;

  // Copy cookies from intl response to final response
  intlResponse.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie.name, cookie.value, {
      path: cookie.path,
      domain: cookie.domain,
      maxAge: cookie.maxAge,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite as 'strict' | 'lax' | 'none' | undefined,
    });
  });

  // Step 3: Apply route protection logic

  // Redirect authenticated users from auth routes (login, signup) to home
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
  }

  // Check admin routes - requires fetching user profile
  if (isAdminRoute) {
    // Unauthenticated users trying to access admin routes
    if (!user) {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }

    // Fetch user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, approval_status')
      .eq('id', user.id)
      .single();

    // Redirect non-admin users from admin routes
    if (
      !profile ||
      profile.role !== 'admin' ||
      profile.approval_status !== 'approved'
    ) {
      return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
    }
  }

  // Return the response with both locale and auth cookies
  return finalResponse;
}

export const config = {
  // Match all pathnames except:
  // - API routes (/api/*)
  // - tRPC routes (/trpc/*)
  // - Next.js internals (/_next/*)
  // - Vercel internals (/_vercel/*)
  // - Static files (files with extensions like .js, .css, .png)
  // - Supabase auth callback route
  matcher: [
    '/',
    '/(ko|en)/:path*',
    '/((?!api|trpc|_next|_vercel|auth/callback|.*\\..*).*)',
  ],
};
