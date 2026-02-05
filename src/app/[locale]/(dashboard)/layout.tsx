import { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layouts/header';
import { BottomNav } from '@/components/layouts/bottom-nav';
import { AuthModal } from '@/features/auth/components/auth-modal';
import { AuthGuard } from '@/components/common/auth-guard';

interface DashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Dashboard Layout - Main application layout with navigation
 *
 * This layout:
 * - Includes fixed Header (desktop navigation) at top
 * - Includes fixed BottomNav (mobile navigation) at bottom
 * - Provides proper spacing to prevent content from being obscured
 * - Works within the [locale] segment for i18n support
 *
 * Content Spacing:
 * - Top padding: 80px (h-20) for fixed header
 * - Bottom padding: 80px (h-20) on mobile for fixed bottom nav
 * - Responsive padding adjustments for different screen sizes
 *
 * @example
 * ```tsx
 * // Pages within (dashboard) route group will automatically use this layout
 * // e.g., src/app/[locale]/(dashboard)/home/page.tsx
 * ```
 */
export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { locale } = await params;

  // Enable static rendering for this locale
  setRequestLocale(locale);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Fixed Header - Desktop navigation (80px height) */}
      <Header />

      {/* Main Content Area */}
      {/*
        Spacing:
        - pt-20: Top padding to account for 80px fixed header
        - pb-24: Bottom padding on mobile (80px nav + 16px buffer)
        - md:pb-8: Reduced bottom padding on desktop (no bottom nav)
        - px-4 md:px-8: Responsive horizontal padding
      */}
      <main className="pt-20 pb-24 md:pb-8 px-4 md:px-8">
        {/* Max width container for content alignment */}
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>

      {/* Fixed Bottom Navigation - Mobile only (80px height) */}
      <BottomNav />

      {/* Auth Guard - Opens modal on protected routes for unauthenticated users */}
      <AuthGuard />

      {/* Auth Modal - Login/Signup dialog triggered from header or auth guard */}
      <AuthModal />
    </div>
  );
}
