'use client';

/**
 * Support Programs API Queries
 *
 * TanStack Query hooks for support programs with category and deadline filters.
 *
 * Features:
 * - Programs load with published status only
 * - Category filter works
 * - Deadline filter shows upcoming programs
 * - Full-text search works across title, organization, and description
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
} from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type {
  SupportProgram,
  SupportProgramWithBookmark,
  SupportProgramFilters,
  SupportProgramSearchParams,
  SupportProgramListResponse,
} from '../types';
import { supportProgramQueryKeys, bookmarkQueryKeys } from '../types';

// Constants
const DEFAULT_PAGE_SIZE = 20;

// ============================================================================
// SUPPORT PROGRAMS QUERIES
// ============================================================================

/**
 * Fetches a paginated list of support programs with filters
 *
 * @param params - Search parameters including filters and pagination
 * @returns List of support programs with bookmark status
 */
async function fetchSupportPrograms(
  params: SupportProgramSearchParams = {}
): Promise<SupportProgramListResponse> {
  const {
    category,
    keyword,
    showUpcoming = false,
    showOpen = false,
    showClosed = false,
    limit = DEFAULT_PAGE_SIZE,
    offset = 0,
    sortBy = 'application_deadline',
    sortOrder = 'asc',
  } = params;

  // Get current user for bookmark status check (gracefully handle anon users)
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Anonymous user — continue without bookmark status
  }

  // Build the base query - only fetch published programs
  let query = supabase
    .from('support_programs')
    .select(
      `
      id,
      title,
      description,
      organization,
      category,
      amount,
      eligibility,
      benefits,
      external_url,
      image_url,
      application_start,
      application_deadline,
      program_start,
      program_end,
      status,
      created_by,
      view_count,
      bookmark_count,
      created_at,
      updated_at,
      published_at
    `,
      { count: 'exact' }
    )
    .eq('status', 'published');

  // Apply category filter
  if (category) {
    query = query.eq('category', category);
  }

  // Apply keyword search (searches title, organization, description)
  // Using ilike for case-insensitive partial matching
  if (keyword && keyword.trim()) {
    const searchTerm = `%${keyword.trim()}%`;
    query = query.or(
      `title.ilike.${searchTerm},organization.ilike.${searchTerm},description.ilike.${searchTerm}`
    );
  }

  // Apply deadline filter - show only programs with future deadlines
  if (showUpcoming) {
    const now = new Date().toISOString();
    query = query.or(`application_deadline.gt.${now},application_deadline.is.null`);
  }

  // Apply open filter - show only programs currently accepting applications
  if (showOpen) {
    const now = new Date().toISOString();
    query = query.or(
      `and(application_start.lte.${now},application_deadline.gt.${now}),and(application_start.is.null,application_deadline.gt.${now})`
    );
  }

  // Apply closed filter - show only programs with past deadlines
  if (showClosed) {
    const now = new Date().toISOString();
    query = query.not('application_deadline', 'is', null).lte('application_deadline', now);
  }

  // Apply sorting
  // Sort nulls last for deadline-based sorting
  if (sortBy === 'application_deadline') {
    query = query.order(sortBy, {
      ascending: sortOrder === 'asc',
      nullsFirst: false,
    });
  } else {
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: rawPrograms, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch support programs: ${error.message}`);
  }

  const programs = rawPrograms || [];
  const totalCount = count || 0;
  const hasMore = offset + programs.length < totalCount;

  // If user is logged in, batch check bookmark status for all programs
  let bookmarkedProgramIds = new Set<number>();
  if (user && programs.length > 0) {
    const programIds = programs.map((p) => p.id);
    const { data: userBookmarks } = await supabase
      .from('bookmarks')
      .select('bookmarkable_id')
      .eq('bookmarkable_type', 'support_program')
      .eq('user_id', user.id)
      .in('bookmarkable_id', programIds);

    bookmarkedProgramIds = new Set(
      userBookmarks?.map((b) => b.bookmarkable_id) || []
    );
  }

  // Transform to SupportProgramWithBookmark format
  const programsWithBookmark: SupportProgramWithBookmark[] = programs.map(
    (program) => ({
      id: program.id,
      title: program.title,
      description: program.description,
      organization: program.organization,
      category: program.category,
      amount: program.amount,
      eligibility: program.eligibility,
      benefits: program.benefits || [],
      external_url: program.external_url,
      image_url: program.image_url,
      application_start: program.application_start,
      application_deadline: program.application_deadline,
      program_start: program.program_start,
      program_end: program.program_end,
      status: program.status,
      created_by: program.created_by,
      view_count: program.view_count,
      bookmark_count: program.bookmark_count,
      created_at: program.created_at,
      updated_at: program.updated_at,
      published_at: program.published_at,
      is_bookmarked: bookmarkedProgramIds.has(program.id),
    })
  );

  return {
    programs: programsWithBookmark,
    totalCount,
    hasMore,
  };
}

/**
 * useSupportPrograms - Query hook for support program search with filters
 *
 * Features:
 * - Programs load with published status
 * - Category filter works
 * - Deadline filter shows upcoming
 * - Full-text search works
 *
 * @param filters - Optional filters to apply
 */
export function useSupportPrograms(filters: SupportProgramFilters = {}) {
  return useQuery({
    queryKey: supportProgramQueryKeys.list(filters),
    queryFn: () => fetchSupportPrograms(filters),
  });
}

/**
 * useSupportProgramsInfinite - Infinite query hook for support program search with pagination
 *
 * @param filters - Optional filters to apply
 */
export function useSupportProgramsInfinite(filters: SupportProgramFilters = {}) {
  return useInfiniteQuery<
    SupportProgramListResponse,
    Error,
    InfiniteData<SupportProgramListResponse>,
    ReturnType<typeof supportProgramQueryKeys.list>,
    number
  >({
    queryKey: supportProgramQueryKeys.list(filters),
    queryFn: ({ pageParam = 0 }) =>
      fetchSupportPrograms({ ...filters, offset: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length * DEFAULT_PAGE_SIZE;
    },
    initialPageParam: 0,
  });
}

/**
 * Fetches a single support program by ID
 *
 * @param id - The support program ID
 * @returns Support program with bookmark status
 */
async function fetchSupportProgram(
  id: number
): Promise<SupportProgramWithBookmark> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: program, error } = await supabase
    .from('support_programs')
    .select(
      `
      id,
      title,
      description,
      organization,
      category,
      amount,
      eligibility,
      benefits,
      external_url,
      image_url,
      application_start,
      application_deadline,
      program_start,
      program_end,
      status,
      created_by,
      view_count,
      bookmark_count,
      created_at,
      updated_at,
      published_at
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch support program: ${error.message}`);
  }

  // Check if user bookmarked this program
  let isBookmarked = false;
  if (user) {
    const { data: bookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('bookmarkable_type', 'support_program')
      .eq('bookmarkable_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    isBookmarked = !!bookmark;
  }

  return {
    id: program.id,
    title: program.title,
    description: program.description,
    organization: program.organization,
    category: program.category,
    amount: program.amount,
    eligibility: program.eligibility,
    benefits: program.benefits || [],
    external_url: program.external_url,
    image_url: program.image_url,
    application_start: program.application_start,
    application_deadline: program.application_deadline,
    program_start: program.program_start,
    program_end: program.program_end,
    status: program.status,
    created_by: program.created_by,
    view_count: program.view_count,
    bookmark_count: program.bookmark_count,
    created_at: program.created_at,
    updated_at: program.updated_at,
    published_at: program.published_at,
    is_bookmarked: isBookmarked,
  };
}

/**
 * useSupportProgram - Query hook for a single support program
 *
 * @param id - The support program ID
 */
export function useSupportProgram(id: number) {
  return useQuery({
    queryKey: supportProgramQueryKeys.detail(id),
    queryFn: () => fetchSupportProgram(id),
    enabled: !!id,
  });
}

// ============================================================================
// BOOKMARK MUTATIONS
// ============================================================================

/**
 * useBookmarkMutation - Mutation hook for bookmarking/unbookmarking support programs
 *
 * Features:
 * - Optimistic updates for immediate UI feedback
 * - Automatic rollback on error
 * - Handles both bookmark and unbookmark actions
 */
export function useBookmarkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      programId,
      isCurrentlyBookmarked,
    }: {
      programId: number;
      isCurrentlyBookmarked: boolean;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to bookmark');
      }

      if (isCurrentlyBookmarked) {
        // Unbookmark: delete the bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('bookmarkable_type', 'support_program')
          .eq('bookmarkable_id', programId);

        if (error) {
          throw new Error(`Failed to remove bookmark: ${error.message}`);
        }

        return { action: 'unbookmarked' as const, programId };
      } else {
        // Bookmark: upsert to handle duplicate gracefully
        const { error } = await supabase.from('bookmarks').upsert(
          {
            user_id: user.id,
            bookmarkable_type: 'support_program',
            bookmarkable_id: programId,
          },
          { onConflict: 'user_id,bookmarkable_type,bookmarkable_id' }
        );

        if (error) {
          throw new Error(`Failed to bookmark: ${error.message}`);
        }

        return { action: 'bookmarked' as const, programId };
      }
    },
    onMutate: async ({ programId, isCurrentlyBookmarked }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: supportProgramQueryKeys.lists(),
      });
      await queryClient.cancelQueries({
        queryKey: supportProgramQueryKeys.detail(programId),
      });
      await queryClient.cancelQueries({
        queryKey: bookmarkQueryKeys.programs(),
      });

      // Snapshot previous values
      const previousListQueries = queryClient.getQueriesData<SupportProgramListResponse>({
        queryKey: supportProgramQueryKeys.lists(),
      });
      const previousProgram = queryClient.getQueryData<SupportProgramWithBookmark>(
        supportProgramQueryKeys.detail(programId)
      );
      const previousBookmarked = queryClient.getQueryData<SupportProgramWithBookmark[]>(
        bookmarkQueryKeys.programs()
      );

      // Helper to update a program in-place
      const updateProgram = (p: SupportProgramWithBookmark): SupportProgramWithBookmark => {
        if (p.id !== programId) return p;
        return {
          ...p,
          is_bookmarked: !isCurrentlyBookmarked,
          bookmark_count: isCurrentlyBookmarked
            ? Math.max(0, p.bookmark_count - 1)
            : p.bookmark_count + 1,
        };
      };

      // Optimistically update single program detail if cached
      if (previousProgram) {
        queryClient.setQueryData<SupportProgramWithBookmark>(
          supportProgramQueryKeys.detail(programId),
          updateProgram(previousProgram)
        );
      }

      // Optimistically update all list queries that contain this program
      for (const [queryKey, data] of previousListQueries) {
        if (!data) continue;
        queryClient.setQueryData<SupportProgramListResponse>(queryKey, {
          ...data,
          programs: data.programs.map(updateProgram),
        });
      }

      // Optimistically update bookmarked programs list
      if (previousBookmarked) {
        if (isCurrentlyBookmarked) {
          queryClient.setQueryData<SupportProgramWithBookmark[]>(
            bookmarkQueryKeys.programs(),
            previousBookmarked.filter((p) => p.id !== programId)
          );
        }
      }

      // Return context with snapshot for rollback
      return { previousListQueries, previousProgram, previousBookmarked };
    },
    onError: (_err, variables, context) => {
      // Rollback on error
      if (context?.previousProgram) {
        queryClient.setQueryData(
          supportProgramQueryKeys.detail(variables.programId),
          context.previousProgram
        );
      }
      if (context?.previousListQueries) {
        for (const [queryKey, data] of context.previousListQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      if (context?.previousBookmarked) {
        queryClient.setQueryData(
          bookmarkQueryKeys.programs(),
          context.previousBookmarked
        );
      }
    },
    onSettled: (data) => {
      // Refetch to ensure consistency
      if (data) {
        queryClient.invalidateQueries({
          queryKey: supportProgramQueryKeys.lists(),
        });
        queryClient.invalidateQueries({
          queryKey: supportProgramQueryKeys.detail(data.programId),
        });
        queryClient.invalidateQueries({
          queryKey: bookmarkQueryKeys.programs(),
        });
      }
    },
  });
}

// ============================================================================
// BOOKMARK QUERIES
// ============================================================================

/**
 * Fetches bookmarked support programs for the current user
 */
async function fetchBookmarkedPrograms(): Promise<SupportProgramWithBookmark[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to view bookmarks');
  }

  // Get all program bookmarks for the user
  const { data: bookmarks, error: bookmarksError } = await supabase
    .from('bookmarks')
    .select('bookmarkable_id')
    .eq('user_id', user.id)
    .eq('bookmarkable_type', 'support_program')
    .order('created_at', { ascending: false });

  if (bookmarksError) {
    throw new Error(`Failed to fetch bookmarks: ${bookmarksError.message}`);
  }

  if (!bookmarks || bookmarks.length === 0) {
    return [];
  }

  const programIds = bookmarks.map((b) => b.bookmarkable_id);

  // Fetch the actual programs
  const { data: programs, error: programsError } = await supabase
    .from('support_programs')
    .select(
      `
      id,
      title,
      description,
      organization,
      category,
      amount,
      eligibility,
      benefits,
      external_url,
      image_url,
      application_start,
      application_deadline,
      program_start,
      program_end,
      status,
      created_by,
      view_count,
      bookmark_count,
      created_at,
      updated_at,
      published_at
    `
    )
    .in('id', programIds)
    .eq('status', 'published');

  if (programsError) {
    throw new Error(`Failed to fetch programs: ${programsError.message}`);
  }

  // Transform to SupportProgramWithBookmark format (all are bookmarked)
  return (programs || []).map((program) => ({
    id: program.id,
    title: program.title,
    description: program.description,
    organization: program.organization,
    category: program.category,
    amount: program.amount,
    eligibility: program.eligibility,
    benefits: program.benefits || [],
    external_url: program.external_url,
    image_url: program.image_url,
    application_start: program.application_start,
    application_deadline: program.application_deadline,
    program_start: program.program_start,
    program_end: program.program_end,
    status: program.status,
    created_by: program.created_by,
    view_count: program.view_count,
    bookmark_count: program.bookmark_count,
    created_at: program.created_at,
    updated_at: program.updated_at,
    published_at: program.published_at,
    is_bookmarked: true,
  }));
}

/**
 * useBookmarkedPrograms - Query hook for user's bookmarked programs
 */
export function useBookmarkedPrograms() {
  return useQuery({
    queryKey: bookmarkQueryKeys.programs(),
    queryFn: fetchBookmarkedPrograms,
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * useSupportProgramMutations - Convenience hook that returns all support program mutations
 *
 * @returns Object containing all mutation hooks
 */
export function useSupportProgramMutations() {
  const bookmark = useBookmarkMutation();

  return {
    bookmark,
  };
}
