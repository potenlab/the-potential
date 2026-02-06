'use client';

/**
 * Events API Queries
 *
 * TanStack Query hooks for user-generated events with CRUD operations.
 *
 * Features:
 * - Events load with active status
 * - Event type filter (event, ad, announcement)
 * - Category filter
 * - Full-text search
 * - Pagination with page numbers
 * - CRUD operations for event authors
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type {
  UserEvent,
  UserEventWithAuthor,
  UserEventFilters,
  UserEventSearchParams,
  UserEventListResponse,
  UserEventFormData,
} from '../types';
import { eventQueryKeys } from '../types';

// Constants
const DEFAULT_PAGE_SIZE = 12;

// ============================================================================
// USER EVENTS QUERIES
// ============================================================================

/**
 * Fetches a paginated list of user events with filters
 *
 * @param params - Search parameters including filters and pagination
 * @returns List of user events with author info
 */
async function fetchUserEvents(
  params: UserEventSearchParams = {}
): Promise<UserEventListResponse> {
  const {
    eventType,
    category,
    keyword,
    authorId,
    showUpcoming = false,
    limit = DEFAULT_PAGE_SIZE,
    page = 1,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params;

  // Calculate offset from page
  const offset = (page - 1) * limit;

  // Build the base query - only fetch active events
  let query = supabase
    .from('user_events')
    .select(
      `
      id,
      author_id,
      title,
      description,
      event_type,
      category,
      image_url,
      external_url,
      event_date,
      location,
      is_active,
      view_count,
      created_at,
      updated_at,
      profiles!user_events_author_id_fkey (
        id,
        full_name,
        avatar_url,
        company_name
      )
    `,
      { count: 'exact' }
    )
    .eq('is_active', true);

  // Apply event type filter
  if (eventType) {
    query = query.eq('event_type', eventType);
  }

  // Apply category filter
  if (category) {
    query = query.eq('category', category);
  }

  // Apply author filter (for "My Events")
  if (authorId) {
    query = query.eq('author_id', authorId);
  }

  // Apply keyword search (searches title and description)
  if (keyword && keyword.trim()) {
    const searchTerm = `%${keyword.trim()}%`;
    query = query.or(
      `title.ilike.${searchTerm},description.ilike.${searchTerm}`
    );
  }

  // Apply upcoming filter - show only events with future dates
  if (showUpcoming) {
    const now = new Date().toISOString();
    query = query.or(`event_date.gte.${now},event_date.is.null`);
  }

  // Apply sorting
  if (sortBy === 'event_date') {
    query = query.order(sortBy, {
      ascending: sortOrder === 'asc',
      nullsFirst: false,
    });
  } else {
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: rawEvents, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const hasMore = page < totalPages;

  // Transform to UserEventWithAuthor format
  const events: UserEventWithAuthor[] = (rawEvents || []).map((event) => {
    const profile = event.profiles as unknown as {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
      company_name: string | null;
    };

    return {
      id: event.id,
      author_id: event.author_id,
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      category: event.category,
      image_url: event.image_url,
      external_url: event.external_url,
      event_date: event.event_date,
      location: event.location,
      is_active: event.is_active,
      view_count: event.view_count,
      created_at: event.created_at,
      updated_at: event.updated_at,
      author: {
        id: profile?.id || event.author_id,
        full_name: profile?.full_name || null,
        avatar_url: profile?.avatar_url || null,
        company_name: profile?.company_name || null,
      },
    };
  });

  return {
    events,
    totalCount,
    totalPages,
    currentPage: page,
    hasMore,
  };
}

/**
 * useUserEvents - Query hook for user event search with filters
 *
 * @param filters - Optional filters to apply
 * @param options - Optional pagination options
 */
export function useUserEvents(
  filters: UserEventFilters = {},
  options: { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = DEFAULT_PAGE_SIZE } = options;
  const searchParams: UserEventSearchParams = { ...filters, page, limit };

  return useQuery({
    queryKey: eventQueryKeys.list(searchParams),
    queryFn: () => fetchUserEvents(searchParams),
  });
}

/**
 * Fetches a single user event by ID
 *
 * @param id - The event ID
 * @returns User event with author info
 */
async function fetchUserEvent(id: number): Promise<UserEventWithAuthor> {
  const { data: event, error } = await supabase
    .from('user_events')
    .select(
      `
      id,
      author_id,
      title,
      description,
      event_type,
      category,
      image_url,
      external_url,
      event_date,
      location,
      is_active,
      view_count,
      created_at,
      updated_at,
      profiles!user_events_author_id_fkey (
        id,
        full_name,
        avatar_url,
        company_name
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch event: ${error.message}`);
  }

  const profile = event.profiles as unknown as {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    company_name: string | null;
  };

  return {
    id: event.id,
    author_id: event.author_id,
    title: event.title,
    description: event.description,
    event_type: event.event_type,
    category: event.category,
    image_url: event.image_url,
    external_url: event.external_url,
    event_date: event.event_date,
    location: event.location,
    is_active: event.is_active,
    view_count: event.view_count,
    created_at: event.created_at,
    updated_at: event.updated_at,
    author: {
      id: profile?.id || event.author_id,
      full_name: profile?.full_name || null,
      avatar_url: profile?.avatar_url || null,
      company_name: profile?.company_name || null,
    },
  };
}

/**
 * useUserEvent - Query hook for a single user event
 *
 * @param id - The event ID
 */
export function useUserEvent(id: number) {
  return useQuery({
    queryKey: eventQueryKeys.detail(id),
    queryFn: () => fetchUserEvent(id),
    enabled: !!id,
  });
}

// ============================================================================
// USER EVENTS MUTATIONS
// ============================================================================

/**
 * useCreateEventMutation - Mutation hook for creating a new event
 */
export function useCreateEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: UserEventFormData) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to create an event');
      }

      const { data, error } = await supabase
        .from('user_events')
        .insert({
          author_id: user.id,
          title: formData.title,
          description: formData.description || null,
          event_type: formData.event_type,
          category: formData.category || null,
          image_url: formData.image_url || null,
          external_url: formData.external_url || null,
          event_date: formData.event_date || null,
          location: formData.location || null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create event: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate all event lists
      queryClient.invalidateQueries({
        queryKey: eventQueryKeys.lists(),
      });
    },
  });
}

