'use client';

/**
 * Expert Grid Component
 *
 * Responsive grid layout for displaying expert cards with:
 * - Responsive CSS grid (1 col mobile, 2 col tablet, 3-4 col desktop)
 * - Integration with ExpertCard component
 * - Loading skeleton state
 * - Empty state when no results
 * - Results count header
 *
 * Uses customized UI wrappers from @/components/ui/ and translations.
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

import { ExpertCard } from './expert-card';
import { FilterPanel, FilterSummary } from './filter-panel';
import { useExperts } from '../api/queries';
import type { ExpertWithProfile, ExpertFilters } from '../types';

export interface ExpertGridProps {
  /** Initial filters to apply */
  initialFilters?: ExpertFilters;
  /** Whether to show the filter panel (desktop sidebar) */
  showFilters?: boolean;
  /** Additional CSS classes for the grid container */
  className?: string;
  /** Callback when filters change */
  onFiltersChange?: (filters: ExpertFilters) => void;
  /** Maximum number of columns (1-4) */
  maxColumns?: 1 | 2 | 3 | 4;
}

/**
 * Expert Card Skeleton for loading state
 */
function ExpertCardSkeleton() {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-card p-5">
      {/* Header with avatar */}
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 shrink-0" rounded="full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" rounded="md" />
          <Skeleton className="h-4 w-1/2" rounded="md" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" rounded="full" />
            <Skeleton className="h-5 w-16" rounded="full" />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Skeleton className="h-6 w-20" rounded="full" />
        <Skeleton className="h-6 w-24" rounded="full" />
        <Skeleton className="h-6 w-16" rounded="full" />
      </div>

      {/* Bottom info */}
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-4">
        <Skeleton className="h-4 w-24" rounded="md" />
        <div className="text-right">
          <Skeleton className="h-5 w-20" rounded="md" />
          <Skeleton className="mt-1 h-3 w-12" rounded="md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */
interface EmptyStateProps {
  onClearFilters?: () => void;
}

function EmptyState({ onClearFilters }: EmptyStateProps) {
  const t = useTranslations('experts');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
        <Search className="h-8 w-8 text-muted" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{t('empty')}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted">{t('emptyDescription')}</p>
      {onClearFilters && (
        <Button variant="secondary" onClick={onClearFilters}>
          {t('filters.reset')}
        </Button>
      )}
    </motion.div>
  );
}

/**
 * Results Header Component
 */
interface ResultsHeaderProps {
  count: number;
  filters: ExpertFilters;
  onClearFilters: () => void;
}

function ResultsHeader({ count, filters, onClearFilters }: ResultsHeaderProps) {
  const t = useTranslations('experts');

  const hasActiveFilters = !!(
    filters.category ||
    filters.keyword ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.isAvailable !== undefined
  );

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-muted" />
        <span className="text-sm text-muted">
          {count === 1
            ? t('resultsCountSingular', { count })
            : t('resultsCount', { count })}
        </span>
      </div>

      {/* Active filters summary (mobile) */}
      {hasActiveFilters && (
        <div className="sm:hidden">
          <FilterSummary
            filters={filters}
            onClear={onClearFilters}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Expert Grid Component
 */
export function ExpertGrid({
  initialFilters = {},
  showFilters = true,
  className,
  onFiltersChange,
  maxColumns = 4,
}: ExpertGridProps) {
  const t = useTranslations('experts');

  // Filters state
  const [filters, setFilters] = React.useState<ExpertFilters>(initialFilters);

  // Fetch experts with filters
  const { data, isLoading, isError, error, refetch } = useExperts(filters);

  // Handle filter changes
  const handleFiltersChange = React.useCallback(
    (newFilters: ExpertFilters) => {
      setFilters(newFilters);
      onFiltersChange?.(newFilters);
    },
    [onFiltersChange]
  );

  // Clear all filters
  const handleClearFilters = React.useCallback(() => {
    setFilters({});
    onFiltersChange?.({});
  }, [onFiltersChange]);

  // Get experts from response
  const experts = data?.experts ?? [];
  const totalCount = data?.totalCount ?? 0;

  // Grid columns class based on maxColumns
  const gridColumnsClass = React.useMemo(() => {
    switch (maxColumns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  }, [maxColumns]);

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="mb-4 text-sm text-error">
          {error?.message || t('error')}
        </p>
        <Button variant="secondary" onClick={() => refetch()}>
          {t('retry') || 'Retry'}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6 lg:flex-row', className)}>
      {/* Filter Panel (Desktop Sidebar) */}
      {showFilters && (
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24">
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              resultsCount={totalCount}
            />
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="min-w-0 flex-1">
        {/* Results Header */}
        {!isLoading && (
          <ResultsHeader
            count={totalCount}
            filters={filters}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className={cn('grid gap-4', gridColumnsClass)}>
            {Array.from({ length: 8 }).map((_, index) => (
              <ExpertCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && experts.length === 0 && (
          <EmptyState onClearFilters={handleClearFilters} />
        )}

        {/* Expert Cards Grid */}
        {!isLoading && experts.length > 0 && (
          <AnimatePresence mode="popLayout">
            <motion.div
              className={cn('grid gap-4', gridColumnsClass)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {experts.map((expert, index) => (
                <motion.div
                  key={expert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  <ExpertCard expert={expert} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

/**
 * Standalone Expert Grid (without integrated filters)
 * Useful for embedding in pages that manage filters separately
 */
export interface ExpertGridSimpleProps {
  /** Expert data to display */
  experts: ExpertWithProfile[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Total count for display */
  totalCount?: number;
  /** Maximum columns */
  maxColumns?: 1 | 2 | 3 | 4;
  /** Additional CSS classes */
  className?: string;
  /** Show results header */
  showHeader?: boolean;
}

export function ExpertGridSimple({
  experts,
  isLoading = false,
  totalCount,
  maxColumns = 4,
  className,
  showHeader = true,
}: ExpertGridSimpleProps) {
  const t = useTranslations('experts');

  const count = totalCount ?? experts.length;

  // Grid columns class based on maxColumns
  const gridColumnsClass = React.useMemo(() => {
    switch (maxColumns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  }, [maxColumns]);

  // Loading State
  if (isLoading) {
    return (
      <div className={cn('grid gap-4', gridColumnsClass, className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <ExpertCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Empty State
  if (experts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={className}>
      {/* Results Header */}
      {showHeader && (
        <div className="mb-6 flex items-center gap-2">
          <Users className="h-5 w-5 text-muted" />
          <span className="text-sm text-muted">
            {count === 1
              ? t('resultsCountSingular', { count })
              : t('resultsCount', { count })}
          </span>
        </div>
      )}

      {/* Expert Cards Grid */}
      <AnimatePresence mode="popLayout">
        <motion.div
          className={cn('grid gap-4', gridColumnsClass)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {experts.map((expert, index) => (
            <motion.div
              key={expert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              <ExpertCard expert={expert} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default ExpertGrid;
