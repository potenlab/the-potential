'use client';

/**
 * Support Programs Page
 *
 * Main support programs listing page with:
 * - Page header with title and subtitle
 * - Search input for filtering programs
 * - Category filter tabs
 * - Grid/list of program cards
 * - Click on card opens detail modal
 * - Empty state when no results
 * - Responsive layout (grid on desktop, list on mobile)
 *
 * Uses customized components from @/components/ui/ and
 * support-programs feature components from @/features/support-programs
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

// UI Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// Support Programs Feature Components
import { ProgramCard, ProgramDetailModal } from '@/features/support-programs/components';
import { useSupportPrograms } from '@/features/support-programs/api/queries';
import type { SupportProgramWithBookmark } from '@/features/support-programs/types';

/**
 * Status filter options
 */
type StatusFilter = 'all' | 'ongoing' | 'closed';
const STATUS_OPTIONS: Array<{ value: StatusFilter; translationKey: string }> = [
  { value: 'all', translationKey: 'all' },
  { value: 'ongoing', translationKey: 'ongoing' },
  { value: 'closed', translationKey: 'closed' },
];

/**
 * Program Card Skeleton for loading state
 */
function ProgramCardSkeleton() {
  return (
    <div className="w-full rounded-3xl border border-white/[0.08] bg-card overflow-hidden">
      {/* Image area */}
      <Skeleton className="h-32 w-full" rounded="none" />
      {/* Content area */}
      <div className="p-4 space-y-3">
        {/* Title and deadline */}
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-3/4" rounded="md" />
          <Skeleton className="h-5 w-16" rounded="full" />
        </div>
        {/* Organization */}
        <Skeleton className="h-4 w-1/2" rounded="md" />
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
 * Loading Grid for programs
 */
function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <ProgramCardSkeleton key={index} />
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
  onClearFilters,
}: {
  message: string;
  description: string;
  onClearFilters?: () => void;
}) {
  const t = useTranslations('supportPrograms.filters');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
        <Search className="h-8 w-8 text-muted" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{message}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted">{description}</p>
      {onClearFilters && (
        <Button variant="secondary" onClick={onClearFilters}>
          {t('reset')}
        </Button>
      )}
    </div>
  );
}

/**
 * Mobile Filter Panel Component
 */
