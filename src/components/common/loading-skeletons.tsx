"use client";

import * as React from "react";
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonButton,
} from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

/**
 * Loading Skeleton Components
 *
 * Pre-built skeleton components matching component dimensions
 * for various feature areas in The Potential.
 *
 * Uses the customized Skeleton wrapper from @/components/ui/
 */

// ============================================
// Post Card Skeleton
// ============================================
export function PostCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-5 rounded-3xl bg-card border border-white/8 space-y-4",
        className
      )}
    >
      {/* Header: Avatar + Author Info */}
      <div className="flex items-start gap-3">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" rounded="md" />
          <Skeleton className="h-3 w-24" rounded="md" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <SkeletonText lines={3} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2">
        <Skeleton className="h-8 w-16" rounded="2xl" />
        <Skeleton className="h-8 w-16" rounded="2xl" />
        <Skeleton className="h-8 w-16" rounded="2xl" />
      </div>
    </div>
  );
}

// ============================================
// Expert Card Skeleton
// ============================================
export function ExpertCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-5 rounded-3xl bg-card border border-white/8 space-y-4",
        className
      )}
    >
      {/* Avatar */}
      <div className="flex justify-center">
        <SkeletonAvatar size="lg" />
      </div>

      {/* Name and Company */}
      <div className="text-center space-y-2">
        <Skeleton className="h-5 w-32 mx-auto" rounded="md" />
        <Skeleton className="h-4 w-24 mx-auto" rounded="md" />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap justify-center gap-2">
        <Skeleton className="h-6 w-16" rounded="full" />
        <Skeleton className="h-6 w-20" rounded="full" />
        <Skeleton className="h-6 w-14" rounded="full" />
      </div>

      {/* Button */}
      <div className="pt-2">
        <SkeletonButton size="lg" className="w-full" />
      </div>
    </div>
  );
}

// ============================================
// Program Card Skeleton
// ============================================
export function ProgramCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-[300px] p-5 rounded-3xl bg-card border border-white/8 space-y-4 flex-shrink-0",
        className
      )}
    >
      {/* Category Badge */}
      <Skeleton className="h-6 w-20" rounded="full" />

      {/* Title */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-full" rounded="md" />
        <Skeleton className="h-5 w-3/4" rounded="md" />
      </div>

      {/* Organization */}
      <Skeleton className="h-4 w-24" rounded="md" />

      {/* Deadline */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-20" rounded="md" />
        <Skeleton className="h-6 w-16" rounded="full" />
      </div>
    </div>
  );
}

// ============================================
// Profile Header Skeleton
// ============================================
export function ProfileHeaderSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-6 md:p-8 rounded-3xl bg-card border border-white/8",
        className
      )}
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <SkeletonAvatar size="xl" />

        {/* Info */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <Skeleton className="h-6 w-40 mx-auto md:mx-0" rounded="md" />
          <Skeleton className="h-4 w-32 mx-auto md:mx-0" rounded="md" />
          <Skeleton className="h-4 w-48 mx-auto md:mx-0" rounded="md" />

          {/* Stats */}
          <div className="flex justify-center md:justify-start gap-6 pt-4">
            <div className="text-center">
              <Skeleton className="h-6 w-12 mx-auto" rounded="md" />
              <Skeleton className="h-3 w-16 mx-auto mt-1" rounded="md" />
            </div>
            <div className="text-center">
              <Skeleton className="h-6 w-12 mx-auto" rounded="md" />
              <Skeleton className="h-3 w-16 mx-auto mt-1" rounded="md" />
            </div>
            <div className="text-center">
              <Skeleton className="h-6 w-12 mx-auto" rounded="md" />
              <Skeleton className="h-3 w-16 mx-auto mt-1" rounded="md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Comment Skeleton
// ============================================
export function CommentSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("flex gap-3", className)}>
      <SkeletonAvatar size="sm" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" rounded="md" />
          <Skeleton className="h-3 w-16" rounded="md" />
        </div>
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

// ============================================
// Table Row Skeleton
// ============================================
export function TableRowSkeleton({
  columns = 4,
  className,
}: {
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 border-b border-white/8",
        className
      )}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4 flex-1",
            i === 0 && "max-w-[200px]",
            i === columns - 1 && "max-w-[100px]"
          )}
          rounded="md"
        />
      ))}
    </div>
  );
}

// ============================================
// Feed Skeleton (Multiple Posts)
// ============================================
export function FeedSkeleton({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================
// Expert Grid Skeleton
// ============================================
export function ExpertGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ExpertCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================
// Program Carousel Skeleton
// ============================================
export function ProgramCarouselSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-4 overflow-hidden", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ProgramCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================
// Comment List Skeleton
// ============================================
export function CommentListSkeleton({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CommentSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================
// Table Skeleton
// ============================================
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-3xl border border-white/8 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-card-secondary border-b border-white/8">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" rounded="md" variant="lighter" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </div>
  );
}

// ============================================
// Page Header Skeleton
// ============================================
export function PageHeaderSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-8 w-48" rounded="md" />
      <Skeleton className="h-4 w-96 max-w-full" rounded="md" />
    </div>
  );
}

// ============================================
// Filter Panel Skeleton
// ============================================
export function FilterPanelSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-5 rounded-3xl bg-card border border-white/8 space-y-4",
        className
      )}
    >
      <Skeleton className="h-5 w-20" rounded="md" />

      <div className="space-y-3">
        <Skeleton className="h-12 w-full" rounded="2xl" />
        <Skeleton className="h-12 w-full" rounded="2xl" />
        <Skeleton className="h-12 w-full" rounded="2xl" />
      </div>

      <div className="flex gap-2 pt-2">
        <SkeletonButton size="md" className="flex-1" />
        <SkeletonButton size="md" className="flex-1" />
      </div>
    </div>
  );
}

// Re-export base skeleton components for convenience
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonButton,
};
