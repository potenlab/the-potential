import { use } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { redirect } from 'next/navigation';

/**
 * Home Page (Locale Root)
 *
 * Redirects authenticated users to /home dashboard.
 * Redirects unauthenticated users to /login.
 * Uses next-intl for internationalization.
 */

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: `The Potential`,
    description: t('description'),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}`])
      ),
    },
  };
}

export default function HomePage({ params }: HomePageProps) {
  const { locale } = use(params);

  // Enable static rendering - MUST be called before useTranslations
  setRequestLocale(locale);

  // Redirect to login page for now
  // TODO: Add auth check - redirect to /home if authenticated
  redirect(`/${locale}/login`);
}
