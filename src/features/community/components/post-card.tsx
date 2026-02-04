'use client';

/**
 * Post Card Component
 *
 * Displays a single post in the Thread feed with:
 * - Author info (avatar, name, company)
 * - Relative timestamp (formatted for locale)
 * - Post content with media grid
 * - Action buttons (like, comment, share)
 * - Hover animation
 *
 * Uses customized UI wrappers from @/components/ui/ and translations.
 */

import * as React from 'react';
import Image from 'next/image';
import { useTranslations, useFormatter, useNow } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Bookmark,
} from 'lucide-react';

import { cn } from '@/lib/cn';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { PostWithAuthor } from '../types';

export interface PostCardProps {
  /** The post data with author information */
  post: PostWithAuthor;
  /** Callback when like button is clicked */
  onLike?: (postId: number, isCurrentlyLiked: boolean) => void;
  /** Callback when comment button is clicked */
  onComment?: (postId: number) => void;
  /** Callback when share button is clicked */
  onShare?: (postId: number) => void;
  /** Callback when bookmark button is clicked */
  onBookmark?: (postId: number) => void;
  /** Callback when the card is clicked (navigate to detail) */
  onClick?: (postId: number) => void;
  /** Whether like action is in progress */
  isLiking?: boolean;
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
 * Media Grid Component for displaying post images
 */
function MediaGrid({ urls, alt }: { urls: string[]; alt: string }) {
  if (urls.length === 0) return null;

  const gridClassName = cn(
    'mt-3 gap-2 overflow-hidden rounded-2xl',
    urls.length === 1 && 'grid grid-cols-1',
    urls.length === 2 && 'grid grid-cols-2',
    urls.length === 3 && 'grid grid-cols-2',
    urls.length >= 4 && 'grid grid-cols-2'
  );

  return (
    <div className={gridClassName}>
      {urls.slice(0, 4).map((url, index) => (
        <div
          key={url}
          className={cn(
            'relative overflow-hidden rounded-xl bg-card-secondary',
            urls.length === 1 && 'aspect-video',
            urls.length === 2 && 'aspect-square',
            urls.length === 3 && index === 0 && 'row-span-2 aspect-[3/4]',
            urls.length === 3 && index !== 0 && 'aspect-square',
            urls.length >= 4 && 'aspect-square'
          )}
        >
          <Image
            src={url}
            alt={`${alt} - image ${index + 1}`}
            fill
            className="object-cover transition-transform duration-200 hover:scale-105"
            sizes={urls.length === 1 ? '(max-width: 640px) 100vw, 640px' : '320px'}
          />
          {/* Show overlay for 4+ images on the 4th image */}
          {urls.length > 4 && index === 3 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="text-2xl font-bold text-white">
                +{urls.length - 4}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Action Button Component for consistent styling
 */
function ActionButton({
  icon: Icon,
  label,
  count,
  isActive,
  onClick,
  disabled,
  activeClassName,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  activeClassName?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      disabled={disabled}
      className={cn(
        'gap-1.5 text-muted hover:text-white hover:bg-white/5',
        isActive && activeClassName
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 transition-all duration-200',
          isActive && 'fill-current'
        )}
      />
      {count !== undefined && count > 0 && (
        <span className="text-xs tabular-nums">{count}</span>
      )}
      <span className="sr-only">{label}</span>
    </Button>
  );
}

/**
 * Post Card Component
 */
export function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onClick,
  isLiking,
  className,
}: PostCardProps) {
  const t = useTranslations('thread.post');
  const format = useFormatter();
  const now = useNow({ updateInterval: 1000 * 60 }); // Update every minute

  // Format the timestamp
  const formattedTime = React.useMemo(() => {
    const date = new Date(post.created_at);
    return format.relativeTime(date, now);
  }, [post.created_at, format, now]);

  const handleCardClick = () => {
    onClick?.(post.id);
  };

  const handleLikeClick = () => {
    onLike?.(post.id, post.is_liked);
  };

  const handleCommentClick = () => {
    onComment?.(post.id);
  };

  const handleShareClick = () => {
    onShare?.(post.id);
  };

  const handleBookmarkClick = () => {
    onBookmark?.(post.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        variant="interactive"
        padding="none"
        className={cn('overflow-hidden', className)}
        onClick={handleCardClick}
        role="article"
        aria-label={`Post by ${post.author.full_name || 'Unknown'}`}
      >
        <CardContent className="p-4 sm:p-5">
          {/* Header: Author info and timestamp */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar size="md">
                {post.author.avatar_url ? (
                  <AvatarImage
                    src={post.author.avatar_url}
                    alt={post.author.full_name || 'User avatar'}
                  />
                ) : null}
                <AvatarFallback>
                  {getInitials(post.author.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">
                    {post.author.full_name || 'Unknown User'}
                  </span>
                  {post.is_pinned && (
                    <Badge variant="default" size="sm">
                      {t('pinned')}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                  {post.author.company_name && (
                    <>
                      <span>{post.author.company_name}</span>
                      <span className="text-white/20">|</span>
                    </>
                  )}
                  <time dateTime={post.created_at}>{formattedTime}</time>
                  {post.updated_at !== post.created_at && (
                    <Badge variant="muted" size="sm">
                      {t('edited')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* More options menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted hover:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleBookmarkClick}>
                  <Bookmark className="mr-2 h-4 w-4" />
                  {t('bookmark')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareClick}>
                  <Share2 className="mr-2 h-4 w-4" />
                  {t('copyLink')}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-error">
                  {t('report')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <div className="mt-3">
            <p className="whitespace-pre-wrap text-white leading-relaxed">
              {post.content}
            </p>
          </div>

          {/* Media Grid */}
          {post.media_urls && post.media_urls.length > 0 && (
            <MediaGrid
              urls={post.media_urls}
              alt={`Post by ${post.author.full_name}`}
            />
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3">
            <div className="flex items-center gap-1">
              {/* Like Button */}
              <ActionButton
                icon={Heart}
                label={post.is_liked ? t('liked') : t('like')}
                count={post.like_count}
                isActive={post.is_liked}
                onClick={handleLikeClick}
                disabled={isLiking}
                activeClassName="text-error hover:text-error"
              />

              {/* Comment Button */}
              <ActionButton
                icon={MessageCircle}
                label={t('comment')}
                count={post.comment_count}
                onClick={handleCommentClick}
              />

              {/* Share Button */}
              <ActionButton
                icon={Share2}
                label={t('share')}
                onClick={handleShareClick}
              />
            </div>

            {/* Bookmark button on the right */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleBookmarkClick();
              }}
              className="text-muted hover:text-white"
            >
              <Bookmark className="h-4 w-4" />
              <span className="sr-only">{t('bookmark')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default PostCard;
