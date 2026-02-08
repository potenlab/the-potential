'use client';

/**
 * Events Page
 *
 * Main events listing page with:
 * - Page header with title and subtitle
 * - "Create Event" button (only for authenticated users)
 * - Filter tabs (All, Events, Ads, Announcements)
 * - Search input for filtering events
 * - Category filter
 * - Grid of event cards with pagination
 * - Create/Edit event modal
 * - Event detail modal
 * - Delete confirmation dialog
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Search, X, SlidersHorizontal, Plus, Calendar, Tag, Megaphone, ClipboardList, MoreHorizontal } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

// UI Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Events Feature Components
import {
  EventList,
  CreateEventModal,
  EventDetailModal,
} from '@/features/events/components';
import { useUserEvents, useDeleteEventMutation } from '@/features/events/api/queries';
import type { EventType, UserEventWithAuthor } from '@/features/events/types';

// Supabase
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

/**
 * Category filter options (maps to event_type in database)
 */
const CATEGORY_OPTIONS: Array<{
  value: EventType | 'all';
  translationKey: string;
  icon: React.ElementType;
}> = [
  { value: 'all', translationKey: 'all', icon: Calendar },
  { value: 'event', translationKey: 'event', icon: Calendar },
  { value: 'ad', translationKey: 'ad', icon: Tag },
  { value: 'announcement', translationKey: 'announcement', icon: Megaphone },
  // These require DB enum extension (survey, other)
  // { value: 'survey', translationKey: 'survey', icon: ClipboardList },
  // { value: 'other', translationKey: 'other', icon: MoreHorizontal },
];

/**
 * Sort options
 */
type SortOption = 'latest' | 'popular';
const SORT_OPTIONS: Array<{ value: SortOption; translationKey: string }> = [
  { value: 'latest', translationKey: 'latest' },
  { value: 'popular', translationKey: 'popular' },
];

/**
 * Mobile Filter Panel Component
 */
