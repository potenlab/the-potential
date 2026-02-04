import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Landing page for the locale segment
 * Displays the design system verification content with i18n support
 */
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  // Enable static rendering - must be called before useTranslations
  setRequestLocale(locale);

  return <HomeContent />;
}

/**
 * Home content component using translations
 */
function HomeContent() {
  const t = useTranslations('common');

  return (
    <div className="min-h-screen bg-background p-5 md:p-8">
      <main className="mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-h1 text-text">The Potential</h1>
          <p className="text-body text-muted">
            Design System Verification - Task 1.3 (with i18n)
          </p>
        </header>

        {/* Color Palette Section */}
        <section className="space-y-6">
          <h2 className="text-h2">Color Palette</h2>

          {/* Primary Colors */}
          <div className="space-y-3">
            <h3 className="text-h3 text-muted">Primary Colors</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-primary" />
                <span className="text-caption">Primary #0079FF</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-primary-light" />
                <span className="text-caption">Primary Light #00E5FF</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-primary-10" />
                <span className="text-caption">Primary 10%</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-primary-20" />
                <span className="text-caption">Primary 20%</span>
              </div>
            </div>
          </div>

          {/* Semantic Colors */}
          <div className="space-y-3">
            <h3 className="text-h3 text-muted">Semantic Colors</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-success" />
                <span className="text-caption">Success</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-warning" />
                <span className="text-caption">Warning</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-error" />
                <span className="text-caption">Error</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-info" />
                <span className="text-caption">Info</span>
              </div>
            </div>
          </div>

          {/* Background Colors */}
          <div className="space-y-3">
            <h3 className="text-h3 text-muted">Background Colors</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl border border-border bg-background" />
                <span className="text-caption">Background #000</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-card" />
                <span className="text-caption">Card #121212</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-card-secondary" />
                <span className="text-caption">Card Secondary</span>
              </div>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-6">
          <h2 className="text-h2">Cards (24px / rounded-3xl)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Default Card */}
            <div className="card p-5">
              <h3 className="text-section mb-2">Default Card</h3>
              <p className="text-body-sm text-muted">
                Background: #121212, Border: white/8%, Border radius: 24px
              </p>
            </div>

            {/* Interactive Card */}
            <div className="card-interactive cursor-pointer p-5">
              <h3 className="text-section mb-2">Interactive Card</h3>
              <p className="text-body-sm text-muted">
                Hover to see scale + border color change + glow effect
              </p>
            </div>

            {/* Glow Card */}
            <div className="card-glow p-5">
              <h3 className="text-section mb-2">Glow Card</h3>
              <p className="text-body-sm text-muted">
                Primary glow shadow effect always visible
              </p>
            </div>

            {/* Secondary Card */}
            <div className="card-secondary p-5">
              <h3 className="text-section mb-2">Secondary Card</h3>
              <p className="text-body-sm text-muted">
                Background: #1C1C1E (elevated element)
              </p>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="space-y-6">
          <h2 className="text-h2">Buttons</h2>
          <div className="flex flex-wrap items-center gap-4">
            {/* Primary Button */}
            <button className="btn h-12 rounded-2xl bg-primary px-8 text-white hover:bg-primary-hover">
              Primary Button
            </button>

            {/* Primary Glow Button (CTA) */}
            <button className="btn btn-primary-glow h-12 rounded-2xl px-8">
              CTA with Glow
            </button>

            {/* Outline Button */}
            <button className="btn h-12 rounded-2xl border border-border bg-transparent px-8 text-white hover:border-primary-40">
              Outline Button
            </button>

            {/* Ghost Button */}
            <button className="btn h-12 rounded-2xl bg-transparent px-8 text-primary hover:bg-primary-10">
              Ghost Button
            </button>
          </div>
        </section>

        {/* i18n Demo Section */}
        <section className="space-y-6">
          <h2 className="text-h2">i18n Demo</h2>
          <div className="card p-5">
            <p className="text-body">
              <strong>{t('loading')}</strong> - This text comes from translations
            </p>
            <p className="text-body-sm text-muted mt-2">
              Current locale is reflected in the HTML lang attribute.
              Check the page source to verify.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-8 text-center">
          <p className="text-muted">
            Task 1.22: Update Root Layout with NextIntlClientProvider - Complete
          </p>
        </footer>
      </main>
    </div>
  );
}
