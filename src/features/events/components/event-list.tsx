'use client';

/**
 * Event List Component
 *
 * Displays a grid of event cards with:
 * - Responsive grid layout
 * - Loading skeletons
 * - Empty state
 * - Pagination controls
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

import { EventCard } from './event-card';
import type { UserEventWithAuthor } from '../types';

/**
 * Props for EventList
 */
export interface EventListProps {
  /** List of events to display */
  events: UserEventWithAuthor[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Total number of pages */
  totalPages?: number;
  /** Current page number */
  currentPage?: number;
  /** Callback for page change */
  onPageChange?: (page: number) => void;
  /** Callback for event card click */
  onEventClick?: (event: UserEventWithAuthor) => void;
  /** Current user ID for showing edit/delete actions */
  currentUserId?: string;
  /** Callback for edit action */
  onEdit?: (event: UserEventWithAuthor) => void;
  /** Callback for delete action */
  onDelete?: (event: UserEventWithAuthor) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Event Card Skeleton for loading state
 */
function EventCardSkeleton() {
  return (
    <div className="w-full rounded-3xl border border-white/[0.08] bg-card overflow-hidden">
      {/* Image area */}
      <Skeleton className="h-32 w-full" rounded="none" />
      {/* Content area */}
      <div className="p-4 space-y-3">
        {/* Event type badge */}
        <Skeleton className="h-5 w-16" rounded="full" />
        {/* Title */}
        <Skeleton className="h-5 w-3/4" rounded="md" />
        {/* Author */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" rounded="full" />
          <Skeleton className="h-4 w-1/2" rounded="md" />
        </div>
        {/* Description */}
        <Skeleton className="h-4 w-full" rounded="md" />
        <Skeleton className="h-4 w-2/3" rounded="md" />
        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.08] pt-3 mt-3">
          <Skeleton className="h-3 w-24" rounded="md" />
          <Skeleton className="h-3 w-16" rounded="md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Grid for events
 */
function LoadingGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({
  message,
  description,
}: {
  message: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
        <Search className="h-8 w-8 text-muted" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{message}</h3>
      <p className="max-w-sm text-sm text-muted">{description}</p>
    </div>
  );
}

/**
 * Pagination Component
 */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations('common');

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        {t('previous')}
      </Button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-muted">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'primary' : 'ghost'}
              size="sm"
              className="min-w-[36px]"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          )
        )}
      </div>

      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        {t('next')}
      </Button>
    </div>
  );
}

/**
 * Event List Component
 */
export function EventList({
  events,
  isLoading = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  onEventClick,
  currentUserId,
  onEdit,
  onDelete,
  className,
}: EventListProps) {
  const t = useTranslations('events');

  // Loading state
  if (isLoading) {
    return <LoadingGrid />;
  }

  // Empty state
  if (events.length === 0) {
    return (
      <EmptyState
        message={t('empty')}
        description={t('emptyDescription')}
      />
    );
  }

  return (
    <div className={className}>
      {/* Event Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => onEventClick?.(event)}
            fullWidth
            showActions={!!currentUserId}
            currentUserId={currentUserId}
            onEdit={() => onEdit?.(event)}
            onDelete={() => onDelete?.(event)}
          />
        ))}
      </div>

      {/* Pagination */}
      {onPageChange && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

export default EventList;
