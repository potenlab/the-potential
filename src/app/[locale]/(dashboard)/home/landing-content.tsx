'use client';

/**
 * Home Landing Page
 *
 * A beautifully composed landing page featuring:
 * - Hero section with animated floating orbs, gradient text, glowing search bar
 * - Stats bar with animated counters and dividers
 * - Quick actions with hover arrow animations and backdrop blur
 * - Latest support programs carousel with gradient fade and snap scroll
 * - Trending threads with numbered ranking badges
 * - Featured experts CTA with animated gradient border and moving blobs
 * - Bottom CTA with gradient divider and simplified message
 * - All with premium animations and glow effects following the design system
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  MessageCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Target,
  Rocket,
  Search,
  Lock,
} from 'lucide-react';

import { cn } from '@/lib/cn';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
} from '@/components/ui/skeleton';

import { usePosts } from '@/features/community/api/queries';
import { useSupportPrograms } from '@/features/support-programs/api/queries';
import { PostCard } from '@/features/community/components/post-card';
import { ProgramCard } from '@/features/support-programs/components/program-card';
import type { PostWithAuthor } from '@/features/community/types';
import type { SupportProgramWithBookmark } from '@/features/support-programs/types';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Floating orb configuration for hero background
const floatingOrbs = [
  {
    size: 300,
    color: 'rgba(0,121,255,0.08)',
    x: '15%',
    y: '20%',
    duration: 18,
    delay: 0,
  },
  {
    size: 200,
    color: 'rgba(0,229,255,0.06)',
    x: '75%',
    y: '30%',
    duration: 22,
    delay: 2,
  },
  {
    size: 250,
    color: 'rgba(0,121,255,0.05)',
    x: '60%',
    y: '70%',
    duration: 20,
    delay: 4,
  },
  {
    size: 180,
    color: 'rgba(0,229,255,0.07)',
    x: '25%',
    y: '65%',
    duration: 16,
    delay: 1,
  },
  {
    size: 150,
    color: 'rgba(128,0,255,0.04)',
    x: '85%',
    y: '60%',
    duration: 24,
    delay: 3,
  },
];

// Quick actions configuration with better descriptions
const quickNavItems = [
  {
    href: '/thread',
    labelKey: 'quickActions.writePost' as const,
    description: 'Share experiences and connect with founders',
    icon: MessageCircle,
    gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    hoverGlow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
  },
  {
    href: '/experts',
    labelKey: 'quickActions.findExpert' as const,
    description: 'Get matched with verified industry experts',
    icon: Users,
    gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    hoverGlow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
  },
  {
    href: '/support-programs',
    labelKey: 'quickActions.browsePrograms' as const,
    description: 'Discover funding and mentoring opportunities',
    icon: FileText,
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    hoverGlow: 'group-hover:shadow-[0_0_30px_rgba(52,211,153,0.15)]',
  },
];

// Stats configuration
const statsConfig = [
  { value: '2,500+', labelKey: 'stats.members' as const, icon: Users },
  { value: '150+', labelKey: 'stats.experts' as const, icon: Target },
  { value: '80+', labelKey: 'stats.programs' as const, icon: Rocket },
  { value: '500+', labelKey: 'stats.collaborations' as const, icon: TrendingUp },
];

/**
 * Floating Orb Component
 * Animated background element that floats infinitely
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
 * Hero Section Component
 * Centered layout with floating orbs, pulsating logo, gradient brand text,
 * glowing search bar, and popular tags.
 */
