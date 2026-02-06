import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { routing, type Locale } from '@/i18n/routing';
import { Providers } from '@/app/providers';
import { AuthGuard } from '@/components/common/auth-guard';
import { AuthModal } from '@/features/auth/components/auth-modal';
import '@/app/globals.css';

/**
 * Generate static params for all supported locales
 * This enables static rendering for each locale
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Generate locale-specific metadata with alternates for SEO
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const titles: Record<Locale, string> = {
    ko: 'The Potential - 초기 창업자를 위한 신뢰 기반 플랫폼',
    en: 'The Potential - Trust-based Platform for Early-stage Founders',
  };

  const descriptions: Record<Locale, string> = {
    ko: '검증된 전문가 매칭과 창업자 네트워킹을 통해 스타트업 성장을 지원합니다.',
    en: 'Supporting startup growth through verified expert matching and founder networking.',
  };

  const validLocale = hasLocale(routing.locales, locale)
    ? (locale as Locale)
    : routing.defaultLocale;

  return {
    title: {
      default: titles[validLocale],
      template: `%s | The Potential`,
    },
    description: descriptions[validLocale],
    alternates: {
      canonical: `/${validLocale}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}`])
      ),
    },
    openGraph: {
      title: titles[validLocale],
      description: descriptions[validLocale],
      locale: validLocale,
      alternateLocale: routing.locales.filter((l) => l !== validLocale),
    },
  };
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Root layout for locale-based routing
 *
 * This layout:
 * - Validates the incoming locale against supported locales
 * - Calls notFound() if locale is invalid
 * - Enables static rendering with setRequestLocale()
 * - Loads messages for the current locale
 * - Wraps children with NextIntlClientProvider for client-side translations
 */
export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  // Await params as it's a Promise in Next.js 15+
  const { locale } = await params;

  // Validate that the incoming locale is supported
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering for this locale
  // This must be called before any hooks like useTranslations
  setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
            <AuthGuard />
            <AuthModal />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
