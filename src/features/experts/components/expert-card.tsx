'use client';

/**
 * Expert Card Component
 *
 * Displays an expert in a clean, modern card format with:
 * - Avatar with availability indicator
 * - Name, company, and category
 * - Expertise tags (badges)
 * - Hourly rate and experience
 * - Verified badge for approved experts
 * - Featured highlight (subtle)
 * - Subtle hover effect (border color change only)
 * - Click navigation to expert profile (entire card is a link)
 *
 * Uses customized UI wrappers from @/components/ui/ and translations.
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { BadgeCheck, Star, Clock, ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
 * Expert Card Component
 *
 * Clean vertical layout:
 * 1. Featured badge (top-right, subtle) if applicable
 * 2. Avatar (centered) with availability dot
 * 3. Name + verified badge
 * 4. Company name
 * 5. Category badge
 * 6. Specialty tags
 * 7. Bottom stats: experience + hourly rate
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
  const displayName = profile.full_name || business_name;

  return (
    <Link href={`/experts/${id}`} className="group block h-full outline-none">
      <Card
        variant="default"
        padding="none"
        className={cn(
          'relative h-full overflow-hidden transition-colors duration-200',
          'hover:border-primary/40',
          'focus-within:border-primary/40',
          is_featured && 'border-primary/20',
          className
        )}
        role="article"
        aria-label={`Expert profile: ${displayName}`}
      >
        <CardContent className="flex h-full flex-col p-5">
          {/* Featured Badge - Top Right, Subtle */}
          {is_featured && (
            <div className="absolute right-3 top-3">
              <Badge variant="warning" size="sm" className="gap-1">
                <Star className="h-3 w-3 fill-current" />
                {t('featured')}
              </Badge>
            </div>
          )}

          {/* Avatar Section - Centered */}
          <div className="flex flex-col items-center text-center">
            {/* Avatar with Availability */}
            <div className="relative mb-3">
              <Avatar
                size="lg"
                showStatus={is_available}
                statusColor="success"
              >
                {profile.avatar_url ? (
                  <AvatarImage
                    src={profile.avatar_url}
                    alt={displayName || 'Expert avatar'}
                  />
                ) : null}
                <AvatarFallback>
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name + Verified */}
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="text-lg font-semibold leading-tight text-white">
                {displayName}
              </h3>
              {isVerified && (
                <BadgeCheck
                  className="h-4 w-4 shrink-0 text-primary"
                  aria-label={t('verified')}
                />
              )}
            </div>

            {/* Company Name */}
            {profile.company_name && (
              <p className="mt-1 text-base text-[#8B95A1]">
                {profile.company_name}
              </p>
            )}

            {/* Category Badge */}
            <div className="mt-2.5 flex items-center justify-center gap-2">
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

          {/* Specialty Tags */}
          <div className="mt-4 min-h-[28px] flex flex-wrap justify-center gap-1.5">
            {specialty && specialty.length > 0 && (
              <>
                {specialty.slice(0, 3).map((skill) => (
                  <Badge
                    key={skill}
                    variant="muted"
                    size="sm"
                    className="font-normal"
                  >
                    {skill}
                  </Badge>
                ))}
                {specialty.length > 3 && (
                  <Badge variant="muted" size="sm" className="font-normal">
                    +{specialty.length - 3}
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Bottom Stats: Experience + Rate */}
          <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-3">
            <div className="text-base text-[#8B95A1]">
              {experience_years ? (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {t('yearsExperience', { years: experience_years })}
                </span>
              ) : (
                <span />
              )}
            </div>

            {hourly_rate ? (
              <div className="text-right">
                <span className="text-base font-semibold text-white">
                  {formatHourlyRate(hourly_rate)}
                </span>
                <span className="ml-0.5 text-sm text-[#8B95A1]">/hr</span>
              </div>
            ) : (
              /* Arrow indicator that it is clickable */
              <ArrowUpRight className="h-4 w-4 text-[#8B95A1] transition-colors group-hover:text-primary" />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default ExpertCard;
