'use client';

/**
 * Program Detail Modal Component
 *
 * Full-featured modal for displaying support program details with:
 * - All program information (overview, eligibility, benefits, etc.)
 * - External URL that opens in a new tab
 * - Bookmark/save functionality
 * - Close button
 * - Uses Dialog from @/components/ui/
 * - Translations via useTranslations('supportPrograms.detail')
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Calendar,
  Building2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Clock,
  CheckCircle,
  Users,
  DollarSign,
  FileText,
  Globe,
} from 'lucide-react';

import { cn } from '@/lib/cn';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { useBookmarkMutation } from '../api/queries';
import type { SupportProgramWithBookmark } from '../types';

/**
 * Props for ProgramDetailModal
 */
export interface ProgramDetailModalProps {
  /** The program to display */
  program: SupportProgramWithBookmark | null;
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onOpenChange: (open: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Calculate days remaining until deadline
 */
function calculateDaysRemaining(deadline: string | null): {
  days: number;
  isUrgent: boolean;
  isClosed: boolean;
  isToday: boolean;
} {
  if (!deadline) {
    return { days: 0, isUrgent: false, isClosed: false, isToday: false };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    days: Math.abs(diffDays),
    isUrgent: diffDays > 0 && diffDays <= 7,
    isClosed: diffDays < 0,
    isToday: diffDays === 0,
  };
}

/**
 * Section component for consistent styling
 */
function DetailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-white">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="pl-7 text-muted">{children}</div>
    </div>
  );
}

/**
 * Format date for display
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
}

/**
 * Program Detail Modal Component
 */
export function ProgramDetailModal({
  program,
  open,
  onOpenChange,
  className,
}: ProgramDetailModalProps) {
  const t = useTranslations('supportPrograms.detail');
  const tCard = useTranslations('supportPrograms.card');
  const tCategories = useTranslations('supportPrograms.categories');

  // Bookmark mutation
  const bookmarkMutation = useBookmarkMutation();

  // Handle bookmark toggle
  const handleBookmarkToggle = async () => {
    if (!program) return;

    try {
      await bookmarkMutation.mutateAsync({
        programId: program.id,
        isCurrentlyBookmarked: program.is_bookmarked,
      });
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Bookmark failed:', error);
    }
  };

  // Handle external link click
  const handleExternalLinkClick = () => {
    if (!program?.external_url) return;
    window.open(program.external_url, '_blank', 'noopener,noreferrer');
  };

  if (!program) return null;

  const deadlineInfo = program.application_deadline
    ? calculateDaysRemaining(program.application_deadline)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('flex max-h-[90vh] flex-col sm:max-w-2xl', className)}
        showCloseButton={true}
      >
        {/* Header with Image - Fixed at top, edge-to-edge */}
        {program.image_url && (
          <div className="shrink-0 -mx-8 -mt-8 md:-mx-10 md:-mt-10">
            <div className="relative h-48 w-full overflow-hidden rounded-t-3xl">
              <img
                src={program.image_url}
                alt={program.title}
                className="h-full w-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              {/* Category badge */}
              <div className="absolute left-4 top-4">
                <Badge variant="default" size="md" className="bg-primary text-white border-transparent">
                  {tCategories(program.category)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto -mx-8 px-8 md:-mx-10 md:px-10" style={{ scrollbarGutter: 'stable' }}>
          {/* Dialog Header */}
          <DialogHeader className="pt-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{program.title}</DialogTitle>
              <DialogDescription className="mt-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {program.organization}
              </DialogDescription>
            </div>
            {/* Deadline Badge */}
            {deadlineInfo && (
              <Badge
                variant={
                  deadlineInfo.isClosed
                    ? 'error'
                    : deadlineInfo.isUrgent || deadlineInfo.isToday
                      ? 'warning'
                      : 'muted'
                }
                size="md"
                className="shrink-0"
              >
                <Calendar className="mr-1 h-3 w-3" />
                {deadlineInfo.isToday
                  ? tCard('today')
                  : deadlineInfo.isClosed
                    ? tCard('dplus', { days: deadlineInfo.days })
                    : tCard('dday', { days: deadlineInfo.days })}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Content Sections */}
        <div className="mt-6 space-y-6">
          {/* Overview Section */}
          <DetailSection title={t('overview')} icon={FileText}>
            <p className="whitespace-pre-wrap leading-relaxed">{program.description}</p>
          </DetailSection>

          <Separator className="bg-white/10" />

          {/* Eligibility Section */}
          {program.eligibility && (
            <>
              <DetailSection title={t('eligibility')} icon={Users}>
                <p className="whitespace-pre-wrap">{program.eligibility}</p>
              </DetailSection>
              <Separator className="bg-white/10" />
            </>
          )}

          {/* Benefits Section */}
          {program.benefits && program.benefits.length > 0 && (
            <>
              <DetailSection title={t('benefits')} icon={CheckCircle}>
                <ul className="space-y-2">
                  {program.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </DetailSection>
              <Separator className="bg-white/10" />
            </>
          )}

          {/* Amount/Funding Section */}
          {program.amount && (
            <>
              <DetailSection title={t('benefits')} icon={DollarSign}>
                <p className="text-lg font-semibold text-white">{program.amount}</p>
              </DetailSection>
              <Separator className="bg-white/10" />
            </>
          )}

          {/* Schedule Section */}
          <DetailSection title={t('schedule')} icon={Clock}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Application Period */}
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="mb-1 text-sm font-medium text-white">
                  {tCard('deadline')}
                </p>
                <div className="space-y-1 text-sm">
                  {program.application_start && (
                    <p>
                      <span className="text-muted">Start: </span>
                      {formatDate(program.application_start)}
                    </p>
                  )}
                  <p>
                    <span className="text-muted">End: </span>
                    {formatDate(program.application_deadline)}
                  </p>
                </div>
              </div>
              {/* Program Period */}
              {(program.program_start || program.program_end) && (
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="mb-1 text-sm font-medium text-white">
                    Program Period
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted">Start: </span>
                      {formatDate(program.program_start)}
                    </p>
                    <p>
                      <span className="text-muted">End: </span>
                      {formatDate(program.program_end)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DetailSection>

          {/* Website Section */}
          {program.external_url && (
            <>
              <Separator className="bg-white/10" />
              <DetailSection title={t('website')} icon={Globe}>
                <a
                  href={program.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {program.external_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </DetailSection>
            </>
          )}
        </div>
        </div>

        {/* Footer Actions - Fixed at bottom */}
        <DialogFooter className="flex-col gap-3 sm:flex-row -mx-8 px-8 md:-mx-10 md:px-10 -mb-8 pb-8 md:-mb-10 md:pb-10 pt-4 border-t border-white/10 shrink-0">
          {/* Bookmark Button */}
          <Button
            variant="outline"
            onClick={handleBookmarkToggle}
            loading={bookmarkMutation.isPending}
            leftIcon={
              program.is_bookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )
            }
            className="w-full sm:w-auto"
          >
            {program.is_bookmarked ? tCard('bookmarked') : tCard('bookmark')}
          </Button>

          {/* Apply Button */}
          {program.external_url && (
            <Button
              variant="primary"
              onClick={handleExternalLinkClick}
              rightIcon={<ExternalLink className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              {t('applyExternal')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProgramDetailModal;
