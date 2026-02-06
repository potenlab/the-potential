'use client';

/**
 * Expert Search Page
 *
 * Main expert discovery page with:
 * - Page header with title and subtitle
 * - Search input at top
 * - Filter panel (sidebar on desktop, sheet on mobile)
 * - Expert grid with results
 * - Loading state with skeletons
 * - Empty state when no experts found
 *
 * Uses customized components from @/components/ui/ and
 * expert feature components from @/features/experts
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Search, SlidersHorizontal, X, UserPlus, Clock } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';

// UI Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// Expert Feature Components
import { ExpertGridSimple } from '@/features/experts/components/expert-grid';
import { FilterPanel, FilterSummary } from '@/features/experts/components/filter-panel';
import { useExperts } from '@/features/experts/api/queries';
import type { ExpertFilters } from '@/features/experts/types';

// Skeleton component for loading state
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Expert Card Skeleton for loading state
 * Matches the vertical centered layout of ExpertCard
 */
function ExpertCardSkeleton() {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#121212] p-5">
      {/* Centered avatar */}
      <div className="flex flex-col items-center">
        <Skeleton className="mb-3 h-16 w-16" rounded="full" />
        <Skeleton className="h-5 w-28" rounded="md" />
        <Skeleton className="mt-1.5 h-4 w-20" rounded="md" />
        <div className="mt-2.5 flex gap-2">
          <Skeleton className="h-5 w-16" rounded="full" />
          <Skeleton className="h-5 w-16" rounded="full" />
        </div>
      </div>

      {/* Tags */}
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        <Skeleton className="h-5 w-16" rounded="full" />
        <Skeleton className="h-5 w-20" rounded="full" />
        <Skeleton className="h-5 w-14" rounded="full" />
      </div>

      {/* Bottom info */}
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <Skeleton className="h-4 w-20" rounded="md" />
        <Skeleton className="h-4 w-16" rounded="md" />
      </div>
    </div>
  );
}

/**
 * Loading Skeleton Grid
 */
function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <ExpertCardSkeleton key={index} />
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
  const t = useTranslations('experts.filters');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
        <Search className="h-8 w-8 text-muted" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-white">{message}</h3>
      <p className="mb-6 max-w-sm text-base text-muted">{description}</p>
      {onClearFilters && (
        <Button variant="secondary" onClick={onClearFilters}>
          {t('reset')}
        </Button>
      )}
    </div>
  );
}

/**
 * ExpertSearchPage - Main page component
 */
export default function ExpertSearchPage() {
  const t = useTranslations('experts');
  const { user } = useAuth();

  // Fetch user role and expert application status
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [expertStatus, setExpertStatus] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!user) return;
    // Fetch profile role
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setUserRole(data.role);
      });
    // Fetch expert application status
    supabase
      .from('expert_profiles')
      .select('status')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setExpertStatus(data.status);
      });
  }, [user]);

  const isPending = expertStatus === 'pending_review';

  // Mobile filter sheet state
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<ExpertFilters>({});

  // Debounced search to avoid too many requests
  const debouncedSetKeyword = useDebouncedCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      keyword: value || undefined,
    }));
  }, 300);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSetKeyword(value);
  };

  // Handle filter changes from FilterPanel
  const handleFiltersChange = (newFilters: ExpertFilters) => {
    setFilters(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({});
  };

  // Clear search only
  const handleClearSearch = () => {
    setSearchQuery('');
    setFilters((prev) => ({
      ...prev,
      keyword: undefined,
    }));
  };

  // Check if any filters are active
  const hasActiveFilters = React.useMemo(() => {
    return !!(
      filters.category ||
      filters.keyword ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.isAvailable !== undefined
    );
  }, [filters]);

  // Fetch experts with current filters
  const { data, isLoading, isError, refetch } = useExperts(filters);

  const experts = data?.experts ?? [];
  const totalCount = data?.totalCount ?? 0;

  return (
    <div className="py-6 md:py-8">
      {/* Page Header */}
      <header className="mb-6 md:mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-1 text-muted">{t('subtitle')}</p>
        </div>
        {userRole !== 'expert' && (
          isPending ? (
            <span
              className="shrink-0 flex items-center gap-2 rounded-full bg-[#8B95A1]/20 px-5 py-2.5 text-sm font-semibold text-[#8B95A1] cursor-not-allowed md:px-6 md:py-3 md:text-base"
              aria-disabled="true"
            >
              <Clock className="h-4 w-4 md:h-5 md:w-5" />
              {t('registration.pending')}
            </span>
          ) : (
            <Link
              href="/expert-registration"
              className="shrink-0 flex items-center gap-2 rounded-full bg-[#0079FF] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#0079FF]/90 hover:shadow-[0_0_20px_rgba(0,121,255,0.3)] md:px-6 md:py-3 md:text-base"
            >
              <UserPlus className="h-4 w-4 md:h-5 md:w-5" />
              {t('expertRegistration')}
            </Link>
          )
        )}
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
              className="lg:hidden"
              aria-label={t('filters.title')}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {t('filters.title')}
              {hasActiveFilters && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
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
            <FilterPanel
              filters={filters}
              onFiltersChange={(newFilters) => {
                handleFiltersChange(newFilters);
              }}
              resultsCount={totalCount}
              isMobile
            />
            {/* Close and Apply button for mobile */}
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClearFilters}
              >
                {t('filters.reset')}
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setIsFilterOpen(false)}
              >
                {t('filters.apply')}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Summary (mobile) */}
      {hasActiveFilters && (
        <div className="mb-4 lg:hidden">
          <FilterSummary filters={filters} onClear={handleClearFilters} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filter Panel - Desktop Sidebar */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24">
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              resultsCount={totalCount}
            />
          </div>
        </aside>

        {/* Results Section */}
        <div className="min-w-0 flex-1">
          {/* Results Count Header */}
          {!isLoading && (
            <div className="mb-6 flex items-center justify-between">
              <p className="text-base text-muted">
                {totalCount === 1
                  ? t('resultsCountSingular', { count: totalCount })
                  : t('resultsCount', { count: totalCount })}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && <LoadingGrid />}

          {/* Error State */}
          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="mb-4 text-base text-error">{t('empty')}</p>
              <Button variant="secondary" onClick={() => refetch()}>
                {t('filters.reset')}
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && experts.length === 0 && (
            <EmptyState
              message={t('empty')}
              description={t('emptyDescription')}
              onClearFilters={hasActiveFilters ? handleClearFilters : undefined}
            />
          )}

          {/* Expert Grid */}
          {!isLoading && !isError && experts.length > 0 && (
            <ExpertGridSimple
              experts={experts}
              totalCount={totalCount}
              maxColumns={4}
              showHeader={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
