'use client';

/**
 * Event Card Component
 *
 * Displays a user event in a card format with:
 * - Event title and author info
 * - Event type badge (Event, Ad, Announcement)
 * - Category badge (optional)
 * - Event date with relative time
 * - Location (if provided)
 * - Edit/Delete actions for the author
 * - Click handler for detail navigation
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Calendar,
  MapPin,
  ExternalLink,
  User,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  Megaphone,
  Tag,
  Sparkles,
  ImageOff,
} from 'lucide-react';

import { cn } from '@/lib/cn';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

import type { EventCardProps } from '../types';

/**
 * Fixed card width for horizontal scroll layout
 */
const CARD_WIDTH = 320;

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
 * Format event date for display
 */
function formatEventDate(dateString: string | null): string | null {
  if (!dateString) return null;

  const date = new Date(dateString);
  const now = new Date();

  // Check if date is in the past
  if (date < now) {
    return `Ended ${date.toLocaleDateString()}`;
  }

  // Check if date is today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDay = new Date(date);
  eventDay.setHours(0, 0, 0, 0);

  if (eventDay.getTime() === today.getTime()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Check if date is tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (eventDay.getTime() === tomorrow.getTime()) {
    return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Return formatted date
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
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
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * Event Card Component
 */
export function EventCard({
  event,
  className,
  onClick,
  fullWidth = false,
  showActions = false,
  currentUserId,
  onEdit,
  onDelete,
}: EventCardProps) {
  const t = useTranslations('events.card');
  const tTypes = useTranslations('events.types');
  const tCategories = useTranslations('supportPrograms.categories');

  const {
    title,
    description,
    event_type,
    category,
    image_url,
    event_date,
    location,
    view_count,
    created_at,
    author,
  } = event;

  const isAuthor = currentUserId === event.author_id;
  const EventTypeIcon = EVENT_TYPE_ICONS[event_type] || Sparkles;
  const formattedEventDate = formatEventDate(event_date);
  const relativeTime = formatRelativeTime(created_at);

  // Image loading error state
  const [imageError, setImageError] = React.useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

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
        variant="interactive"
        padding="none"
        className={cn(
          'group h-full cursor-pointer overflow-hidden transition-all duration-300',
          className
        )}
        onClick={onClick}
        role="article"
        aria-label={`Event: ${title}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        {/* Event Image */}
        {image_url && !imageError && (
          <div className="relative h-32 w-full overflow-hidden bg-card-secondary">
            <Image
              src={image_url}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, 320px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
            {/* Event Type Badge - Positioned over image */}
            <div className="absolute left-3 top-3">
              <Badge variant={getEventTypeBadgeVariant(event_type)} size="sm" className="gap-1 bg-primary text-white border-transparent">
                <EventTypeIcon className="h-3 w-3" />
                {tTypes(event_type)}
              </Badge>
            </div>
            {/* Actions Menu - Positioned over image */}
            {showActions && isAuthor && (
              <div className="absolute right-3 top-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 bg-black/40 p-0 backdrop-blur-sm hover:bg-black/60"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      {t('edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-error focus:text-error"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        )}

        <CardContent className="p-4">
          {/* Event Type Badge + Actions - If no image or image failed to load */}
          {(!image_url || imageError) && (
            <div className="mb-3 flex items-center justify-between">
              <Badge variant={getEventTypeBadgeVariant(event_type)} size="sm" className="gap-1">
                <EventTypeIcon className="h-3 w-3" />
                {tTypes(event_type)}
              </Badge>
              {showActions && isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      {t('edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-error focus:text-error"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* Header: Title */}
          <CardHeader className="p-0">
            <CardTitle className="line-clamp-2 text-base font-bold leading-tight">
              {title}
            </CardTitle>

            {/* Author Info */}
            <CardDescription className="mt-2 flex items-center gap-2 text-sm">
              <Avatar className="h-5 w-5">
                <AvatarImage src={author.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">
                  {author.full_name?.charAt(0) || <User className="h-3 w-3" />}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">
                {author.full_name || 'Anonymous'}
                {author.company_name && (
                  <span className="text-muted"> @ {author.company_name}</span>
                )}
              </span>
            </CardDescription>
          </CardHeader>

          {/* Description - Optional */}
          {description && (
            <p className="mt-3 line-clamp-2 text-sm text-muted">{description}</p>
          )}

          {/* Category Badge */}
          {category && (
            <div className="mt-3">
              <Badge variant="muted" size="sm">
                {tCategories(category)}
              </Badge>
            </div>
          )}

          {/* Event Date & Location */}
          {(formattedEventDate || location) && (
            <div className="mt-3 space-y-1">
              {formattedEventDate && (
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <Calendar className="h-3 w-3 shrink-0 text-primary" />
                  <span>{formattedEventDate}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <MapPin className="h-3 w-3 shrink-0 text-primary" />
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer: Views + Posted time */}
          <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3">
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {view_count}
              </span>
              <span>{relativeTime}</span>
            </div>

            {/* View Details */}
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

export default EventCard;
