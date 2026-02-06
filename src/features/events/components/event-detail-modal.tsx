'use client';

/**
 * Event Detail Modal Component
 *
 * Full-featured modal for displaying event details with:
 * - All event information (title, description, author, etc.)
 * - External URL that opens in a new tab
 * - Event date and location for events
 * - Author profile info
 * - Close button
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  Calendar,
  MapPin,
  ExternalLink,
  User,
  Clock,
  Eye,
  Building2,
  Globe,
  Tag,
  Megaphone,
  Sparkles,
  ImageOff,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useIncrementViewCount } from '../api/queries';
import type { UserEventWithAuthor } from '../types';

/**
 * Props for EventDetailModal
 */
export interface EventDetailModalProps {
  /** The event to display */
  event: UserEventWithAuthor | null;
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onOpenChange: (open: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Event type icon mapping
 */
const EVENT_TYPE_ICONS: Record<string, React.ElementType> = {
  event: Calendar,
  ad: Tag,
  announcement: Megaphone,
};

/**
 * Get badge variant for event type
 */
function getEventTypeBadgeVariant(eventType: string): 'default' | 'muted' | 'warning' {
  switch (eventType) {
    case 'event':
      return 'default';
    case 'ad':
      return 'muted';
    case 'announcement':
      return 'warning';
    default:
      return 'default';
  }
}

/**
 * Format date for display
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time for display
 */
function formatTime(dateString: string | null): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time for created_at
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString();
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
 * Event Detail Modal Component
 */
export function EventDetailModal({
  event,
  open,
  onOpenChange,
  className,
}: EventDetailModalProps) {
  const t = useTranslations('events.detail');
  const tTypes = useTranslations('events.types');
  const tCategories = useTranslations('supportPrograms.categories');

  // Image loading error state - MUST be before any early returns
  const [imageError, setImageError] = React.useState(false);

  // Increment view count when modal opens
  const incrementViewMutation = useIncrementViewCount();

  // Reset image error when event changes
  React.useEffect(() => {
    setImageError(false);
  }, [event?.id]);

  React.useEffect(() => {
    if (open && event) {
      incrementViewMutation.mutate(event.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event?.id]);

  // Handle external link click
  const handleExternalLinkClick = () => {
    if (!event?.external_url) return;
    window.open(event.external_url, '_blank', 'noopener,noreferrer');
  };

  // Early return AFTER all hooks
  if (!event) return null;

  const EventTypeIcon = EVENT_TYPE_ICONS[event.event_type] || Sparkles;
  const formattedEventDate = event.event_date ? formatDate(event.event_date) : null;
  const formattedEventTime = event.event_date ? formatTime(event.event_date) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('flex max-h-[90vh] flex-col sm:max-w-2xl', className)}
        showCloseButton={true}
      >
        {/* Header with Image - Fixed at top, edge-to-edge */}
        {event.image_url && !imageError && (
          <div className="shrink-0 -mx-8 -mt-8 md:-mx-10 md:-mt-10">
            <div className="relative h-48 w-full overflow-hidden rounded-t-3xl">
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                sizes="(max-width: 768px) 100vw, 672px"
                className="object-cover"
                onError={() => setImageError(true)}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              {/* Event type badge */}
              <div className="absolute left-4 top-4">
                <Badge
                  variant={getEventTypeBadgeVariant(event.event_type)}
                  size="md"
                  className="gap-1 bg-primary text-white border-transparent"
                >
                  <EventTypeIcon className="h-3 w-3" />
                  {tTypes(event.event_type)}
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
              {/* Event type badge if no image or image failed to load */}
              {(!event.image_url || imageError) && (
                <Badge
                  variant={getEventTypeBadgeVariant(event.event_type)}
                  size="md"
                  className="mb-3 gap-1"
                >
                  <EventTypeIcon className="h-3 w-3" />
                  {tTypes(event.event_type)}
                </Badge>
              )}
              <DialogTitle className="text-2xl">{event.title}</DialogTitle>

              {/* Author Info */}
              <DialogDescription asChild>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={event.author.avatar_url || undefined} />
                    <AvatarFallback>
                      {event.author.full_name?.charAt(0) || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">
                      {event.author.full_name || 'Anonymous'}
                    </p>
                    {event.author.company_name && (
                      <p className="text-sm text-muted">{event.author.company_name}</p>
                    )}
                  </div>
                </div>
              </DialogDescription>
            </div>

            {/* Category Badge */}
            {event.category && (
              <Badge variant="muted" size="md" className="shrink-0">
                {tCategories(event.category)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Content Sections */}
        <div className="mt-6 space-y-6">
          {/* Description Section */}
          {event.description && (
            <>
              <DetailSection title={t('description')} icon={Building2}>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </DetailSection>
              <Separator className="bg-white/10" />
            </>
          )}

          {/* Event Date & Time Section */}
          {formattedEventDate && (
            <>
              <DetailSection title={t('eventDate')} icon={Calendar}>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-white">
                    {formattedEventDate}
                  </p>
                  {formattedEventTime && (
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {formattedEventTime}
                    </p>
                  )}
                </div>
              </DetailSection>
              <Separator className="bg-white/10" />
            </>
          )}

          {/* Location Section */}
          {event.location && (
            <>
              <DetailSection title={t('location')} icon={MapPin}>
                <p className="text-white">{event.location}</p>
              </DetailSection>
              <Separator className="bg-white/10" />
            </>
          )}

          {/* External URL Section */}
          {event.external_url && (
            <>
              <DetailSection title={t('externalUrl')} icon={Globe}>
                <a
                  href={event.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {event.external_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </DetailSection>
              <Separator className="bg-white/10" />
            </>
          )}

          {/* Stats Section */}
          <div className="flex items-center justify-between text-sm text-muted">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {t('views', { count: event.view_count })}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {t('posted')} {formatRelativeTime(event.created_at)}
            </div>
          </div>
        </div>
        </div>

        {/* Footer Actions - Fixed at bottom */}
        <DialogFooter className="-mx-8 px-8 md:-mx-10 md:px-10 -mb-8 pb-8 md:-mb-10 md:pb-10 pt-4 border-t border-white/10 shrink-0">
          {/* External Link Button */}
          {event.external_url && (
            <Button
              variant="primary"
              onClick={handleExternalLinkClick}
              rightIcon={<ExternalLink className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              {t('visitLink')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EventDetailModal;
