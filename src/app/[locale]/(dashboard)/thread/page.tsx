'use client';

/**
 * Thread Feed Page
 *
 * Main community feed page with:
 * - Post composer at the top
 * - Infinite scroll posts feed
 * - Skeleton loading states
 * - Translations via next-intl
 *
 * Uses customized components from @/components/ui/ and
 * community feature components from @/features/community
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useInView } from 'react-intersection-observer';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton, SkeletonAvatar, SkeletonText } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Community Feature Components
import { PostComposer, PostCard } from '@/features/community/components';
import { usePosts, useLikeMutation } from '@/features/community/api/queries';
import { useRouter } from '@/i18n/navigation';

/**
 * PostCardSkeleton - Loading skeleton for post cards
 */
function PostCardSkeleton() {
  return (
    <Card variant="default" padding="none" className="overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        {/* Header skeleton */}
        <div className="flex items-start gap-3">
          <SkeletonAvatar size="md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" rounded="md" />
            <Skeleton className="h-3 w-48" rounded="md" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="mt-4">
          <SkeletonText lines={3} />
        </div>

        {/* Actions skeleton */}
        <div className="mt-4 flex items-center gap-4 border-t border-white/[0.08] pt-3">
          <Skeleton className="h-8 w-16" rounded="lg" />
          <Skeleton className="h-8 w-16" rounded="lg" />
          <Skeleton className="h-8 w-16" rounded="lg" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * FeedLoadingSkeleton - Multiple skeleton cards for initial load
 */
function FeedLoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * EmptyFeed - Empty state when no posts exist
 */
function EmptyFeed({ message }: { message: string }) {
  return (
    <Card variant="default" padding="lg" className="text-center">
      <CardContent className="py-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
          <RefreshCw className="h-8 w-8 text-muted" />
        </div>
        <p className="text-muted">{message}</p>
      </CardContent>
    </Card>
  );
}

/**
 * ThreadFeedPage - Main page component
 */
export default function ThreadFeedPage() {
  const t = useTranslations('thread');
  const router = useRouter();

  // Fetch posts with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = usePosts();

  // Like mutation
  const likeMutation = useLikeMutation();

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // Trigger fetch when load more element is in view
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten posts from all pages
  const posts = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.posts) ?? [];
  }, [data]);

  // Handle like action
  const handleLike = (postId: number, isCurrentlyLiked: boolean) => {
    likeMutation.mutate({
      likeable_type: 'post',
      likeable_id: postId,
      isCurrentlyLiked,
    });
  };

  // Handle comment action - navigate to post detail
  const handleComment = (postId: number) => {
    router.push(`/thread/${postId}`);
  };

  // Handle post click - navigate to post detail
  const handlePostClick = (postId: number) => {
    router.push(`/thread/${postId}`);
  };

  // Handle share action
  const handleShare = async (postId: number) => {
    const url = `${window.location.origin}/thread/${postId}`;
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

  return (
    <div className="py-6 md:py-8">
      {/* Page Header */}
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-1 text-muted">
          {t('subtitle')}
        </p>
      </header>

      {/* Post Composer */}
      <Card variant="default" padding="md" className="mb-6">
        <CardContent>
          <PostComposer />
        </CardContent>
      </Card>

      {/* Feed Content */}
      <div className="space-y-4">
        {/* Loading State - Initial load */}
        {isLoading && <FeedLoadingSkeleton count={5} />}

        {/* Error State */}
        {isError && !isLoading && (
          <Card variant="default" padding="lg" className="text-center">
            <CardContent className="py-8">
              <p className="mb-4 text-error">{t('loading')}</p>
              <Button variant="outline" onClick={() => refetch()}>
                {t('refresh')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !isError && posts.length === 0 && (
          <EmptyFeed message={t('empty')} />
        )}

        {/* Posts List */}
        {!isLoading && !isError && posts.length > 0 && (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                onClick={handlePostClick}
                isLiking={
                  likeMutation.isPending &&
                  likeMutation.variables?.likeable_id === post.id
                }
              />
            ))}

            {/* Load More Trigger */}
            <div
              ref={loadMoreRef}
              className={cn(
                'flex items-center justify-center py-4',
                !hasNextPage && 'hidden'
              )}
            >
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-muted">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{t('loading')}</span>
                </div>
              )}
            </div>

            {/* End of Feed */}
            {!hasNextPage && posts.length > 0 && (
              <div className="py-8 text-center">
                <p className="text-sm text-muted">{t('noMore')}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
