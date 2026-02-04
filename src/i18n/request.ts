import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

/**
 * Server-side request configuration for next-intl
 *
 * This configuration is called for each request and:
 * - Validates that the incoming locale is supported
 * - Falls back to default locale if not supported
 * - Loads the correct messages based on locale
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming locale is supported
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