/**
 * useUpdateEventMutation - Mutation hook for updating an event
 */
export function useUpdateEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: number;
      formData: Partial<UserEventFormData>;
    }): Promise<UserEvent> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to update an event');
      }

      const { data, error } = await supabase
        .from('user_events')
        .update({
          title: formData.title,
          description: formData.description,
          event_type: formData.event_type,
          category: formData.category,
          image_url: formData.image_url,
          external_url: formData.external_url,
          event_date: formData.event_date,
          location: formData.location,
        })
        .eq('id', id)
        .eq('author_id', user.id) // Ensure user owns the event
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update event: ${error.message}`);
      }

      return data as UserEvent;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: eventQueryKeys.lists(),
      });
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: eventQueryKeys.detail(data.id),
        });
      }
    },
  });
}

/**
 * useDeleteEventMutation - Mutation hook for deleting an event
 */
export function useDeleteEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to delete an event');
      }

      const { error } = await supabase
        .from('user_events')
        .delete()
        .eq('id', id)
        .eq('author_id', user.id); // Ensure user owns the event

      if (error) {
        throw new Error(`Failed to delete event: ${error.message}`);
      }

      return { id };
    },
    onSuccess: () => {
      // Invalidate all event lists
      queryClient.invalidateQueries({
        queryKey: eventQueryKeys.lists(),
      });
    },
  });
}

/**
 * useIncrementViewCount - Mutation hook for incrementing event view count
 */
export function useIncrementViewCount() {
  return useMutation({
    mutationFn: async (eventId: number) => {
      // Use direct SQL update with increment
      // Note: This is a simple implementation. For high-traffic scenarios,
      // consider using a database function to avoid race conditions.
      const { data: event, error: fetchError } = await supabase
        .from('user_events')
        .select('view_count')
        .eq('id', eventId)
        .single();

      if (fetchError) {
        console.error('Failed to fetch event for view count:', fetchError);
        return { eventId };
      }

      const { error: updateError } = await supabase
        .from('user_events')
        .update({ view_count: (event?.view_count || 0) + 1 })
        .eq('id', eventId);

      if (updateError) {
        // Don't throw - view count increment is not critical
        console.error('Failed to increment view count:', updateError);
      }

      return { eventId };
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * useEventMutations - Convenience hook that returns all event mutations
 *
 * @returns Object containing all mutation hooks
 */
export function useEventMutations() {
  const create = useCreateEventMutation();
  const update = useUpdateEventMutation();
  const deleteEvent = useDeleteEventMutation();
  const incrementView = useIncrementViewCount();

  return {
    create,
    update,
    delete: deleteEvent,
    incrementView,
  };
}
