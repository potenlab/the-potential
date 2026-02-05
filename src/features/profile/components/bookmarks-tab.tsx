'use client';

/**
 * Bookmarks Tab Component
 *
 * Displays the user's bookmarked items grouped by type:
 * - Programs: bookmarked support programs
 * - Posts: bookmarked community posts
 *
 * Each item has an unbookmark button.
 * Includes loading skeletons and empty states.
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import {
  Bookmark,
  BookmarkX,
  Calendar,
  Building2,
  Heart,
  MessageCircle,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/cn';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';

import { useUserBookmarks, useUnbookmarkMutation } from '../api/queries';
import type { BookmarkedProgram, BookmarkedPost } from '../api/queries';

// ============================================================================
// HELPERS
// ============================================================================

function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function timeAgo(date: string): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
}

function formatDeadline(deadline: string | null): string | null {
  if (!deadline) return null;
  try {
    const d = new Date(deadline);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return null;
  }
}

function getDeadlineStatus(deadline: string | null): 'closed' | 'urgent' | 'open' | null {
  if (!deadline) return null;
  const now = new Date();
  const d = new Date(deadline);
  if (d < now) return 'closed';
  const daysLeft = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 7) return 'urgent';
  return 'open';
}

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

function BookmarkItemSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" rounded="md" />
          <Skeleton className="h-4 w-32" rounded="md" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-24" rounded="md" />
      </div>
    </div>
  );
}

function BookmarkListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <BookmarkItemSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================================================
// PROGRAM BOOKMARK ITEM
// ============================================================================

function ProgramBookmarkItem({
  item,
  onUnbookmark,
  isRemoving,
}: {
  item: BookmarkedProgram;
  onUnbookmark: () => void;
  isRemoving: boolean;
}) {
  const t = useTranslations('profile');
  const deadlineFormatted = formatDeadline(item.program.application_deadline);
  const deadlineStatus = getDeadlineStatus(item.program.application_deadline);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white line-clamp-2">
            {item.program.title}
          </h4>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{item.program.organization}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onUnbookmark}
          disabled={isRemoving}
          className="shrink-0 h-8 w-8 p-0 text-muted hover:text-red-400"
          aria-label={t('bookmarksTab.unbookmark')}
        >
          <BookmarkX className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <Badge variant="default" size="sm">
          {item.program.category.replace(/_/g, ' ')}
        </Badge>
        {deadlineFormatted && (
          <div className="flex items-center gap-1 text-xs text-muted">
            <Calendar className="h-3.5 w-3.5" />
            <span>{deadlineFormatted}</span>
            {deadlineStatus === 'closed' && (
              <Badge variant="error" size="sm" className="ml-1">
                {t('bookmarksTab.closed')}
              </Badge>
            )}
            {deadlineStatus === 'urgent' && (
              <Badge variant="warning" size="sm" className="ml-1">
                {t('bookmarksTab.urgent')}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// POST BOOKMARK ITEM
// ============================================================================

function PostBookmarkItem({
  item,
  onUnbookmark,
  isRemoving,
}: {
  item: BookmarkedPost;
  onUnbookmark: () => void;
  isRemoving: boolean;
}) {
  const t = useTranslations('profile');

  if (!item.post) return null;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Avatar size="sm">
            {item.post.author?.avatar_url ? (
              <AvatarImage src={item.post.author.avatar_url} alt={item.post.author.full_name || ''} />
            ) : null}
            <AvatarFallback>{getInitials(item.post.author?.full_name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white truncate">
                {item.post.author?.full_name || 'Anonymous'}
              </p>
              <span className="text-xs text-muted shrink-0">
                {timeAgo(item.post.created_at)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-300 line-clamp-2">{item.post.content}</p>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs text-muted">
                <Heart className="h-3.5 w-3.5" />
                <span>{item.post.like_count}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{item.post.comment_count}</span>
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onUnbookmark}
          disabled={isRemoving}
          className="shrink-0 h-8 w-8 p-0 text-muted hover:text-red-400"
          aria-label={t('bookmarksTab.unbookmark')}
        >
          <BookmarkX className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface BookmarksTabProps {
  userId: string;
  className?: string;
}

export function BookmarksTab({ userId, className }: BookmarksTabProps) {
  const t = useTranslations('profile');
  const { data: bookmarks, isLoading } = useUserBookmarks(userId);
  const unbookmarkMutation = useUnbookmarkMutation();

  const handleUnbookmark = (type: 'post' | 'expert_profile' | 'support_program', id: number) => {
    unbookmarkMutation.mutate(
      { bookmarkableType: type, bookmarkableId: id },
      {
        onSuccess: () => {
          toast.success(t('bookmarksTab.unbookmarkSuccess'));
        },
        onError: () => {
          toast.error(t('bookmarksTab.unbookmarkFailed'));
        },
      }
    );
  };

  const programCount = bookmarks?.programs.length ?? 0;
  const postCount = bookmarks?.posts.length ?? 0;

  return (
    <div className={cn('space-y-4', className)}>
      <Tabs defaultValue="programs">
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="programs" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('bookmarksTab.programs')}
            {programCount > 0 && (
              <Badge variant="default" size="sm">{programCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('activity.posts')}
            {postCount > 0 && (
              <Badge variant="default" size="sm">{postCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Programs Tab */}
        <TabsContent value="programs" className="mt-4">
          {isLoading ? (
            <BookmarkListSkeleton />
          ) : bookmarks && bookmarks.programs.length > 0 ? (
            <div className="space-y-3">
              {bookmarks.programs.map((item) => (
                <ProgramBookmarkItem
                  key={item.id}
                  item={item}
                  onUnbookmark={() => handleUnbookmark('support_program', item.bookmarkable_id)}
                  isRemoving={unbookmarkMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              type="bookmarks"
              title={t('bookmarksTab.noPrograms')}
              description={t('bookmarksTab.noProgramsDescription')}
              size="sm"
              bordered
            />
          )}
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts" className="mt-4">
          {isLoading ? (
            <BookmarkListSkeleton />
          ) : bookmarks && bookmarks.posts.length > 0 ? (
            <div className="space-y-3">
              {bookmarks.posts.map((item) => (
                <PostBookmarkItem
                  key={item.id}
                  item={item}
                  onUnbookmark={() => handleUnbookmark('post', item.bookmarkable_id)}
                  isRemoving={unbookmarkMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              type="posts"
              title={t('bookmarksTab.noPosts')}
              description={t('bookmarksTab.noPostsDescription')}
              size="sm"
              bordered
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
