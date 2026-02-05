'use client';

/**
 * Post Detail Page
 *
 * Displays a single post with full content and comments.
 * Features:
 * - Full post content display
 * - Comments section with CommentList component
 * - Add new comments with CommentForm
 * - Back navigation to feed
 * - Loading skeleton states
 * - 404 handling for non-existent posts
 *
 * Uses customized components from @/components/ui/ and
 * community feature components from @/features/community
 */

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useTranslations, useFormatter, useNow } from 'next-intl';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
} from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/lib/cn';
import { Link, useRouter } from '@/i18n/navigation';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton, SkeletonAvatar, SkeletonText } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Community Feature Components
import { CommentList } from '@/features/community/components';
import {
  usePost,
  useComments,
  useLikeMutation,
  useCreateComment,
} from '@/features/community/api/queries';

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
    'mt-4 gap-2 overflow-hidden rounded-2xl',
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
            className="object-cover"
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
 * Post Detail Skeleton - Loading state for the post
 */
function PostDetailSkeleton() {
  return (
    <Card variant="default" padding="none" className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        {/* Header skeleton */}
        <div className="flex items-start gap-3">
          <SkeletonAvatar size="lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" rounded="md" />
            <Skeleton className="h-4 w-56" rounded="md" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="mt-6">
          <SkeletonText lines={5} />
        </div>

        {/* Actions skeleton */}
        <div className="mt-6 flex items-center gap-4 border-t border-white/[0.08] pt-4">
          <Skeleton className="h-9 w-20" rounded="lg" />
          <Skeleton className="h-9 w-20" rounded="lg" />
          <Skeleton className="h-9 w-20" rounded="lg" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Comments Skeleton - Loading state for comments
 */
function CommentsSkeleton() {
  return (
    <Card variant="default" padding="md" className="mt-4">
      <CardContent className="space-y-4">
        <Skeleton className="h-6 w-32" rounded="md" />
        {/* Comment form skeleton */}
        <div className="flex gap-3">
          <SkeletonAvatar size="md" />
          <Skeleton className="h-12 flex-1" rounded="2xl" />
        </div>
        {/* Comments list skeleton */}
        <div className="space-y-4 pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <SkeletonAvatar size="sm" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" rounded="md" />
                <Skeleton className="h-3 w-full" rounded="md" />
                <Skeleton className="h-3 w-3/4" rounded="md" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Not Found State - When post doesn't exist
 */
function PostNotFound() {
  const t = useTranslations('errors.notFound');

  return (
    <Card variant="default" padding="lg" className="text-center">
      <CardContent className="py-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
          <MessageCircle className="h-8 w-8 text-muted" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">{t('title')}</h2>
        <p className="text-muted mb-6">{t('description')}</p>
        <Button variant="primary" asChild>
          <Link href="/thread">{t('backHome')}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Post Detail Page - Main Component
 */
export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('thread');
  const tPost = useTranslations('thread.post');
  const format = useFormatter();
  const now = useNow({ updateInterval: 1000 * 60 }); // Update every minute

  // Parse post ID from params
  const postId = React.useMemo(() => {
    const id = params?.id;
    if (typeof id === 'string') {
      const parsed = parseInt(id, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }, [params?.id]);

  // Fetch post data
  const {
    data: post,
    isLoading: isLoadingPost,
    isError: isPostError,
  } = usePost(postId ?? 0);

  // Fetch comments
  const {
    data: comments,
    isLoading: isLoadingComments,
  } = useComments(postId ?? 0);

  // Mutations
  const likeMutation = useLikeMutation();
  const createCommentMutation = useCreateComment();

  // Format timestamp
  const formattedTime = React.useMemo(() => {
    if (!post) return '';
    const date = new Date(post.created_at);
    return format.relativeTime(date, now);
  }, [post, format, now]);

  // Handle like action
  const handleLike = () => {
    if (!post) return;
    likeMutation.mutate({
      likeable_type: 'post',
      likeable_id: post.id,
      isCurrentlyLiked: post.is_liked,
    });
  };

  // Handle comment like action
  const handleCommentLike = (commentId: number, isCurrentlyLiked: boolean) => {
    likeMutation.mutate({
      likeable_type: 'comment',
      likeable_id: commentId,
      isCurrentlyLiked,
    });
  };

  // Handle new comment submission
  const handleSubmitComment = (content: string, parentId?: number | null) => {
    if (!postId) return;
    createCommentMutation.mutate({
      post_id: postId,
      content,
      parent_id: parentId ?? undefined,
    });
  };

  // Handle share action
  const handleShare = async () => {
    if (!post) return;
    const url = `${window.location.origin}/thread/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('title'),
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(url);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.push('/thread');
  };

  // Show loading state
  if (isLoadingPost || postId === null) {
    return (
      <div className="py-6 md:py-8">
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted hover:text-white"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('title')}
          </Button>
        </div>

        <PostDetailSkeleton />
        <CommentsSkeleton />
      </div>
    );
  }

  // Show not found state
  if (isPostError || !post) {
    return (
      <div className="py-6 md:py-8">
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted hover:text-white"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('title')}
          </Button>
        </div>

        <PostNotFound />
      </div>
    );
  }

  return (
    <div className="py-6 md:py-8">
      {/* Back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted hover:text-white"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('title')}
        </Button>
      </div>

      {/* Post Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card variant="default" padding="none" className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            {/* Header: Author info and timestamp */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar size="lg">
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
                    <span className="font-semibold text-white text-xl">
                      {post.author.full_name || 'Unknown User'}
                    </span>
                    {post.is_pinned && (
                      <Badge variant="default" size="sm">
                        {tPost('pinned')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-base text-muted">
                    {post.author.company_name && (
                      <>
                        <span>{post.author.company_name}</span>
                        <span className="text-white/20">|</span>
                      </>
                    )}
                    <time dateTime={post.created_at}>{formattedTime}</time>
                    {post.updated_at !== post.created_at && (
                      <Badge variant="muted" size="sm">
                        {tPost('edited')}
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
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    {tPost('copyLink')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-error">
                    {tPost('report')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Content - Full display without truncation */}
            <div className="mt-4">
              <p className="whitespace-pre-wrap text-white text-lg leading-relaxed">
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
            <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4">
              <div className="flex items-center gap-2">
                {/* Like Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className={cn(
                    'gap-2 text-muted hover:text-white hover:bg-white/5',
                    post.is_liked && 'text-error hover:text-error'
                  )}
                >
                  <Heart
                    className={cn(
                      'h-4 w-4 transition-all duration-200',
                      post.is_liked && 'fill-current'
                    )}
                  />
                  <span className="tabular-nums">
                    {post.like_count > 0 && post.like_count}
                  </span>
                  <span className="sr-only">
                    {post.is_liked ? tPost('liked') : tPost('like')}
                  </span>
                </Button>

                {/* Comment Count */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted hover:text-white hover:bg-white/5"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="tabular-nums">
                    {post.comment_count > 0 && post.comment_count}
                  </span>
                  <span className="sr-only">{tPost('comment')}</span>
                </Button>

                {/* Share Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2 text-muted hover:text-white hover:bg-white/5"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">{tPost('share')}</span>
                </Button>
              </div>

              {/* Bookmark button on the right */}
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted hover:text-white"
              >
                <Bookmark className="h-4 w-4" />
                <span className="sr-only">{tPost('bookmark')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Comments Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card variant="default" padding="md" className="mt-4">
          <CardContent>
            {isLoadingComments ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" rounded="md" />
                <div className="flex gap-3">
                  <SkeletonAvatar size="md" />
                  <Skeleton className="h-12 flex-1" rounded="2xl" />
                </div>
                <div className="space-y-4 pt-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <SkeletonAvatar size="sm" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" rounded="md" />
                        <Skeleton className="h-3 w-full" rounded="md" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <CommentList
                comments={comments ?? []}
                postId={postId}
                onLike={handleCommentLike}
                onSubmitComment={handleSubmitComment}
                likingCommentId={
                  likeMutation.isPending && likeMutation.variables?.likeable_type === 'comment'
                    ? likeMutation.variables.likeable_id
                    : null
                }
                isSubmitting={createCommentMutation.isPending}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
