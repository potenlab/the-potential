import { use } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { OnboardingForm } from '@/features/auth/components/onboarding-form';
import { routing } from '@/i18n/routing';

/**
 * Onboarding Page
 *
 * Displayed after sign-up completion for new users.
 * Collects: region, industry, level.
 * On submit: updates profile, signs user out, redirects to /?pending=true.
 */

interface OnboardingPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.onboarding' });
  const tMeta = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: `${t('title')} | The Potential`,
    description: tMeta('description'),
    alternates: {
      canonical: `/${locale}/signup/onboarding`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/signup/onboarding`])
      ),
    },
  };
}

export default function OnboardingPage({ params }: OnboardingPageProps) {
  const { locale } = use(params);

  setRequestLocale(locale);

  return <OnboardingForm />;
}
