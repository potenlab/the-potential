'use client';

/**
 * Home Dashboard Page
 *
 * The main landing page for authenticated users featuring:
 * - Personalized welcome section with user name interpolation
 * - Recent thread posts preview
 * - Horizontal scrolling support programs carousel
 * - Quick navigation cards to key sections
 * - Staggered animation on load
 *
 * Uses:
 * - Card, Carousel, Scroll-area from @/components/ui/
 * - PostCard from @/features/community/components/
 * - ProgramCard from @/features/support-programs/components/
 * - useTranslations('home') for all text content
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  Briefcase,
  MessageCircle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

import { cn } from '@/lib/cn';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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

// Animation variants for staggered entrance
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
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Quick navigation items configuration
const quickNavItems = [
  {
    href: '/thread',
    labelKey: 'quickActions.writePost' as const,
    icon: MessageCircle,
    color: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
  },
  {
    href: '/experts',
    labelKey: 'quickActions.findExpert' as const,
    icon: Users,
    color: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
  },
  {
    href: '/support-programs',
    labelKey: 'quickActions.browsePrograms' as const,
    icon: FileText,
    color: 'from-emerald-500/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
  },
  {
    href: '/clubs',
    labelKey: 'quickActions.joinClub' as const,
    icon: Briefcase,
    color: 'from-orange-500/20 to-orange-600/5',
    iconColor: 'text-orange-400',
  },
];

/**
 * Welcome Section Component
 * Displays personalized greeting with user name interpolation
 */
function WelcomeSection({ userName }: { userName?: string | null }) {
  const t = useTranslations('home');

  // Determine greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'greeting.morning';
    if (hour < 18) return 'greeting.afternoon';
    return 'greeting.evening';
  };

  const greeting = userName
    ? t(getGreeting(), { name: userName })
    : t('welcomeGuest');

  return (
    <motion.div variants={itemVariants} className="mb-8">
      <h1 className="text-2xl font-bold text-white md:text-3xl lg:text-4xl">
        {greeting}
      </h1>
      <p className="mt-2 text-muted">
        {userName ? t('welcomeGuest').replace('!', '') : ''}
      </p>
    </motion.div>
  );
}

/**
 * Quick Actions Section Component
 * Grid of navigation cards leading to main sections
 */
function QuickActionsSection() {
  const t = useTranslations('home');

  return (
    <motion.section variants={itemVariants} className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-white">
        {t('quickActions.title')}
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {quickNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card
                variant="interactive"
                padding="sm"
                className={cn(
                  'group h-full bg-gradient-to-br transition-all duration-300',
                  'hover:shadow-lg hover:shadow-primary/10',
                  item.color
                )}
              >
                <CardContent className="flex flex-col items-center justify-center gap-3 p-4 text-center">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-2xl',
                      'bg-white/5 backdrop-blur-sm transition-transform duration-300',
                      'group-hover:scale-110',
                      item.iconColor
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-white/90">
                    {t(item.labelKey)}
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </motion.section>
  );
}

/**
 * Section Header Component
 * Reusable header with title and "View All" link
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
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <Link href={viewAllHref}>
        <Button variant="ghost" size="sm" className="gap-1 text-primary">
          {viewAllLabel}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

/**
 * Thread Preview Section Component
 * Shows recent posts from the community feed
 */
function ThreadPreviewSection() {
  const t = useTranslations('home');
  const { data, isLoading, error } = usePosts();

  // Get first 3 posts from the feed
  const recentPosts: PostWithAuthor[] =
    data?.pages.flatMap((page) => page.posts).slice(0, 3) ?? [];

  if (error) {
    return (
      <Card variant="default" padding="md">
        <CardContent className="py-8 text-center text-muted">
          {t('noActivity')}
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.section variants={itemVariants} className="mb-8">
      <SectionHeader
        title={t('trendingThreads')}
        viewAllHref="/thread"
        viewAllLabel={t('viewAll')}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="default" padding="md">
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
        <Card variant="default" padding="md">
          <CardContent className="py-8 text-center text-muted">
            {t('noActivity')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recentPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onClick={() => {
                // Navigate to post detail
                window.location.href = `/thread/${post.id}`;
              }}
            />
          ))}
        </div>
      )}
    </motion.section>
  );
}

/**
 * Support Programs Section Component
 * Horizontal scrolling carousel of support programs
 */
function SupportProgramsSection() {
  const t = useTranslations('home');
  const { data, isLoading, error } = useSupportPrograms({
    showUpcoming: true,
  });

  const programs: SupportProgramWithBookmark[] = data?.programs ?? [];

  if (error) {
    return null;
  }

  return (
    <motion.section variants={itemVariants} className="mb-8">
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
                <Card variant="default" padding="none">
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
        <Card variant="default" padding="md">
          <CardContent className="py-8 text-center text-muted">
            {t('noActivity')}
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onClick={() => {
                  // Could open detail modal or navigate
                  // For now, just navigate to support programs page
                  window.location.href = `/support-programs?id=${program.id}`;
                }}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </motion.section>
  );
}

/**
 * Featured Experts Section Component
 * Preview of recommended experts
 */
function FeaturedExpertsSection() {
  const t = useTranslations('home');

  // TODO: Implement when expert query hook is available
  // For now, show a placeholder with navigation to experts page

  return (
    <motion.section variants={itemVariants} className="mb-8">
      <SectionHeader
        title={t('featuredExperts')}
        viewAllHref="/experts"
        viewAllLabel={t('viewAll')}
      />

      <Card variant="gradient" padding="lg">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {t('featuredExperts')}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {t('quickActions.findExpert')}
            </p>
          </div>
          <Link href="/experts">
            <Button variant="primary" className="gap-2">
              {t('viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.section>
  );
}

/**
 * Home Dashboard Page
 */
export default function HomePage() {
  // TODO: Get actual user data from auth context
  // For now, using a placeholder name
  const userName = 'User'; // This would come from auth context

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-6"
    >
      {/* Welcome Section */}
      <WelcomeSection userName={userName} />

      {/* Quick Actions Grid */}
      <QuickActionsSection />

      {/* Support Programs Carousel */}
      <SupportProgramsSection />

      {/* Thread Preview */}
      <ThreadPreviewSection />

      {/* Featured Experts */}
      <FeaturedExpertsSection />
    </motion.div>
  );
}
