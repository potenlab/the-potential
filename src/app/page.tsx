import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

/**
 * Root Page
 *
 * Redirects to the default locale.
 * This handles the case when users visit the root URL without a locale.
 */
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
