'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAuthModalStore } from '@/stores/auth-modal-store';
import { useRouter, usePathname } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase/client';

const protectedRoutes = [
  '/thread',
  '/experts',
  '/profile',
  '/clubs',
  '/support-programs',
  '/expert-registration',
];

const onboardingRoutes = ['/signup/onboarding'];

/**
 * AuthGuard - Client-side route protection (placed in locale layout)
 *
 * 1. Redirects authenticated users who haven't completed signup/onboarding
 *    to the appropriate step — enforced on ALL routes except onboarding routes.
 * 2. Opens the auth modal when an unauthenticated user visits a protected route.
 *    If they dismiss the modal without logging in, redirects to homepage.
 */
export function AuthGuard() {
  const { user, isAuthenticated, loading } = useAuth();
  const { openLogin, isOpen } = useAuthModalStore();
  const router = useRouter();
  const pathname = usePathname();
  const modalWasOpened = useRef(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isOnboardingRoute = onboardingRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check onboarding status for authenticated users on non-onboarding routes
  useEffect(() => {
    if (loading || !isAuthenticated || !user || isOnboardingRoute) {
      setOnboardingChecked(false);
      return;
    }

    let cancelled = false;

    async function checkOnboarding() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_name, onboarding_completed')
        .eq('id', user!.id)
        .single();

      if (cancelled) return;

      if (!profile || !profile.onboarding_completed) {
        router.push('/signup/onboarding');
        return;
      }

      setOnboardingChecked(true);
    }

    checkOnboarding();

    return () => {
      cancelled = true;
    };
  }, [loading, isAuthenticated, user, router, isOnboardingRoute]);

  // Open modal when on a protected route without auth
  useEffect(() => {
    if (!loading && !isAuthenticated && isProtectedRoute) {
      openLogin();
      modalWasOpened.current = true;
    }
  }, [loading, isAuthenticated, isProtectedRoute, openLogin]);

  // Redirect to homepage when modal is dismissed without authenticating
  useEffect(() => {
    if (modalWasOpened.current && !isOpen && !isAuthenticated && !loading) {
      modalWasOpened.current = false;
      router.push('/');
    }
  }, [isOpen, isAuthenticated, loading, router]);

  return null;
}
