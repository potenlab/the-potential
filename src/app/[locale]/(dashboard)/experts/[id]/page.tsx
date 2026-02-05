'use client';

/**
 * Expert Profile Page
 *
 * Displays a full expert profile with all sections.
 *
 * Features:
 * - Dynamic route [id] for expert profile
 * - Uses useExpert(id) hook to fetch data
 * - ExpertProfileHeader (hero section with avatar, info, stats)
 * - ExpertiseSection (category, skills, experience years)
 * - CollaborationNeedsSection (what they're looking for)
 * - ExperienceSection (work history, education)
 * - PortfolioSection (links, files)
 * - Sticky CTA bar at bottom on mobile
 * - Fixed sidebar CTA on desktop
 * - CollaborationModal and CoffeeChatModal
 * - Loading skeleton state
 * - 404 handling when expert not found
 * - Back navigation to experts list
 *
 * Uses customized components from @/components/ui/ and
 * expert feature components from @/features/experts
 */

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Coffee, Handshake, Share2, UserX } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useAuthModalStore } from '@/stores/auth-modal-store';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
  SkeletonCard,
} from '@/components/ui/skeleton';

// Expert Feature Components
import {
  ExpertProfileHeader,
  ExpertiseSection,
  CollaborationNeedsSection,
  ExperienceSection,
  PortfolioSection,
  CollaborationModal,
  CoffeeChatModal,
} from '@/features/experts/components';

// Expert API Hooks
import { useExpert } from '@/features/experts/api/queries';

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

/**
 * Profile Header Skeleton - Loading state for the header
 */
function ProfileHeaderSkeleton() {
  return (
    <Card variant="elevated" padding="none" className="overflow-hidden">
      <CardContent className="p-5 md:p-8">
        {/* Avatar and Main Info */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Avatar */}
          <div className="flex justify-center md:justify-start">
            <SkeletonAvatar size="xl" />
          </div>

          {/* Main Info */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            {/* Name and badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <Skeleton className="h-8 w-48" rounded="lg" />
              <Skeleton className="h-6 w-20" rounded="full" />
              <Skeleton className="h-6 w-24" rounded="full" />
            </div>

            {/* Company */}
            <Skeleton className="h-5 w-40 mx-auto md:mx-0" rounded="md" />

            {/* Category badge */}
            <div className="flex justify-center md:justify-start">
              <Skeleton className="h-7 w-24" rounded="full" />
            </div>

            {/* Bio */}
            <div className="max-w-2xl mx-auto md:mx-0">
              <SkeletonText lines={3} />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-6 w-20" rounded="full" />
              ))}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mt-6 mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" rounded="2xl" />
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-12 flex-1" rounded="2xl" />
          <Skeleton className="h-12 flex-1" rounded="2xl" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Section Skeleton - Generic loading state for content sections
 */
