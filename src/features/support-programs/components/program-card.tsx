'use client';

/**
 * Program Card Component
 *
 * Displays a support program in a card format with:
 * - Program title and organization
 * - Category badge
 * - Deadline with days remaining (D-day format)
 * - Orange badge when deadline is urgent (< 7 days)
 * - Fixed width for horizontal scroll layout
 * - Click handler for detail navigation
 *
 * Uses customized UI wrappers from @/components/ui/ and translations.
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Calendar, Building2, ExternalLink } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import type { ProgramCardProps } from '../types';

/**
 * Fixed card width for horizontal scroll layout
 */
const CARD_WIDTH = 320;

/**
 * Threshold for urgent deadline (days)
 */
const URGENT_THRESHOLD_DAYS = 7;

/**
 * Calculate days remaining until deadline
 * @param deadline - ISO date string of the deadline
 * @returns Object with days count and status
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
    isUrgent: diffDays > 0 && diffDays <= URGENT_THRESHOLD_DAYS,
    isClosed: diffDays < 0,
    isToday: diffDays === 0,
  };
}

/**
 * Format the deadline display text
 */
function formatDeadlineText(
  deadline: { days: number; isUrgent: boolean; isClosed: boolean; isToday: boolean },
  t: ReturnType<typeof useTranslations>
): string {
  if (deadline.isToday) {
    return t('today');
  }
  if (deadline.isClosed) {
    return t('dplus', { days: deadline.days });
  }
  return t('dday', { days: deadline.days });
}

/**
 * Deadline Badge Component
 * Shows deadline with appropriate styling based on urgency
 */
function DeadlineBadge({
  deadline,
  t,
}: {
  deadline: string | null;
  t: ReturnType<typeof useTranslations>;
}) {
  if (!deadline) return null;

  const deadlineInfo = calculateDaysRemaining(deadline);
  const text = formatDeadlineText(deadlineInfo, t);

  // Determine badge variant based on deadline status
  let variant: 'warning' | 'error' | 'muted' = 'muted';
  if (deadlineInfo.isClosed) {
    variant = 'error';
  } else if (deadlineInfo.isUrgent || deadlineInfo.isToday) {
    variant = 'warning';
  }

  return (
    <Badge variant={variant} size="sm" className="gap-1">
      <Calendar className="h-3 w-3" />
      {text}
    </Badge>
  );
}

/**
 * Program Card Component
 */
export function ProgramCard({ program, className, onClick, fullWidth = false }: ProgramCardProps) {
  const t = useTranslations('supportPrograms.card');

  const { title, organization, category, application_deadline, image_url, description } = program;

  const deadlineInfo = application_deadline ? calculateDaysRemaining(application_deadline) : null;
  const isClosed = deadlineInfo?.isClosed ?? false;
  const is_featured = false; // Featured flag not in current schema, default to false

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4 }}
      style={fullWidth ? undefined : { width: CARD_WIDTH }}
      className={cn('shrink-0', fullWidth && 'w-full')}
    >
      <Card
        variant={is_featured ? 'glow' : 'interactive'}
        padding="none"
        className={cn(
          'group h-full cursor-pointer overflow-hidden transition-all duration-300',
          is_featured && 'border-primary/50',
          isClosed && 'opacity-75',
          className
        )}
        onClick={onClick}
        role="article"
        aria-label={`Support program: ${title}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        {/* Program Image */}
        {image_url && (
          <div className="relative h-32 w-full overflow-hidden bg-card-secondary">
            <img
              src={image_url}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Category Badge - Positioned over image */}
            <div className="absolute left-3 top-3">
              <Badge variant="default" size="sm">
                {category}
              </Badge>
            </div>
          </div>
        )}

        <CardContent className="p-4">
          {/* Category Badge - If no image */}
          {!image_url && (
            <div className="mb-3">
              <Badge variant="default" size="sm">
                {category}
              </Badge>
            </div>
          )}

          {/* Header: Title and Deadline */}
          <CardHeader className="p-0">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="line-clamp-2 text-base font-bold leading-tight">
                {title}
              </CardTitle>
              {/* Deadline Badge */}
              <div className="shrink-0">
                <DeadlineBadge deadline={application_deadline} t={t} />
              </div>
            </div>

            {/* Organization */}
            <CardDescription className="mt-2 flex items-center gap-1.5 text-sm">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{organization}</span>
            </CardDescription>
          </CardHeader>

          {/* Description - Optional */}
          {description && (
            <p className="mt-3 line-clamp-2 text-sm text-muted">{description}</p>
          )}

          {/* Footer: Actions */}
          <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3">
            {/* Deadline Label */}
            <div className="text-xs text-muted">
              {application_deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {t('deadline')}: {new Date(application_deadline).toLocaleDateString()}
                </span>
              )}
              {!application_deadline && <span>{t('upcoming')}</span>}
            </div>

            {/* View Details Link */}
            <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {t('viewDetails')}
              <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ProgramCard;