function MobileFilterPanel({
  selectedStatus,
  onStatusChange,
  onClear,
  onClose,
}: {
  selectedStatus: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const t = useTranslations('supportPrograms');
  const tStatus = useTranslations('supportPrograms.status');

  return (
    <div className="space-y-6">
      {/* Status Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white">{t('filters.title')}</h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={selectedStatus === option.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onStatusChange(option.value)}
            >
              {tStatus(option.translationKey)}
            </Button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-white/10">
        <Button variant="outline" className="flex-1" onClick={onClear}>
          {t('filters.reset')}
        </Button>
        <Button variant="primary" className="flex-1" onClick={onClose}>
          {t('filters.apply')}
        </Button>
      </div>
    </div>
  );
}

/**
 * SupportProgramsPage - Main page component
 */
export default function SupportProgramsPage() {
  const t = useTranslations('supportPrograms');
  const tStatus = useTranslations('supportPrograms.status');

  // Mobile filter sheet state
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState<StatusFilter>('all');
  const [debouncedKeyword, setDebouncedKeyword] = React.useState<string | undefined>(undefined);

  // Modal state - store ID only so bookmark state stays synced with query cache
  const [selectedProgramId, setSelectedProgramId] = React.useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Debounced search to avoid too many requests
  const debouncedSetKeyword = useDebouncedCallback((value: string) => {
    setDebouncedKeyword(value || undefined);
  }, 300);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSetKeyword(value);
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value as StatusFilter);
  };

  // Clear search only
  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedKeyword(undefined);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedKeyword(undefined);
    setSelectedStatus('all');
  };

  // Handle program card click - open modal
  const handleProgramClick = (program: SupportProgramWithBookmark) => {
    setSelectedProgramId(program.id);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      // Small delay before clearing selected program for smooth animation
      setTimeout(() => setSelectedProgramId(null), 200);
    }
  };

  // Check if any filters are active
  const hasActiveFilters = React.useMemo(() => {
    return !!(debouncedKeyword || selectedStatus !== 'all');
  }, [debouncedKeyword, selectedStatus]);

  // Fetch programs with current filters
  const { data, isLoading, isError, refetch } = useSupportPrograms({
    keyword: debouncedKeyword,
    showOpen: selectedStatus === 'ongoing',
    showClosed: selectedStatus === 'closed',
  });

  const programs = data?.programs ?? [];
  const totalCount = data?.totalCount ?? 0;

  // Derive selected program from latest query data so bookmark state stays in sync
  const selectedProgram = React.useMemo(
    () => programs.find((p) => p.id === selectedProgramId) ?? null,
    [programs, selectedProgramId]
  );

  return (
    <div className="py-6 md:py-8">
      {/* Page Header */}
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-1 text-muted">{t('subtitle')}</p>
      </header>

      {/* Search and Mobile Filter Toggle */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={handleSearchChange}
            leftIcon={<Search className="h-5 w-5" />}
            rightIcon={
              searchQuery ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="pointer-events-auto cursor-pointer text-muted hover:text-white"
                  aria-label={t('filters.reset')}
                >
                  <X className="h-4 w-4" />
                </button>
              ) : undefined
            }
            className="pr-10"
          />
        </div>

        {/* Mobile Filter Toggle */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="md"
              className="sm:hidden"
              aria-label={t('filters.title')}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {t('filters.title')}
              {hasActiveFilters && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
                  !
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full overflow-y-auto bg-background sm:max-w-md"
          >
            <SheetHeader className="mb-4">
              <SheetTitle className="text-white">{t('filters.title')}</SheetTitle>
            </SheetHeader>
            <MobileFilterPanel
              selectedStatus={selectedStatus}
              onStatusChange={handleStatusChange}
              onClear={handleClearFilters}
              onClose={() => setIsFilterOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Status Filter Tabs - Desktop */}
      <div className="mb-6 hidden sm:block">
        <Tabs
          value={selectedStatus}
          onValueChange={handleStatusChange}
          className="w-full"
        >
          <TabsList variant="pills" className="flex-wrap justify-start">
            {STATUS_OPTIONS.map((option) => (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className="text-sm"
              >
                {tStatus(option.translationKey)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Active Status Badge - Mobile */}
      {selectedStatus !== 'all' && (
        <div className="mb-4 flex items-center gap-2 sm:hidden">
          <span className="text-sm text-muted">{t('filters.title')}:</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedStatus('all')}
            className="gap-1"
          >
            {tStatus(selectedStatus)}
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Results Count */}
      {!isLoading && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted">
            {t('resultsCount', { count: totalCount })}
          </p>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="hidden text-muted hover:text-white sm:inline-flex"
            >
              {t('filters.reset')}
            </Button>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && <LoadingGrid />}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="mb-4 text-sm text-error">{t('empty')}</p>
          <Button variant="secondary" onClick={() => refetch()}>
            {t('filters.reset')}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && programs.length === 0 && (
        <EmptyState
          message={t('empty')}
          description={t('emptyDescription')}
          onClearFilters={hasActiveFilters ? handleClearFilters : undefined}
        />
      )}

      {/* Program Grid */}
      {!isLoading && !isError && programs.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onClick={() => handleProgramClick(program)}
              fullWidth
            />
          ))}
        </div>
      )}

      {/* Program Detail Modal */}
      <ProgramDetailModal
        program={selectedProgram}
        open={isModalOpen}
        onOpenChange={handleModalClose}
      />
    </div>
  );
}
