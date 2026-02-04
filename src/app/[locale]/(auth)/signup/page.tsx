import { use } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { SignupForm } from '@/features/auth/components/signup-form';
import { routing } from '@/i18n/routing';

/**
 * Signup Page
 *
 * Renders the multi-step signup form within the auth layout.
 * Uses next-intl for internationalization and
 * generates locale-specific metadata for SEO.
 */

interface SignupPageProps {
  params: Promise<{ locale: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.signup' });
  const tMeta = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: `${t('title')} | The Potential`,
    description: tMeta('description'),
    alternates: {
      canonical: `/${locale}/signup`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/signup`])
      ),
    },
  };
}

export default function SignupPage({ params }: SignupPageProps) {
  const { locale } = use(params);

  // Enable static rendering - MUST be called before useTranslations
  setRequestLocale(locale);

  return <SignupForm />;
}