function SectionSkeleton() {
  return (
    <Card variant="default" padding="md">
      <CardContent className="space-y-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" rounded="md" />
          <Skeleton className="h-6 w-32" rounded="md" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-3/4" rounded="md" />
          <Skeleton className="h-5 w-1/2" rounded="md" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-7 w-24" rounded="full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Full Page Skeleton - Loading state for the entire page
 */
function PageSkeleton() {
  return (
    <div className="space-y-6">
      <ProfileHeaderSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionSkeleton />
          <SectionSkeleton />
          <SectionSkeleton />
        </div>
        <div className="hidden lg:block">
          <SkeletonCard className="h-48 sticky top-24" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// NOT FOUND COMPONENT
// ============================================================================

/**
 * Not Found State - When expert doesn't exist
 */
function ExpertNotFound() {
  const t = useTranslations('errors.notFound');
  const tExperts = useTranslations('experts');

  return (
    <Card variant="default" padding="lg" className="text-center">
      <CardContent className="py-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
          <UserX className="h-8 w-8 text-muted" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">{t('title')}</h2>
        <p className="text-muted mb-6">{t('description')}</p>
        <Button variant="primary" asChild>
          <Link href="/experts">{tExperts('title')}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// STICKY CTA BAR (MOBILE)
// ============================================================================

interface StickyCTABarProps {
  onCoffeeChat: () => void;
  onCollaboration: () => void;
  isAvailable: boolean;
  isLoading: boolean;
  isOwnProfile?: boolean;
}

/**
 * Sticky CTA Bar - Fixed at bottom on mobile
 */
function StickyCTABar({
  onCoffeeChat,
  onCollaboration,
  isAvailable,
  isLoading,
  isOwnProfile = false,
}: StickyCTABarProps) {
  const t = useTranslations('experts.profile');

  // Hide the sticky CTA bar if viewing own profile
  if (isOwnProfile) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 lg:hidden',
        'bg-black/95 backdrop-blur-md border-t border-white/[0.08]',
        'p-4 pb-safe'
      )}
    >
      <div className="flex gap-3 max-w-lg mx-auto">
        <Button
          variant="secondary"
          size="lg"
          onClick={onCoffeeChat}
          disabled={isLoading || !isAvailable}
          leftIcon={<Coffee className="h-5 w-5" />}
          className="flex-1"
        >
          {t('coffeeChat')}
        </Button>
        <Button
          variant="primary-glow"
          size="lg"
          onClick={onCollaboration}
          disabled={isLoading || !isAvailable}
          loading={isLoading}
          leftIcon={<Handshake className="h-5 w-5" />}
          className="flex-1"
        >
          {t('collaboration')}
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SIDEBAR CTA (DESKTOP)
// ============================================================================

interface SidebarCTAProps {
  onCoffeeChat: () => void;
  onCollaboration: () => void;
  onShare: () => void;
  isAvailable: boolean;
  isLoading: boolean;
  expertName: string;
  isOwnProfile?: boolean;
}

/**
 * Sidebar CTA - Sticky sidebar on desktop
 */
function SidebarCTA({
  onCoffeeChat,
  onCollaboration,
  onShare,
  isAvailable,
  isLoading,
  expertName,
  isOwnProfile = false,
}: SidebarCTAProps) {
  const t = useTranslations('experts.profile');
  const tCommon = useTranslations('common');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="sticky top-24"
    >
      <Card variant="elevated" padding="md">
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="text-center pb-2">
            <h3 className="font-semibold text-white mb-1">{t('contact')}</h3>
            <p className="text-sm text-muted">
              {expertName}
            </p>
          </div>

          {/* Own Profile Notice */}
          {isOwnProfile ? (
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-sm text-muted text-center">
                {t('ownProfile')}
              </p>
            </div>
          ) : (
            <>
              {/* CTA Buttons */}
              <div className="space-y-3">
                <Button
                  variant="primary-glow"
                  size="lg"
                  onClick={onCollaboration}
                  disabled={isLoading || !isAvailable}
                  loading={isLoading}
                  leftIcon={<Handshake className="h-5 w-5" />}
                  className="w-full"
                >
                  {t('collaboration')}
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onCoffeeChat}
                  disabled={isLoading || !isAvailable}
                  leftIcon={<Coffee className="h-5 w-5" />}
                  className="w-full"
                >
                  {t('coffeeChat')}
                </Button>
              </div>

              {/* Availability Notice */}
              {!isAvailable && (
                <p className="text-xs text-muted text-center pt-2">
                  {tCommon('pending')}
                </p>
              )}
            </>
          )}

          <Button
            variant="outline"
            size="md"
            onClick={onShare}
            leftIcon={<Share2 className="h-4 w-4" />}
            className="w-full"
          >
            {t('share')}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

/**
 * Expert Profile Page - Main Component
 */
export default function ExpertProfilePage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('experts');
  const tCommon = useTranslations('common');

  // Auth state
  const { user, isAuthenticated } = useAuth();
  const { openLogin } = useAuthModalStore();

  // Get expert ID from params
  const expertId = React.useMemo(() => {
    const id = params?.id;
    return typeof id === 'string' ? id : null;
  }, [params?.id]);

  // Fetch expert data
  const {
    data: expert,
    isLoading,
    isError,
  } = useExpert(expertId ?? '');

  // Check if the logged-in user is viewing their own expert profile
  const isOwnProfile = React.useMemo(() => {
    if (!user || !expert) return false;
    return user.id === expert.user_id;
  }, [user, expert]);

  // Modal states
  const [isCollaborationModalOpen, setIsCollaborationModalOpen] =
    React.useState(false);
  const [isCoffeeChatModalOpen, setIsCoffeeChatModalOpen] =
    React.useState(false);

  // Handle back navigation
  const handleBack = () => {
    router.push('/experts');
  };

  // Handle collaboration modal - check auth first, prevent self-request
  const handleOpenCollaboration = () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    if (isOwnProfile) return;
    setIsCollaborationModalOpen(true);
  };

  // Handle coffee chat modal - check auth first, prevent self-request
  const handleOpenCoffeeChat = () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    if (isOwnProfile) return;
    setIsCoffeeChatModalOpen(true);
  };

  // Handle share
  const handleShare = async () => {
    if (!expert) return;
    const url = `${window.location.origin}/experts/${expert.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: expert.profile?.full_name || expert.business_name,
          text: expert.service_description || '',
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(url);
    }
  };

  // Show loading state
  if (isLoading || expertId === null) {
    return (
      <div className="py-6 md:py-8 pb-28 lg:pb-8">
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted hover:text-white"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon('back')}
          </Button>
        </div>

        <PageSkeleton />
      </div>
    );
  }

  // Show not found state
  if (isError || !expert) {
    return (
      <div className="py-6 md:py-8">
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted hover:text-white"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon('back')}
          </Button>
        </div>

        <ExpertNotFound />
      </div>
    );
  }

  const expertName = expert.profile?.full_name || expert.business_name;

  return (
    <>
      <div className="py-6 md:py-8 pb-28 lg:pb-8">
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted hover:text-white"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon('back')}
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <ExpertProfileHeader
              expert={expert}
              onCollaboration={handleOpenCollaboration}
              onCoffeeChat={handleOpenCoffeeChat}
              isLoading={false}
              isOwnProfile={isOwnProfile}
            />

            {/* Expertise Section */}
            <ExpertiseSection expert={expert} />

            {/* Collaboration Needs Section */}
            <CollaborationNeedsSection expert={expert} />

            {/* Experience Section */}
            <ExperienceSection expert={expert} />

            {/* Portfolio Section */}
            <PortfolioSection expert={expert} />
          </div>

          {/* Right Column - Sidebar CTA (Desktop Only) */}
          <div className="hidden lg:block">
            <SidebarCTA
              onCoffeeChat={handleOpenCoffeeChat}
              onCollaboration={handleOpenCollaboration}
              onShare={handleShare}
              isAvailable={expert.is_available}
              isLoading={false}
              expertName={expertName}
              isOwnProfile={isOwnProfile}
            />
          </div>
        </div>
      </div>

      {/* Sticky CTA Bar (Mobile Only) */}
      <AnimatePresence>
        <StickyCTABar
          onCoffeeChat={handleOpenCoffeeChat}
          onCollaboration={handleOpenCollaboration}
          isAvailable={expert.is_available}
          isLoading={false}
          isOwnProfile={isOwnProfile}
        />
      </AnimatePresence>

      {/* Modals */}
      <CollaborationModal
        expert={expert}
        open={isCollaborationModalOpen}
        onOpenChange={setIsCollaborationModalOpen}
      />

      <CoffeeChatModal
        expert={expert}
        open={isCoffeeChatModalOpen}
        onOpenChange={setIsCoffeeChatModalOpen}
      />
    </>
  );
}
