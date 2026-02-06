'use client';

/**
 * About Page Client Component
 *
 * The main landing page that introduces The Potential platform.
 * Features:
 * - Clean hero with platform description
 * - Value proposition cards
 * - Prominent link to support programs
 * - CTA for non-authenticated users
 */

import * as React from 'react';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowRight, Sparkles, Shield, Rocket, Heart, FileText } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layouts/header';
import { Footer } from '@/components/layouts/footer';
import { BottomNav } from '@/components/layouts/bottom-nav';
import { useAuth } from '@/hooks/use-auth';
import { useAuthModalStore } from '@/stores/auth-modal-store';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Floating orbs for background effect
const floatingOrbs = [
  {
    size: 400,
    color: 'rgba(0,121,255,0.06)',
    x: '10%',
    y: '15%',
    duration: 20,
    delay: 0,
  },
  {
    size: 300,
    color: 'rgba(0,229,255,0.04)',
    x: '80%',
    y: '25%',
    duration: 25,
    delay: 2,
  },
  {
    size: 350,
    color: 'rgba(0,121,255,0.04)',
    x: '70%',
    y: '70%',
    duration: 22,
    delay: 4,
  },
];

// Value propositions configuration
const valuePropsConfig = [
  {
    key: 'experts' as const,
    icon: Shield,
    gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    borderGlow: 'hover:border-blue-500/20',
  },
  {
    key: 'programs' as const,
    icon: Rocket,
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    borderGlow: 'hover:border-emerald-500/20',
  },
  {
    key: 'community' as const,
    icon: Heart,
    gradient: 'from-purple-500/20 via-purple-500/5 to-transparent',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    borderGlow: 'hover:border-purple-500/20',
  },
];

/**
 * Floating Orb Component
 */
function FloatingOrb({
  size,
  color,
  x,
  y,
  duration,
  delay,
}: {
  size: number;
  color: string;
  x: string;
  y: string;
  duration: number;
  delay: number;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full blur-3xl"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        left: x,
        top: y,
      }}
      animate={{
        x: [0, 30, -20, 15, 0],
        y: [0, -25, 15, -10, 0],
        scale: [1, 1.1, 0.95, 1.05, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
    />
  );
}

/**
 * Hero Section
 */
function HeroSection() {
  const t = useTranslations('home');
  const { isAuthenticated, loading } = useAuth();
  const openLogin = useAuthModalStore((s) => s.openLogin);

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Floating orbs background */}
      {floatingOrbs.map((orb, index) => (
        <FloatingOrb key={index} {...orb} />
      ))}

      {/* Radial gradient background */}
      <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,121,255,0.12)_0%,rgba(0,121,255,0.04)_40%,transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Logo icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8 inline-flex"
        >
          <motion.div
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#121212] shadow-[0_0_30px_rgba(0,121,255,0.3)]"
            animate={{
              boxShadow: [
                '0 0 30px rgba(0,121,255,0.2)',
                '0 0 40px rgba(0,121,255,0.35)',
                '0 0 30px rgba(0,121,255,0.2)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="from-primary to-primary-light bg-gradient-to-br bg-clip-text text-2xl font-bold text-transparent">
              P
            </span>
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 text-4xl leading-tight font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl"
        >
          {t('hero.headlineTop')}
          <span className="from-primary via-primary-light to-primary mt-2 block bg-gradient-to-r bg-clip-text text-transparent">
            {t('hero.headlineBrand')}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mb-8 text-lg leading-relaxed text-[#8B95A1] md:text-xl"
        >
          {t('hero.subtitleLine1')} {t('hero.subtitleLine2')}
        </motion.p>

        {/* Active founders count */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="text-primary-light mb-8 flex items-center justify-center gap-2 text-base"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="h-4 w-4" />
          </motion.div>
          <span>{t('hero.activeFounders', { count: '1,247' })}</span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {/* Primary CTA - Support Programs */}
          <Link href="/support-programs">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="primary"
                size="lg"
                className="gap-2 px-8 shadow-[0_0_25px_rgba(0,121,255,0.3)]"
              >
                <FileText className="h-5 w-5" />
                {t('quickActions.browsePrograms')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </Link>

          {/* Secondary CTA - Get Started (for non-auth users) */}
          {!loading && !isAuthenticated && (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="lg"
                onClick={openLogin}
                className="hover:border-primary/30 gap-2 border-white/10"
              >
                <Sparkles className="h-4 w-4" />
                {t('landing.ctaSection.button')}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Value Propositions Section
 */
function ValuePropsSection() {
  const t = useTranslations('home');

  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <div className="from-primary mx-auto mb-4 h-1 w-12 rounded-full bg-gradient-to-r to-cyan-500" />
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          {t('landing.valueProps.title')}
        </h2>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {valuePropsConfig.map((prop, index) => {
          const Icon = prop.icon;
          return (
            <motion.div
              key={prop.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
            >
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div
                  className={cn(
                    'group relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300',
                    prop.borderGlow
                  )}
                >
                  {/* Gradient background */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                      prop.gradient
                    )}
                  />

                  <div className="relative z-10">
                    <div
                      className={cn(
                        'mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110',
                        prop.iconBg
                      )}
                    >
                      <Icon className={cn('h-6 w-6', prop.iconColor)} />
                    </div>

                    <h3 className="mb-2 text-lg font-bold text-white">
                      {t(`landing.valueProps.${prop.key}.title`)}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#8B95A1]">
                      {t(`landing.valueProps.${prop.key}.description`)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Support Programs CTA Section
 */
function SupportProgramsCTA() {
  const t = useTranslations('home');

  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="from-primary/10 relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br via-transparent to-cyan-500/5 p-8 md:p-12"
      >
        {/* Background decorations */}
        <div className="absolute top-0 right-0 h-[300px] w-[300px] translate-x-1/4 -translate-y-1/4 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,121,255,0.15)_0%,transparent_70%)]" />

        <div className="relative z-10 flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
          {/* Icon */}
          <motion.div
            className="bg-primary/10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
            animate={{
              boxShadow: [
                '0 0 20px rgba(0,121,255,0.2)',
                '0 0 30px rgba(0,121,255,0.3)',
                '0 0 20px rgba(0,121,255,0.2)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FileText className="text-primary h-8 w-8" />
          </motion.div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl">
              {t('landing.programsPreview.title')}
            </h3>
            <p className="text-base text-[#8B95A1]">{t('landing.programsPreview.subtitle')}</p>
          </div>

          {/* CTA Button */}
          <Link href="/support-programs">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button variant="primary" size="lg" className="gap-2 whitespace-nowrap">
                {t('viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

/**
 * Main About Page Client Component
 */
export default function AboutPageClient() {
  const searchParams = useSearchParams();
  const isPending = searchParams.get('pending') === 'true';
  const isAuthError = searchParams.get('auth_error') === 'true';
  const t = useTranslations('auth.login');

  useEffect(() => {
    if (isPending) {
      toast.warning(t('pendingApproval'));
    }
    if (isAuthError) {
      toast.error(t('googleLoginFailed'));
    }
  }, [isPending, isAuthError, t]);

  return (
    <div className="bg-background relative min-h-screen">
      <Header />
      <main className="pt-20 pb-24 md:pb-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-7xl px-4 md:px-8"
        >
          <HeroSection />
          <ValuePropsSection />
          <SupportProgramsCTA />
        </motion.div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
