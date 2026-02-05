'use client';

/**
 * Expert Profile Header Component
 *
 * Displays the expert's profile header with:
 * - Large avatar with primary color glow effect behind it
 * - Name, company, category, bio, expertise tags
 * - Verified badge (shows for approved experts)
 * - Availability badge (pulses green when available)
 * - Stats row with hover scale animation (experience, projects, response time)
 * - CTA buttons for collaboration and coffee chat
 * - Responsive layout (stacks on mobile)
 *
 * Uses customized UI wrappers from @/components/ui/ and translations.
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Briefcase,
  Clock,
  MessageSquare,
  MapPin,
  Coffee,
  Handshake,
} from 'lucide-react';

import { cn } from '@/lib/cn';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { ExpertWithProfile, ExpertCategory } from '../types';

export interface ExpertProfileHeaderProps {
  /** Expert data with profile information */
  expert: ExpertWithProfile;
  /** Callback when collaboration button is clicked */
  onCollaboration?: () => void;
  /** Callback when coffee chat button is clicked */
  onCoffeeChat?: () => void;
  /** Whether collaboration request is in progress */
  isLoading?: boolean;
  /** Whether the logged-in user is viewing their own expert profile */
  isOwnProfile?: boolean;
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
 * Get category color for badge
 */
function getCategoryColor(category: ExpertCategory): 'default' | 'info' | 'success' | 'warning' {
  const colorMap: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
    marketing: 'default',
    development: 'info',
    design: 'warning',
    legal: 'success',
    finance: 'success',
    hr: 'warning',
    operations: 'default',
    sales: 'info',
    strategy: 'default',
    branding: 'warning',
    product: 'info',
    growth: 'success',
    data: 'info',
    ai: 'info',
    blockchain: 'warning',
  };
  return colorMap[category] || 'default';
}

/**
 * Stat Item Component with hover animation
 */
function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="flex flex-col items-center gap-1 rounded-2xl bg-white/[0.03] px-4 py-3 border border-white/[0.06] cursor-default"
    >
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-lg font-bold text-white">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </motion.div>
  );
}

/**
 * Availability Indicator with pulsing animation
 */
function AvailabilityIndicator({ isAvailable }: { isAvailable: boolean }) {
  const t = useTranslations('experts.card');

  if (!isAvailable) {
    return (
      <Badge variant="muted" size="sm">
        {t('unavailable')}
      </Badge>
    );
  }

  return (
    <Badge variant="success" size="sm" className="relative">
      <span className="relative flex items-center gap-1.5">
        <motion.span
          className="h-2 w-2 rounded-full bg-emerald-400"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {t('available')}
      </span>
    </Badge>
  );
}

/**
 * Expert Profile Header Component
 */
export function ExpertProfileHeader({
  expert,
  onCollaboration,
  onCoffeeChat,
  isLoading = false,
  isOwnProfile = false,
  className,
}: ExpertProfileHeaderProps) {
  const t = useTranslations('experts.profile');
  const tCard = useTranslations('experts.card');
  const tCategories = useTranslations('experts.categories');

  // Extract data
  const {
    profile,
    business_name,
    category,
    bio,
    specialty,
    is_available,
    status,
    experience_years,
    contact_count,
    service_regions,
  } = expert;

  const isVerified = status === 'approved';
  const displayName = profile.full_name || business_name;
  const initials = getInitials(displayName);

  // Calculate response time (mock - would be from real data)
  const responseTime = '24h';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant="elevated"
        padding="none"
        className={cn('relative overflow-hidden', className)}
      >
        {/* Glow Background Effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          {/* Primary color glow behind avatar position */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-60 md:left-24 md:translate-x-0" />
          {/* Secondary gradient */}
          <div className="absolute top-20 right-10 w-48 h-48 bg-info/10 rounded-full blur-3xl opacity-40 hidden md:block" />
        </div>

        <CardContent className="relative z-10 p-5 md:p-8">
          {/* Top Section: Avatar and Main Info */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Avatar with Glow */}
            <div className="flex justify-center md:justify-start">
              <div className="relative">
                {/* Glow effect behind avatar */}
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl scale-110" />
                <Avatar size="xl" className="relative border-4 border-card">
                  {profile.avatar_url ? (
                    <AvatarImage
                      src={profile.avatar_url}
                      alt={displayName || 'Expert avatar'}
                    />
                  ) : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 text-center md:text-left">
              {/* Name Row with Verified Badge */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {displayName}
                </h1>
                {isVerified && (
                  <Badge variant="success" size="sm" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {tCard('verified')}
                  </Badge>
                )}
                <AvailabilityIndicator isAvailable={is_available} />
              </div>

              {/* Company */}
              {profile.company_name && (
                <p className="text-lg text-muted mb-1">
                  {profile.company_name}
                </p>
              )}

              {/* Category Badge */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                <Badge variant={getCategoryColor(category)} size="md">
                  {tCategories(category)}
                </Badge>
                {service_regions && service_regions.length > 0 && (
                  <Badge variant="muted" size="sm" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {service_regions[0]}
                    {service_regions.length > 1 && ` +${service_regions.length - 1}`}
                  </Badge>
                )}
              </div>

              {/* Bio */}
              {bio && (
                <p className="text-white/80 leading-relaxed mb-4 max-w-2xl">
                  {bio}
                </p>
              )}

              {/* Expertise Tags */}
              {specialty && specialty.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
                  {specialty.slice(0, 5).map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      size="sm"
                      className="text-white/70"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {specialty.length > 5 && (
                    <Badge variant="muted" size="sm">
                      +{specialty.length - 5}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mt-6 mb-6">
            <StatItem
              icon={Briefcase}
              value={experience_years ?? '-'}
              label={t('experience')}
            />
            <StatItem
              icon={MessageSquare}
              value={contact_count ?? 0}
              label={t('collaboration')}
            />
            <StatItem
              icon={Clock}
              value={responseTime}
              label={t('contact')}
            />
          </div>

          {/* CTA Buttons - Hidden when viewing own profile */}
          {isOwnProfile ? (
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-sm text-muted text-center">
                {t('ownProfile')}
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={onCoffeeChat}
                disabled={isLoading || !is_available}
                leftIcon={<Coffee className="h-5 w-5" />}
                className="flex-1"
              >
                {t('coffeeChat')}
              </Button>
              <Button
                variant="primary-glow"
                size="lg"
                onClick={onCollaboration}
                disabled={isLoading || !is_available}
                loading={isLoading}
                leftIcon={<Handshake className="h-5 w-5" />}
                className="flex-1"
              >
                {t('collaboration')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ExpertProfileHeader;