function MobileFilterPanel({
  selectedCategory,
  selectedSort,
  onCategoryChange,
  onSortChange,
  onClear,
  onClose,
}: {
  selectedCategory: EventType | 'all';
  selectedSort: SortOption;
  onCategoryChange: (category: EventType | 'all') => void;
  onSortChange: (sort: SortOption) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const t = useTranslations('events');
  const tTypes = useTranslations('events.types');
  const tSort = useTranslations('events.sort');

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white">{t('filters.category')}</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={selectedCategory === option.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(option.value)}
            >
              {option.value === 'all' ? t('filters.all') : tTypes(option.translationKey)}
            </Button>
          ))}
        </div>
      </div>

      {/* Sort Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white">{t('filters.sort')}</h3>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={selectedSort === option.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onSortChange(option.value)}
            >
              {tSort(option.translationKey)}
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
 * EventsPage - Main page component
 */
export default function EventsPage() {
  const t = useTranslations('events');
  const tTypes = useTranslations('events.types');
  const tSort = useTranslations('events.sort');
  const tCommon = useTranslations('common');

  // Auth state
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);

  // Fetch current user
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isAuthenticated = !!user;

  // Mobile filter sheet state
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<EventType | 'all'>('all');
  const [selectedSort, setSelectedSort] = React.useState<SortOption>('latest');
  const [debouncedKeyword, setDebouncedKeyword] = React.useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = React.useState(1);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editEvent, setEditEvent] = React.useState<UserEventWithAuthor | null>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<UserEventWithAuthor | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [deleteEvent, setDeleteEvent] = React.useState<UserEventWithAuthor | null>(null);

  // Delete mutation
  const deleteMutation = useDeleteEventMutation();

  // Debounced search to avoid too many requests
  const debouncedSetKeyword = useDebouncedCallback((value: string) => {
    setDebouncedKeyword(value || undefined);
    setCurrentPage(1); // Reset to first page on search
  }, 300);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSetKeyword(value);
  };

  // Handle category change (maps to event_type in DB)
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as EventType | 'all');
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (value: SortOption) => {
    setSelectedSort(value);
  };

  // Clear search only
  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedKeyword(undefined);
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedKeyword(undefined);
    setSelectedCategory('all');
    setSelectedSort('latest');
    setCurrentPage(1);
  };

  // Handle event card click - open detail modal
  const handleEventClick = (event: UserEventWithAuthor) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  // Handle detail modal close
  const handleDetailModalClose = (open: boolean) => {
    setIsDetailModalOpen(open);
    if (!open) {
      // Small delay before clearing selected event for smooth animation
      setTimeout(() => setSelectedEvent(null), 200);
    }
  };

  // Handle create button click
  const handleCreateClick = () => {
    setEditEvent(null);
    setIsCreateModalOpen(true);
  };

  // Handle edit action - only allow if current user is the author
  const handleEdit = (event: UserEventWithAuthor) => {
    // Defensive check: ensure user can only edit their own events
    if (!user || event.author_id !== user.id) {
      console.warn('Attempted to edit event without ownership');
      return;
    }
    setEditEvent(event);
    setIsCreateModalOpen(true);
  };

  // Handle delete action - only allow if current user is the author
  const handleDelete = (event: UserEventWithAuthor) => {
    // Defensive check: ensure user can only delete their own events
    if (!user || event.author_id !== user.id) {
      console.warn('Attempted to delete event without ownership');
      return;
    }
    setDeleteEvent(event);
  };

  // Confirm delete - with additional ownership verification
  const handleConfirmDelete = async () => {
    if (!deleteEvent) return;

    // Defensive check: verify user owns the event before deleting
    if (!user || deleteEvent.author_id !== user.id) {
      console.error('Cannot delete: user does not own this event');
      setDeleteEvent(null);
      return;
    }

    try {
      await deleteMutation.mutateAsync(deleteEvent.id);
      setDeleteEvent(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  // Handle create/edit modal success
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    setEditEvent(null);
  };

  // Check if any filters are active
  const hasActiveFilters = React.useMemo(() => {
    return !!(debouncedKeyword || selectedCategory !== 'all' || selectedSort !== 'latest');
  }, [debouncedKeyword, selectedCategory, selectedSort]);

  // Fetch events with current filters
  const { data, isLoading, isError, refetch } = useUserEvents(
    {
      eventType: selectedCategory === 'all' ? undefined : selectedCategory,
      keyword: debouncedKeyword,
    },
    {
      page: currentPage,
      sortBy: selectedSort === 'popular' ? 'view_count' : 'created_at',
      sortOrder: 'desc',
    }
  );

  const events = data?.events ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="py-6 md:py-8">
      {/* Page Header */}
      <header className="mb-6 md:mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            {t('title')}
          </h1>
          <p className="mt-1 text-muted">{t('subtitle')}</p>
        </div>

        {/* Create Event Button */}
        {isAuthenticated && (
          <Button
            variant="primary"
            onClick={handleCreateClick}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            {t('createEvent')}
          </Button>
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

        {/* Sort Filter - Desktop */}
        <div className="hidden sm:block">
          <Select
            value={selectedSort}
            onValueChange={(value) => handleSortChange(value as SortOption)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t('filters.sort')} />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {tSort(option.translationKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              selectedCategory={selectedCategory}
              selectedSort={selectedSort}
              onCategoryChange={handleCategoryChange}
              onSortChange={handleSortChange}
              onClear={handleClearFilters}
              onClose={() => setIsFilterOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Category Filter Tabs - Desktop */}
      <div className="mb-6 hidden sm:block">
        <Tabs
          value={selectedCategory}
          onValueChange={handleCategoryChange}
          className="w-full"
        >
          <TabsList variant="pills" className="flex-wrap justify-start">
            {CATEGORY_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <TabsTrigger
                  key={option.value}
                  value={option.value}
                  className="gap-2 text-sm"
                >
                  <Icon className="h-4 w-4" />
                  {option.value === 'all' ? t('filters.all') : tTypes(option.translationKey)}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Active Filters Badge - Mobile */}
      {(selectedCategory !== 'all' || selectedSort !== 'latest') && (
        <div className="mb-4 flex flex-wrap items-center gap-2 sm:hidden">
          <span className="text-sm text-muted">{t('filters.title')}:</span>
          {selectedCategory !== 'all' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="gap-1"
            >
              {tTypes(selectedCategory)}
              <X className="h-3 w-3" />
            </Button>
          )}
          {selectedSort !== 'latest' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedSort('latest')}
              className="gap-1"
            >
              {tSort(selectedSort)}
              <X className="h-3 w-3" />
            </Button>
          )}
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

      {/* Error State */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="mb-4 text-sm text-error">{tCommon('error')}</p>
          <Button variant="secondary" onClick={() => refetch()}>
            {tCommon('retry')}
          </Button>
        </div>
      )}

      {/* Event List */}
      {!isError && (
        <EventList
          events={events}
          isLoading={isLoading}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onEventClick={handleEventClick}
          currentUserId={user?.id}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Create/Edit Event Modal */}
      <CreateEventModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        editEvent={editEvent}
        onSuccess={handleCreateSuccess}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        open={isDetailModalOpen}
        onOpenChange={handleDetailModalClose}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteEvent}
        onOpenChange={(open) => !open && setDeleteEvent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirm.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-error text-white hover:bg-error/90"
            >
              {deleteMutation.isPending ? tCommon('loading') : tCommon('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