function HeroSection() {
  const t = useTranslations('home');

  // Popular search tags for quick access
  const searchTags = [
    { key: 'hero.searchTags.seed' as const, href: '/support-programs' },
    { key: 'hero.searchTags.cto' as const, href: '/experts' },
    { key: 'hero.searchTags.startup' as const, href: '/support-programs' },
  ];

  return (
    <motion.section
      variants={itemVariants}
      className="relative -mx-4 -mt-6 mb-16 overflow-hidden px-4 py-16 md:-mx-8 md:px-8 md:py-24"
    >
      {/* Black base background */}
      <div className="absolute inset-0 bg-black" />

      {/* Animated floating orbs */}
      {floatingOrbs.map((orb, index) => (
        <FloatingOrb key={index} {...orb} />
      ))}

      {/* Radial gradient background - blue glow from center top */}
      <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,121,255,0.15)_0%,rgba(0,121,255,0.05)_40%,transparent_70%)]" />
      <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.08)_0%,transparent_60%)]" />

      {/* Subtle animated grain / noise overlay for texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,121,255,0.03)_0%,transparent_50%)]" />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Logo "P" with pulsating glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative mb-8"
        >
          {/* Pulsating glow behind logo */}
          <motion.div
            className="absolute -inset-3 rounded-2xl bg-primary/20 blur-xl"
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#121212] shadow-[0_0_30px_rgba(0,121,255,0.3)]">
            <span className="bg-gradient-to-br from-primary to-primary-light bg-clip-text text-2xl font-bold text-transparent">
              P
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <span className="block text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl lg:text-[4.5rem]">
            {t('hero.headlineTop')}
          </span>
          {/* Gradient text for brand name */}
          <span className="mt-1 block bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent md:text-6xl lg:text-[4.5rem]">
            {t('hero.headlineBrand')}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mb-6 max-w-xl"
        >
          <p className="text-lg leading-relaxed text-[#8B95A1] md:text-xl">
            {t('hero.subtitleLine1')}
          </p>
          <p className="text-lg leading-relaxed text-[#8B95A1] md:text-xl">
            {t('hero.subtitleLine2')}
          </p>
        </motion.div>

        {/* Active founders count */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="mb-10 flex items-center gap-2 text-base text-primary-light md:text-lg"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="h-4 w-4" />
          </motion.div>
          <span>{t('hero.activeFounders', { count: '1,247' })}</span>
        </motion.div>

        {/* Search Bar with glowing border on focus */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="mb-5 w-full max-w-2xl"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#121212]/80 px-5 py-4 backdrop-blur-sm transition-all duration-300 focus-within:border-primary/40 focus-within:shadow-[0_0_20px_rgba(0,121,255,0.15)]">
            <Search className="h-5 w-5 shrink-0 text-[#8B95A1]" />
            <input
              type="text"
              placeholder={t('hero.searchPlaceholder')}
              className="w-full bg-transparent text-base text-white caret-primary placeholder-[#6B7280] outline-none ring-0 focus:outline-none focus:ring-0 md:text-lg"
            />
          </div>
        </motion.div>

        {/* Popular Search Tags */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <span className="flex items-center gap-1.5 text-sm text-[#8B95A1] md:text-base">
            <TrendingUp className="h-3.5 w-3.5" />
            {t('hero.popularSearches')}
          </span>
          {searchTags.map((tag) => (
            <Link key={tag.key} href={tag.href}>
              <motion.span
                className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-white/80 backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-white md:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                {t(tag.key)}
              </motion.span>
            </Link>
          ))}
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

/**
 * Stats Bar Component
 * Horizontal row of stats with spring animation and dividers
 */
function StatsBar() {
  const t = useTranslations('home');

  return (
    <motion.section variants={itemVariants} className="mb-16">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.labelKey}
              variants={scaleInVariants}
              custom={index}
            >
              <div className="relative h-full">
                {/* Divider line between stats on desktop (not on last item) */}
                {index < statsConfig.length - 1 && (
                  <div className="absolute -right-2 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-white/[0.08] to-transparent md:block" />
                )}
                <Card
                  variant="glow"
                  padding="md"
                  className="group relative h-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,121,255,0.2)]"
                >
                  {/* Subtle gradient background behind each stat */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <CardContent className="relative z-10 flex flex-col items-center justify-center gap-2 text-center">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Icon className="h-5 w-5 text-primary md:h-6 md:w-6" />
                    </motion.div>
                    <motion.div
                      className="text-h3 font-extrabold text-white"
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 12,
                        delay: index * 0.1,
                      }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm text-muted md:text-base">
                      {t(stat.labelKey)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

/**
 * Quick Actions Section Component
 * Feature cards with animated arrow on hover and backdrop blur
 */
function QuickActionsSection() {
  const t = useTranslations('home');

  return (
    <motion.section variants={itemVariants} className="mb-16">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-1 w-12 rounded-full bg-gradient-to-r from-primary to-cyan-500 shadow-[0_0_20px_rgba(0,121,255,0.4)]" />
        <h2 className="text-section font-extrabold text-white">
          {t('quickActions.title')}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Card
                  variant="interactive"
                  padding="lg"
                  className={cn(
                    'group h-full bg-gradient-to-br backdrop-blur-sm transition-all duration-300',
                    item.hoverGlow,
                    item.gradient
                  )}
                >
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <motion.div
                        className={cn(
                          'flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300',
                          'group-hover:scale-110 group-hover:shadow-lg',
                          item.iconBg
                        )}
                        whileHover={{
                          boxShadow: '0 0 20px rgba(0,121,255,0.2)',
                        }}
                      >
                        <Icon className={cn('h-7 w-7', item.iconColor)} />
                      </motion.div>
                      {/* Animated arrow that slides in on hover */}
                      <motion.div
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        initial={{ x: -8, opacity: 0 }}
                        whileHover={{ x: 0, opacity: 1 }}
                      >
                        <ArrowRight className="h-4 w-4 text-white/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white" />
                      </motion.div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-white">
                        {t(item.labelKey)}
                      </h3>
                      <p className="text-base leading-relaxed text-muted">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.section>
  );
}

/**
 * Section Header Component
 * Reusable header with glow accent and "View All" link
 */
function SectionHeader({
  title,
  viewAllHref,
  viewAllLabel,
}: {
  title: string;
  viewAllHref: string;
  viewAllLabel: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-1 w-12 rounded-full bg-gradient-to-r from-primary to-cyan-500 shadow-[0_0_20px_rgba(0,121,255,0.4)]" />
        <h2 className="text-section font-extrabold text-white">{title}</h2>
      </div>
      <Link href={viewAllHref}>
        <Button
          variant="ghost"
          size="sm"
          className="group gap-1.5 text-primary hover:text-cyan-400"
        >
          {viewAllLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  );
}

/**
 * Support Programs Section Component
 * Horizontal scrolling carousel with snap scrolling and gradient fade edges
 * Shows partial view with sign-in overlay when user is not logged in
 */
function SupportProgramsSection() {
  const t = useTranslations('home');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data, isLoading, error } = useSupportPrograms({
    showUpcoming: true,
  });

  const programs: SupportProgramWithBookmark[] = data?.programs ?? [];

  if (error) {
    return null;
  }

  // Limit to 2 cards for non-authenticated users
  const visiblePrograms = isAuthenticated ? programs : programs.slice(0, 2);

  return (
    <motion.section variants={itemVariants} className="mb-16">
      <SectionHeader
        title={t('latestPrograms')}
        viewAllHref="/support-programs"
        viewAllLabel={t('viewAll')}
      />

      {isLoading ? (
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-[320px] shrink-0">
                <Card variant="elevated" padding="none">
                  <Skeleton className="h-32 w-full" rounded="none" />
                  <CardContent className="space-y-3 p-4">
                    <Skeleton className="h-5 w-3/4" rounded="md" />
                    <Skeleton className="h-4 w-1/2" rounded="md" />
                    <SkeletonText lines={2} />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : programs.length === 0 ? (
        <Card variant="elevated" padding="lg">
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted" />
            <p className="text-muted">{t('noActivity')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Gradient fade on right edge */}
          {isAuthenticated && (
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-black to-transparent md:w-24" />
          )}

          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex snap-x snap-mandatory gap-4 pb-4">
              {visiblePrograms.map((program) => (
                <div key={program.id} className="snap-start">
                  <ProgramCard
                    program={program}
                    onClick={() => {
                      window.location.href = `/support-programs?id=${program.id}`;
                    }}
                  />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Sign-in overlay for non-authenticated users */}
          {!authLoading && !isAuthenticated && programs.length > 2 && (
            <div className="relative mt-4">
              {/* Blurred preview of hidden cards */}
              <div className="pointer-events-none relative h-32 overflow-hidden rounded-2xl">
                <div className="flex gap-4 blur-md opacity-50">
                  {programs.slice(2, 4).map((program) => (
                    <div key={program.id} className="w-[320px] shrink-0">
                      <Card variant="elevated" padding="none" className="h-full">
                        <div className="h-16 w-full bg-card-secondary" />
                        <CardContent className="space-y-2 p-3">
                          <div className="h-4 w-3/4 rounded bg-white/10" />
                          <div className="h-3 w-1/2 rounded bg-white/5" />
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
                {/* Gradient overlay on top of blurred cards */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
              </div>

              {/* Sign-in CTA */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-muted">
                  {t('signInToSeeMore')}
                </p>
                <Link href="/login">
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-2"
                  >
                    {t('signInButton')}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.section>
  );
}

/**
 * Trending Threads Section Component
 * Recent posts with numbered ranking badges and accent borders
 */
function TrendingThreadsSection() {
  const t = useTranslations('home');
  const { data, isLoading, error } = usePosts();

  const recentPosts: PostWithAuthor[] =
    data?.pages.flatMap((page) => page.posts).slice(0, 3) ?? [];

  if (error) {
    return null;
  }

  return (
    <motion.section variants={itemVariants} className="mb-16">
      <SectionHeader
        title={t('trendingThreads')}
        viewAllHref="/thread"
        viewAllLabel={t('viewAll')}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="elevated" padding="md">
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <SkeletonAvatar size="md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" rounded="md" />
                    <Skeleton className="h-3 w-24" rounded="md" />
                  </div>
                </div>
                <SkeletonText lines={2} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : recentPosts.length === 0 ? (
        <Card variant="elevated" padding="lg">
          <CardContent className="py-12 text-center">
            <MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted" />
            <p className="text-muted">{t('noActivity')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recentPosts.map((post, index) => (
            <motion.div
              key={post.id}
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <PostCard
                post={post}
                onClick={() => {
                  window.location.href = `/thread/${post.id}`;
                }}
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
}

/**
 * Featured Experts CTA Section Component
 * Clean, premium card with horizontal layout and subtle accents
 */
function FeaturedExpertsCTA() {
  const t = useTranslations('home');

  return (
    <motion.section variants={itemVariants} className="mb-16">
      <Card
        variant="elevated"
        padding="lg"
        className="group relative overflow-hidden transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/30"
      >
        {/* Thin gradient accent line at the top */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#0079FF]/50 to-transparent" />

        <CardContent className="relative flex flex-col items-center gap-8 py-8 md:flex-row md:items-center md:justify-between md:gap-12 md:py-10">
          {/* Left side - Text content */}
          <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0079FF]/10">
              <Users className="h-6 w-6 text-[#0079FF]" />
            </div>

            <h3 className="mb-2 text-3xl font-bold tracking-tight text-white">
              {t('featuredExperts')}
            </h3>
            <p className="mb-6 max-w-md text-lg leading-relaxed text-[#8B95A1]">
              Connect with industry-leading experts who can accelerate your
              startup journey. Get personalized guidance and unlock growth
              opportunities.
            </p>

            <Link href="/experts">
              <Button
                variant="primary"
                size="lg"
                className="gap-2"
              >
                {t('viewAll')}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>

          {/* Right side - Expert avatars visual */}
          <div className="relative flex shrink-0 items-center justify-center">
            {/* Subtle ambient glow behind avatars */}
            <div className="absolute h-32 w-32 rounded-full bg-[#0079FF]/[0.06] blur-2xl" />

            <div className="relative grid grid-cols-3 gap-3">
              {[
                'bg-gradient-to-br from-[#0079FF]/20 to-[#0079FF]/5',
                'bg-gradient-to-br from-white/10 to-white/[0.03]',
                'bg-gradient-to-br from-[#0079FF]/15 to-[#0079FF]/[0.03]',
              ].map((gradient, i) => (
                <div
                  key={i}
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] ${gradient}`}
                >
                  <Users className="h-6 w-6 text-white/40" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}

/**
 * Bottom CTA Section
 * Simplified closing engagement prompt with gradient divider
 */
function BottomCTA() {
  const t = useTranslations('home');
  const tFooter = useTranslations('footer');

  return (
    <motion.section variants={itemVariants} className="mb-8">
      {/* Gradient divider line */}
      <div className="mx-auto mb-10 h-[1px] w-2/3 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-6 py-8 text-center"
      >
        <motion.div
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-[0_0_20px_rgba(0,121,255,0.15)]"
          animate={{
            boxShadow: [
              '0 0 20px rgba(0,121,255,0.15)',
              '0 0 30px rgba(0,121,255,0.25)',
              '0 0 20px rgba(0,121,255,0.15)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="h-7 w-7 text-primary" />
        </motion.div>

        <div className="max-w-md">
          <h3 className="mb-2 text-2xl font-bold text-white">
            {tFooter('description')}
          </h3>
          <p className="text-base text-muted">
            Join thousands of founders building the future
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/thread">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-white/10 transition-all duration-200 hover:border-primary/30 hover:shadow-[0_0_15px_rgba(0,121,255,0.1)]"
              >
                <MessageCircle className="h-4 w-4" />
                {t('quickActions.writePost')}
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </motion.section>
  );
}

/**
 * Home Landing Page
 */
export default function HomePage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-6"
    >
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Bar */}
      <StatsBar />

      {/* Quick Actions */}
      <QuickActionsSection />

      {/* Support Programs */}
      <SupportProgramsSection />

      {/* Trending Threads */}
      <TrendingThreadsSection />

      {/* Featured Experts CTA */}
      <FeaturedExpertsCTA />

      {/* Bottom CTA */}
      <BottomCTA />
    </motion.div>
  );
}
