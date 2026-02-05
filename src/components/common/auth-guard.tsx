'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAuthModalStore } from '@/stores/auth-modal-store';
import { useRouter, usePathname } from '@/i18n/navigation';

const protectedRoutes = [
  '/thread',
  '/experts',
  '/profile',
  '/clubs',
  '/support-programs',
  '/expert-registration',
];

/**
 * AuthGuard - Opens the auth modal when an unauthenticated user
 * visits a protected route. If they dismiss the modal without
 * logging in, redirects them to the homepage.
 */
export function AuthGuard() {
  const { isAuthenticated, loading } = useAuth();
  const { openLogin, isOpen } = useAuthModalStore();
  const router = useRouter();
  const pathname = usePathname();
  const modalWasOpened = useRef(false);

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

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
