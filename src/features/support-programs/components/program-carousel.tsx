'use client';

/**
 * Program Carousel Component
 *
 * Horizontal scroll carousel for support programs with:
 * - Category filter tabs to update displayed cards
 * - Horizontal scrolling with touch swipe support on mobile
 * - Optional scroll snap for better UX
 * - Uses Carousel and Tabs from @/components/ui/
 * - Translations via useTranslations('supportPrograms')
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/cn';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { useSupportPrograms } from '../api/queries';
import { ProgramCard } from './program-card';
import type { ProgramCategory, SupportProgramWithBookmark } from '../types';

/**
 * Category options for filter tabs
 * Maps to translation keys in supportPrograms.categories
 * Only includes valid database program_category values
 */
const CATEGORY_OPTIONS: Array<{ value: ProgramCategory | 'all'; translationKey: string }> = [
  { value: 'all', translationKey: 'all' },
  { value: 'funding', translationKey: 'funding' },
  { value: 'mentoring', translationKey: 'mentoring' },
  { value: 'space', translationKey: 'space' },
  { value: 'education', translationKey: 'education' },
  { value: 'networking', translationKey: 'networking' },
  { value: 'other', translationKey: 'other' },
];

export interface ProgramCarouselProps {
  /** Additional CSS classes */
  className?: string;
  /** Enable scroll snap behavior */
  enableScrollSnap?: boolean;
  /** Callback when a program card is clicked */
  onProgramClick?: (program: SupportProgramWithBookmark) => void;
  /** Maximum number of programs to display */
  maxItems?: number;
  /** Show category filter tabs */
  showCategoryFilter?: boolean;
  /** Initial category filter */
  initialCategory?: ProgramCategory | 'all';
  /** Title to display above the carousel */
  title?: string;
  /** Show view all button */
  showViewAll?: boolean;
  /** Callback for view all button */
  onViewAll?: () => void;
}

/**
 * Loading skeleton for carousel
 */
function CarouselSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="w-[320px] shrink-0">
          <Skeleton className="h-[280px] w-full rounded-3xl" />
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[200px] items-center justify-center rounded-3xl border border-white/10 bg-card/50">
      <p className="text-muted">{message}</p>
    </div>
  );
}

/**
 * Program Carousel Component
 */
export function ProgramCarousel({
  className,
  enableScrollSnap = true,
  onProgramClick,
  maxItems,
  showCategoryFilter = true,
  initialCategory = 'all',
  title,
  showViewAll = false,
  onViewAll,
}: ProgramCarouselProps) {
  const t = useTranslations('supportPrograms');
  const tCategories = useTranslations('supportPrograms.categories');

  // State for selected category filter
  const [selectedCategory, setSelectedCategory] = React.useState<ProgramCategory | 'all'>(
    initialCategory
  );

  // Carousel API state
  const [api, setApi] = React.useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  // Fetch programs with category filter
  const { data, isLoading, isError } = useSupportPrograms({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    showUpcoming: true,
  });

  // Get programs to display
  const allPrograms = data?.programs ?? [];
  const programs = maxItems ? allPrograms.slice(0, maxItems) : allPrograms;

  // Update carousel scroll state
  React.useEffect(() => {
    if (!api) return;

    const updateScrollState = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateScrollState();
    api.on('select', updateScrollState);
    api.on('reInit', updateScrollState);

    return () => {
      api.off('select', updateScrollState);
      api.off('reInit', updateScrollState);
    };
  }, [api]);

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as ProgramCategory | 'all');
  };

  // Handle program card click
  const handleProgramClick = (program: SupportProgramWithBookmark) => {
    onProgramClick?.(program);
  };

  // Handle scroll navigation
  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  return (
    <div className={cn('w-full', className)}>
      {/* Header with title, category filter, and view all */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Title and View All */}
        <div className="flex items-center justify-between gap-4">
          {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
          {showViewAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="text-primary hover:text-primary/80"
            >
              {t('card.viewDetails')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Category Filter Tabs */}
        {showCategoryFilter && (
          <Tabs
            value={selectedCategory}
            onValueChange={handleCategoryChange}
            className="w-full sm:w-auto"
          >
            <TabsList variant="pills" className="flex-wrap justify-start">
              {CATEGORY_OPTIONS.map((category) => (
                <TabsTrigger
                  key={category.value}
                  value={category.value}
                  className="text-xs sm:text-sm"
                >
                  {tCategories(category.translationKey)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>

      {/* Carousel Content */}
      {isLoading ? (
        <CarouselSkeleton />
      ) : isError ? (
        <EmptyState message={t('empty')} />
      ) : programs.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : (
        <div className="relative">
          <Carousel
            opts={{
              align: 'start',
              loop: false,
              dragFree: !enableScrollSnap,
              containScroll: 'trimSnaps',
            }}
            setApi={setApi}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {programs.map((program) => (
                <CarouselItem
                  key={program.id}
                  className={cn(
                    'pl-4',
                    // Fixed width for horizontal scroll
                    'basis-auto'
                  )}
                >
                  <ProgramCard
                    program={program}
                    onClick={() => handleProgramClick(program)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Custom Navigation Buttons */}
            <div className="absolute -left-4 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  'h-10 w-10 rounded-full border-white/10 bg-card/80 backdrop-blur-sm',
                  'hover:bg-card hover:border-white/20',
                  'disabled:opacity-0'
                )}
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
            <div className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  'h-10 w-10 rounded-full border-white/10 bg-card/80 backdrop-blur-sm',
                  'hover:bg-card hover:border-white/20',
                  'disabled:opacity-0'
                )}
                onClick={scrollNext}
                disabled={!canScrollNext}
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </Carousel>

          {/* Scroll Indicators (mobile hint) */}
          <div className="mt-4 flex justify-center gap-1.5 lg:hidden">
            {programs.length > 1 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted">
                  {t('card.viewDetails')}
                </span>
                <ChevronRight className="h-3 w-3 animate-pulse text-muted" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgramCarousel;
