import { ReactNode } from 'react';

/**
 * Root layout - minimal wrapper for Next.js App Router
 *
 * The actual layout with HTML structure, providers, and i18n is handled
 * by src/app/[locale]/layout.tsx which wraps all locale-specific routes.
 *
 * This root layout simply passes through children to allow the [locale]
 * segment to handle all layout responsibilities including:
 * - HTML lang attribute based on current locale
 * - NextIntlClientProvider for translations
 * - React Query Provider
 * - Global styles
 *
 * Note: Do NOT add <html> or <body> tags here as they are rendered
 * by the [locale]/layout.tsx to set the correct lang attribute.
 */
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
