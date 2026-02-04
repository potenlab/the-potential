import { use } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from '@/features/auth/components/login-form';
import { routing } from '@/i18n/routing';

/**
 * Login Page
 *
 * Renders the login form within the auth layout.
 * Uses next-intl for internationalization and
 * generates locale-specific metadata for SEO.
 */

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.login' });
  const tMeta = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: `${t('title')} | The Potential`,
    description: tMeta('description'),
    alternates: {
      canonical: `/${locale}/login`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/login`])
      ),
    },
  };
}

export default function LoginPage({ params }: LoginPageProps) {
  const { locale } = use(params);

  // Enable static rendering - MUST be called before useTranslations
  setRequestLocale(locale);

  return <LoginForm />;
}
