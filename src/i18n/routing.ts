import { defineRouting } from 'next-intl/routing';

/**
 * Central routing configuration for next-intl
 *
 * Supports:
 * - Korean (ko) as default locale
 * - English (en) as secondary locale
 * - Always show locale prefix in URL (including default)
 * - Automatic locale detection from browser preferences
 */
export const routing = defineRouting({
  // Supported locales
  locales: ['ko', 'en'],

  // Korean is the default locale
  defaultLocale: 'ko',

  // Always show locale prefix in URL (including default)
  localePrefix: 'always',

  // Enable locale detection from browser preferences
  localeDetection: true,
});

// Export type for locale
export type Locale = (typeof routing.locales)[number];
