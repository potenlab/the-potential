import { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

interface AuthLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Auth Layout - Centered layout for authentication pages
 *
 * This layout:
 * - Centers content vertically and horizontally
 * - Has NO header or bottom navigation
 * - Provides a clean, minimal appearance
 * - Works within the [locale] segment
 * - Includes a subtle branding element (logo link)
 */
export default async function AuthLayout({
  children,
  params,
}: AuthLayoutProps) {
  const { locale } = await params;

  // Enable static rendering for this locale
  setRequestLocale(locale);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      {/* Subtle background gradient for visual interest */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Top-left glow */}
        <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        {/* Bottom-right glow */}
        <div className="absolute -bottom-1/4 -right-1/4 h-96 w-96 rounded-full bg-primary-light/5 blur-3xl" />
      </div>

      {/* Logo - links back to home */}
      <header className="absolute left-0 right-0 top-0 z-10 flex justify-center py-8">
        <Link
          href="/"
          className="text-xl font-extrabold text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          The Potential
        </Link>
      </header>

      {/* Main content area - centered */}
      <main className="relative z-10 flex w-full max-w-md flex-col items-center justify-center px-5 py-24">
        {children}
      </main>

      {/* Footer - minimal copyright */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 py-6 text-center">
        <p className="text-caption text-muted">
          &copy; {new Date().getFullYear()} The Potential
        </p>
      </footer>
    </div>
  );
}
