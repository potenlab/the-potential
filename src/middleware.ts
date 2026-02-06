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

  // Check if this is an onboarding route FIRST (before checking auth routes)
  // Onboarding routes are sub-paths of /signup but should NOT redirect authenticated users away
  const isOnboardingRoute = routeConfig.onboardingRoutes.some(
    (route) =>
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );

  const isAuthRoute = !isOnboardingRoute && routeConfig.authRoutes.some(
    (route) =>
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );

  const isAdminRoute = routeConfig.adminRoutes.some(
    (route) =>
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );

  // Skip auth checks for the landing page
  const isLandingPage = pathWithoutLocale === '/' || pathWithoutLocale === '';

  // We need auth checks for: protected routes, auth routes, onboarding routes, admin routes
  // Skip only for landing page and unrecognized routes
  if (!isProtectedRoute && !isAuthRoute && !isAdminRoute && !isOnboardingRoute && !isLandingPage) {
    return intlResponse;
  }

  // Step 2: Create Supabase client and get user session
  const { supabase, response: supabaseResponse, user } = await createClient(request);

  // Merge cookies from intl middleware into supabase response
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

  // Onboarding routes: allow authenticated users, redirect unauthenticated users
  if (isOnboardingRoute) {
    if (!user) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
    return finalResponse;
  }

  // Landing page: no auth enforcement needed, just pass through
  if (isLandingPage) {
    return finalResponse;
  }

  // For authenticated users on any non-onboarding route, enforce onboarding completion
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, approval_status, company_name, onboarding_completed')
      .eq('id', user.id)
      .single();

    // If onboarding not completed → go to signup/onboarding
    if (!profile || !profile.onboarding_completed) {
      return NextResponse.redirect(new URL(`/${locale}/signup/onboarding`, request.url));
    }

    // Onboarding done: redirect away from auth routes (login, signup)
    if (isAuthRoute) {
      return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
    }

    // Admin routes: check role
    if (isAdminRoute) {
      if (profile.role !== 'admin' || profile.approval_status !== 'approved') {
        return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
      }
    }

    return finalResponse;
  }

  // Unauthenticated users on admin routes → redirect to landing
  if (isAdminRoute) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Unauthenticated users on auth routes (login, signup) → allow through
  // Unauthenticated users on protected routes → handled client-side by AuthGuard

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
