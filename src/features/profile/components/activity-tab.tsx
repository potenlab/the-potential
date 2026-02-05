'use client';

/**
 * Activity Tab Component
 *
 * Tabbed view showing the user's activity:
 * - My Posts: posts created by the user
 * - My Comments: comments on posts with parent post reference
 * - My Likes: posts liked by the user
 *
 * Includes loading skeletons and empty states.
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageCircle,
  Heart,
  FileText,
  ThumbsUp,
  ArrowRight,
} from 'lucide-react';

import { cn } from '@/lib/cn';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';

import { useUserPosts, useUserComments, useUserLikes } from '../api/queries';
import type { PostWithAuthor } from '@/features/community/types';
import type { UserComment, LikedPost } from '../api/queries';

// ============================================================================
// HELPERS
// ============================================================================

function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

function timeAgo(date: string): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
}

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

function ActivityItemSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" rounded="md" />
          <Skeleton className="h-3 w-20" rounded="md" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" rounded="md" />
      <Skeleton className="h-4 w-3/4" rounded="md" />
    </div>
  );
}

function ActivityListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ActivityItemSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================================================
// POST ITEM
// ============================================================================

function PostItem({ post }: { post: PostWithAuthor }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
      <div className="flex items-start gap-3">
        <Avatar size="sm">
          {post.author?.avatar_url ? (
            <AvatarImage src={post.author.avatar_url} alt={post.author.full_name || ''} />
          ) : null}
          <AvatarFallback>{getInitials(post.author?.full_name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white truncate">
              {post.author?.full_name || 'Anonymous'}
            </p>
            <span className="text-xs text-muted shrink-0">{timeAgo(post.created_at)}</span>
          </div>
          <p className="mt-1 text-sm text-gray-300 line-clamp-3">{post.content}</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs text-muted">
              <Heart className={cn('h-3.5 w-3.5', post.is_liked && 'fill-red-400 text-red-400')} />
              <span>{post.like_count}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{post.comment_count}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMMENT ITEM
// ============================================================================

function CommentItem({ comment }: { comment: UserComment }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
      {/* Parent post reference */}
      <div className="mb-3 flex items-center gap-2 text-xs text-muted">
        <ArrowRight className="h-3 w-3" />
        <span className="truncate">
          {comment.post_author_name
            ? `${comment.post_author_name}: `
            : ''}
          {truncate(comment.post_content, 60)}
        </span>
      </div>
      {/* Comment content */}
      <p className="text-sm text-gray-300 line-clamp-3">{comment.content}</p>
      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1 text-xs text-muted">
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>{comment.like_count}</span>
        </div>
        <span className="text-xs text-muted">{timeAgo(comment.created_at)}</span>
      </div>
    </div>
  );
}

// ============================================================================
// LIKED POST ITEM
// ============================================================================

function LikedPostItem({ item }: { item: LikedPost }) {
  if (!item.post) return null;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
      <div className="flex items-start gap-3">
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
            <span className="text-xs text-muted shrink-0">{timeAgo(item.post.created_at)}</span>
          </div>
          <p className="mt-1 text-sm text-gray-300 line-clamp-3">{item.post.content}</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs text-muted">
              <Heart className="h-3.5 w-3.5 fill-red-400 text-red-400" />
              <span>{item.post.like_count}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{item.post.comment_count}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ActivityTabProps {
  userId: string;
  className?: string;
}

export function ActivityTab({ userId, className }: ActivityTabProps) {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');

  const { data: posts, isLoading: postsLoading } = useUserPosts(userId);
  const { data: comments, isLoading: commentsLoading } = useUserComments(userId);
  const { data: likes, isLoading: likesLoading } = useUserLikes(userId);

  return (
    <div className={cn('space-y-4', className)}>
      <Tabs defaultValue="posts">
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('activity.posts')}
            {posts && posts.length > 0 && (
              <Badge variant="default" size="sm">{posts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {t('activity.comments')}
            {comments && comments.length > 0 && (
              <Badge variant="default" size="sm">{comments.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="likes" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            {t('activity.likes')}
            {likes && likes.length > 0 && (
              <Badge variant="default" size="sm">{likes.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="mt-4">
          {postsLoading ? (
            <ActivityListSkeleton />
          ) : posts && posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState
              type="posts"
              title={t('activityTab.noPosts')}
              description={t('activityTab.noPostsDescription')}
              size="sm"
              bordered
            />
          )}
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="mt-4">
          {commentsLoading ? (
            <ActivityListSkeleton />
          ) : comments && comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <EmptyState
              type="comments"
              title={t('activityTab.noComments')}
              description={t('activityTab.noCommentsDescription')}
              size="sm"
              bordered
            />
          )}
        </TabsContent>

        {/* Likes Tab */}
        <TabsContent value="likes" className="mt-4">
          {likesLoading ? (
            <ActivityListSkeleton />
          ) : likes && likes.length > 0 ? (
            <div className="space-y-3">
              {likes.map((item) => (
                <LikedPostItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyState
              type="default"
              icon={Heart}
              title={t('activityTab.noLikes')}
              description={t('activityTab.noLikesDescription')}
              size="sm"
              bordered
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
