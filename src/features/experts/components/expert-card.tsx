'use client';

/**
 * Expert Card Component
 *
 * Displays an expert in a card format with:
 * - Avatar with availability indicator
 * - Name, company, and category
 * - Expertise tags (badges)
 * - Hourly rate
 * - Verified badge for approved experts
 * - Featured highlight
 * - Hover animation
 * - Click navigation to expert profile
 *
 * Uses customized UI wrappers from @/components/ui/ and translations.
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { BadgeCheck, Star, Clock } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { ExpertWithProfile } from '../types';

export interface ExpertCardProps {
  /** The expert data with profile information */
  expert: ExpertWithProfile;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Gets the initials from a full name for avatar fallback
 */
function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Formats hourly rate with Korean Won currency
 */
function formatHourlyRate(rate: number | null): string {
  if (!rate) return '';
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(rate);
}

/**
 * Availability Indicator Component
 * Shows a pulsing green dot for available experts
 */
function AvailabilityIndicator({ isAvailable }: { isAvailable: boolean }) {
  if (!isAvailable) return null;

  return (
    <span className="absolute bottom-0 right-0 z-10">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
      </span>
    </span>
  );
}

/**
 * Expert Card Component
 */
export function ExpertCard({ expert, className }: ExpertCardProps) {
  const t = useTranslations('experts.card');

  const {
    id,
    profile,
    business_name,
    category,
    specialty,
    hourly_rate,
    is_available,
    is_featured,
    status,
    experience_years,
  } = expert;

  const isVerified = status === 'approved';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/experts/${id}`} className="block">
        <Card
          variant={is_featured ? 'glow' : 'interactive'}
          padding="none"
          className={cn(
            'group overflow-hidden transition-all duration-300',
            is_featured && 'border-primary/50',
            className
          )}
          role="article"
          aria-label={`Expert profile: ${profile.full_name || business_name}`}
        >
          <CardContent className="p-5">
            {/* Featured Badge - Top Right */}
            {is_featured && (
              <div className="absolute right-3 top-3">
                <Badge variant="warning" size="sm" className="gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  {t('featured')}
                </Badge>
              </div>
            )}

            {/* Header: Avatar and Basic Info */}
            <div className="flex items-start gap-4">
              {/* Avatar with Availability Indicator */}
              <div className="relative shrink-0">
                <Avatar size="lg">
                  {profile.avatar_url ? (
                    <AvatarImage
                      src={profile.avatar_url}
                      alt={profile.full_name || 'Expert avatar'}
                    />
                  ) : null}
                  <AvatarFallback>
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <AvailabilityIndicator isAvailable={is_available} />
              </div>

              {/* Name, Company, Category */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-lg font-bold text-white">
                    {profile.full_name || business_name}
                  </h3>
                  {isVerified && (
                    <BadgeCheck className="h-5 w-5 shrink-0 text-primary" aria-label={t('verified')} />
                  )}
                </div>

                {profile.company_name && (
                  <p className="mt-0.5 truncate text-sm text-muted">
                    {profile.company_name}
                  </p>
                )}

                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="default" size="sm">
                    {category}
                  </Badge>
                  {is_available && (
                    <Badge variant="success" size="sm">
                      {t('available')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Expertise Tags */}
            {specialty && specialty.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {specialty.slice(0, 4).map((skill) => (
                  <Badge
                    key={skill}
                    variant="muted"
                    size="sm"
                    className="font-normal"
                  >
                    {skill}
                  </Badge>
                ))}
                {specialty.length > 4 && (
                  <Badge variant="muted" size="sm" className="font-normal">
                    +{specialty.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Bottom Info: Experience and Rate */}
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-4">
              <div className="flex items-center gap-4 text-sm text-muted">
                {experience_years && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {t('yearsExperience', { years: experience_years })}
                  </span>
                )}
              </div>

              {hourly_rate && (
                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    {formatHourlyRate(hourly_rate)}
                  </p>
                  <p className="text-xs text-muted">/hour</p>
                </div>
              )}
            </div>

            {/* View Profile Button - Shows on Hover */}
            <div className="mt-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                tabIndex={-1}
              >
                {t('viewProfile')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default ExpertCard;
