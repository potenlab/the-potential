'use client';

/**
 * Page Loading Components
 *
 * Suspense fallback components for page-level loading states.
 * These provide visual feedback while pages are being loaded.
 *
 * Design:
 * - Consistent with The Potential's dark theme
 * - Minimal layout shift (CLS < 0.1)
 * - Smooth shimmer animations
 */

import * as React from 'react';
import { cn } from '@/lib/cn';
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
} from '@/components/ui/skeleton';

/**
 * Generic page loading skeleton
 */
export function PageLoading({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse space-y-6 p-4 md:p-8', className)}>
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      {/* Content skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Feed/Thread page loading skeleton
 */
export function FeedLoading({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4 p-4', className)}>
      {/* Compose box skeleton */}
      <div className="rounded-3xl bg-card p-4">
        <div className="flex items-start gap-3">
          <SkeletonAvatar size="md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Post skeletons */}
      {[1, 2, 3].map((i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Single post skeleton
 */
export function PostSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-3xl bg-card p-4', className)}>
      <div className="flex items-start gap-3">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <SkeletonText lines={2} />
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-8 w-16 rounded-2xl" />
            <Skeleton className="h-8 w-16 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Expert list page loading skeleton
 */
export function ExpertListLoading({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6 p-4 md:p-8', className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Skeleton className="h-12 flex-1 max-w-md rounded-2xl" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-2xl" />
          <Skeleton className="h-10 w-28 rounded-2xl" />
        </div>
      </div>

      {/* Expert cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ExpertCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Expert card skeleton
 */
export function ExpertCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-3xl bg-card p-6 space-y-4', className)}>
      <div className="flex items-center gap-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-2xl" />
    </div>
  );
}

/**
 * Support programs page loading skeleton
 */
export function ProgramListLoading({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6 p-4 md:p-8', className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-24 flex-shrink-0 rounded-2xl" />
        ))}
      </div>

      {/* Program cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ProgramCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Program card skeleton
 */
export function ProgramCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-3xl bg-card overflow-hidden', className)}>
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * Profile page loading skeleton
 */
export function ProfileLoading({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6 p-4 md:p-8', className)}>
      {/* Profile header */}
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
        <SkeletonAvatar size="xl" />
        <div className="flex-1 space-y-3 text-center md:text-left">
          <Skeleton className="mx-auto h-7 w-48 md:mx-0" />
          <Skeleton className="mx-auto h-4 w-32 md:mx-0" />
          <SkeletonText lines={2} className="max-w-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-2xl" />
      </div>

      {/* Profile sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-3xl bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            <SkeletonText lines={3} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Admin dashboard loading skeleton
 */
export function AdminDashboardLoading({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6 p-4 md:p-8', className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-3xl bg-card p-6 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-3xl bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-32 rounded-2xl" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <SkeletonAvatar size="sm" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40 flex-1" />
              <Skeleton className="h-8 w-20 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default {
  PageLoading,
  FeedLoading,
  PostSkeleton,
  ExpertListLoading,
  ExpertCardSkeleton,
  ProgramListLoading,
  ProgramCardSkeleton,
  ProfileLoading,
  AdminDashboardLoading,
};
