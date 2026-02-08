import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import AboutPageClient from '../../about-page-client';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: 'The Potential',
    description: t('description'),
    alternates: {
      canonical: `/${locale}/about`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/about`])
      ),
    },
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense>
      <AboutPageClient />
    </Suspense>
  );
}
