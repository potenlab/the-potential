'use client';

/**
 * Filter Panel Component
 *
 * Filter controls for expert search with:
 * - Category filter (Select dropdown)
 * - Availability toggle (Checkbox)
 * - Price range slider/inputs
 * - Clear all filters button
 *
 * Uses customized UI wrappers from @/components/ui/ and translations.
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { X, SlidersHorizontal } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';

import type { ExpertFilters, ExpertCategory } from '../types';

// Expert categories matching the database enum
const EXPERT_CATEGORIES: ExpertCategory[] = [
  'marketing',
  'development',
  'design',
  'legal',
  'finance',
  'hr',
  'operations',
  'strategy',
  'other',
];

// Price range constants (KRW per hour)
const MIN_PRICE = 0;
const MAX_PRICE = 500000;
const PRICE_STEP = 10000;

export interface FilterPanelProps {
  /** Current filter values */
  filters: ExpertFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: ExpertFilters) => void;
  /** Additional CSS classes */
  className?: string;
  /** Total count of filtered results */
  resultsCount?: number;
  /** Whether the panel is in a mobile drawer/sheet */
  isMobile?: boolean;
}

/**
 * Formats a price value to display string
 */
function formatPrice(value: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Filter Panel Component
 */
export function FilterPanel({
  filters,
  onFiltersChange,
  className,
  resultsCount,
  isMobile = false,
}: FilterPanelProps) {
  const t = useTranslations('experts.filters');
  const tCategories = useTranslations('experts.categories');
  const tCard = useTranslations('experts.card');
  const tExperts = useTranslations('experts');

  // Track whether any filters are active
  const hasActiveFilters = React.useMemo(() => {
    return !!(
      filters.category ||
      filters.keyword ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.isAvailable !== undefined ||
      (filters.regions && filters.regions.length > 0)
    );
  }, [filters]);

  // Handle category change
  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      category: value === 'all' ? undefined : (value as ExpertCategory),
    });
  };

  // Handle availability change
  const handleAvailabilityChange = (checked: boolean | 'indeterminate') => {
    onFiltersChange({
      ...filters,
      isAvailable: checked === true ? true : undefined,
    });
  };

  // Handle price range change
  const handlePriceRangeChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      minPrice: values[0] === MIN_PRICE ? undefined : values[0],
      maxPrice: values[1] === MAX_PRICE ? undefined : values[1],
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    onFiltersChange({});
  };

  // Get current price range values
  const priceRange = React.useMemo(() => {
    return [filters.minPrice ?? MIN_PRICE, filters.maxPrice ?? MAX_PRICE];
  }, [filters.minPrice, filters.maxPrice]);

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        !isMobile && 'rounded-3xl border border-white/[0.08] bg-card p-5',
        className
      )}
      role="region"
      aria-label={t('title')}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-muted" />
          <h3 className="text-lg font-semibold text-white">{t('title')}</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted hover:text-white"
          >
            <X className="mr-1 h-4 w-4" />
            {t('reset')}
          </Button>
        )}
      </div>

      {/* Results count */}
      {resultsCount !== undefined && (
        <p className="text-sm text-muted">
          {resultsCount === 1
            ? tExperts('resultsCountSingular', { count: resultsCount })
            : tExperts('resultsCount', { count: resultsCount })}
        </p>
      )}

      {/* Filters */}
      <Accordion
        type="multiple"
        defaultValue={['category', 'availability', 'price']}
        className="w-full"
      >
        {/* Category Filter */}
        <AccordionItem value="category" className="border-white/[0.08]">
          <AccordionTrigger className="py-3 text-white hover:no-underline">
            {t('category')}
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <Select
              value={filters.category || 'all'}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder={tCategories('all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tCategories('all')}</SelectItem>
                {EXPERT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {tCategories(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        {/* Availability Filter */}
        <AccordionItem value="availability" className="border-white/[0.08]">
          <AccordionTrigger className="py-3 text-white hover:no-underline">
            {t('availability')}
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <label className="flex cursor-pointer items-center gap-3">
              <Checkbox
                checked={filters.isAvailable === true}
                onCheckedChange={handleAvailabilityChange}
              />
              <span className="text-sm text-white">
                {tCard('available')}
              </span>
            </label>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range Filter */}
        <AccordionItem value="price" className="border-white/[0.08]">
          <AccordionTrigger className="py-3 text-white hover:no-underline">
            {t('priceRange')}
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-4">
              {/* Price range display */}
              <div className="flex items-center justify-between text-sm text-muted">
                <span>{formatPrice(priceRange[0])}</span>
                <span>-</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>

              {/* Slider */}
              <Slider
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={PRICE_STEP}
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                className="w-full"
              />

              {/* Min/Max labels */}
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{formatPrice(MIN_PRICE)}</span>
                <span>{formatPrice(MAX_PRICE)}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Apply button for mobile */}
      {isMobile && (
        <Button variant="primary" size="lg" className="mt-4 w-full">
          {t('apply')}
        </Button>
      )}
    </div>
  );
}

/**
 * Collapsed Filter Summary for Mobile
 * Shows active filters as tags
 */
export interface FilterSummaryProps {
  filters: ExpertFilters;
  onClear: () => void;
  className?: string;
}

export function FilterSummary({
  filters,
  onClear,
  className,
}: FilterSummaryProps) {
  const tCategories = useTranslations('experts.categories');
  const t = useTranslations('experts.filters');

  const activeFilters: string[] = [];

  if (filters.category) {
    activeFilters.push(tCategories(filters.category));
  }
  if (filters.isAvailable) {
    activeFilters.push(t('availability'));
  }
  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice ? formatPrice(filters.minPrice) : formatPrice(0);
    const max = filters.maxPrice ? formatPrice(filters.maxPrice) : formatPrice(MAX_PRICE);
    activeFilters.push(`${min} - ${max}`);
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {activeFilters.map((filter, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
        >
          {filter}
        </span>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="h-6 px-2 text-xs text-muted hover:text-white"
      >
        <X className="mr-1 h-3 w-3" />
        {t('reset')}
      </Button>
    </div>
  );
}

export default FilterPanel;
