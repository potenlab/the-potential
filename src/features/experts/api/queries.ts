'use client';

/**
 * Expert Search API Queries
 *
 * TanStack Query hooks for expert search with filters,
 * single expert profile fetching, and collaboration mutations.
 *
 * Features:
 * - Category filter
 * - Keyword search (business_name, service_description, specialty)
 * - Price range filter (hourly_rate)
 * - Availability filter
 * - Multiple filters combine with AND logic
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
  ExpertWithProfile,
  ExpertFilters,
  ExpertSearchParams,
  ExpertListResponse,
  ExpertProfileUser,
  CreateCollaborationInput,
  RespondCollaborationInput,
  CollaborationRequest,
} from '../types';
import { expertQueryKeys, collaborationQueryKeys } from '../types';

// Constants
const DEFAULT_PAGE_SIZE = 20;

// ============================================================================
// EXPERT QUERIES
// ============================================================================

/**
 * Fetches a paginated list of experts with filters
 *
 * @param params - Search parameters including filters and pagination
 * @returns List of experts with profile information
 */
async function fetchExperts(
  params: ExpertSearchParams = {}
): Promise<ExpertListResponse> {
  const {
    category,
    keyword,
    minPrice,
    maxPrice,
    regions,
    isAvailable = true,
    limit = DEFAULT_PAGE_SIZE,
    offset = 0,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params;

  // Build the base query - only fetch approved experts
  let query = supabase
    .from('expert_profiles')
    .select(
      `
      id,
      user_id,
      business_name,
      business_registration_number,
      category,
      subcategories,
      service_description,
      specialty,
      price_range_min,
      price_range_max,
      service_regions,
      portfolio_url,
      portfolio_files,
      status,
      verification_documents,
      verified_at,
      verified_by,
      rejection_reason,
      is_featured,
      is_available,
      view_count,
      contact_count,
      created_at,
      updated_at,
      submitted_at,
      collaboration_needs,
      bio,
      experience_years,
      hourly_rate,
      profile:profiles!user_id(
        id,
        full_name,
        avatar_url,
        company_name
      )
    `,
      { count: 'exact' }
    )
    .eq('status', 'approved');

  // Apply availability filter
  if (isAvailable !== undefined) {
    query = query.eq('is_available', isAvailable);
  }

  // Apply category filter
  if (category) {
    query = query.eq('category', category);
  }

  // Apply keyword search (searches business_name, service_description)
  // Using ilike for case-insensitive partial matching
  if (keyword && keyword.trim()) {
    const searchTerm = `%${keyword.trim()}%`;
    query = query.or(
      `business_name.ilike.${searchTerm},service_description.ilike.${searchTerm}`
    );
  }

  // Apply price range filter (using hourly_rate)
  if (minPrice !== undefined && minPrice !== null) {
    query = query.or(`hourly_rate.gte.${minPrice},hourly_rate.is.null`);
  }
  if (maxPrice !== undefined && maxPrice !== null) {
    query = query.lte('hourly_rate', maxPrice);
  }

  // Apply regions filter (array overlap)
  if (regions && regions.length > 0) {
    query = query.overlaps('service_regions', regions);
  }

  // Apply sorting - featured experts first, then by specified sort
  query = query
    .order('is_featured', { ascending: false })
    .order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: rawExperts, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch experts: ${error.message}`);
  }

  const experts = rawExperts || [];
  const totalCount = count || 0;
  const hasMore = offset + experts.length < totalCount;

  // Transform to ExpertWithProfile format
  const expertsWithProfile: ExpertWithProfile[] = experts.map((expert) => ({
    id: expert.id,
    user_id: expert.user_id,
    business_name: expert.business_name,
    business_registration_number: expert.business_registration_number,
    category: expert.category,
    subcategories: expert.subcategories || [],
    service_description: expert.service_description,
    specialty: expert.specialty || [],
    price_range_min: expert.price_range_min,
    price_range_max: expert.price_range_max,
    service_regions: expert.service_regions || [],
    portfolio_url: expert.portfolio_url,
    portfolio_files: expert.portfolio_files || [],
    status: expert.status,
    verification_documents: expert.verification_documents || [],
    verified_at: expert.verified_at,
    verified_by: expert.verified_by,
    rejection_reason: expert.rejection_reason,
    is_featured: expert.is_featured,
    is_available: expert.is_available,
    view_count: expert.view_count,
    contact_count: expert.contact_count,
    created_at: expert.created_at,
    updated_at: expert.updated_at,
    submitted_at: expert.submitted_at,
    collaboration_needs: expert.collaboration_needs,
    bio: expert.bio,
    experience_years: expert.experience_years,
    hourly_rate: expert.hourly_rate,
    profile: expert.profile as ExpertProfileUser,
  }));

  return {
    experts: expertsWithProfile,
    totalCount,
    hasMore,
  };
}

/**
 * useExperts - Query hook for expert search with filters
 *
 * Features:
 * - Category filter works
 * - Keyword search returns relevant results
 * - Price range filter works
 * - Multiple filters combine correctly (AND logic)
 *
 * @param filters - Optional filters to apply
 */
export function useExperts(filters: ExpertFilters = {}) {
  return useQuery({
    queryKey: expertQueryKeys.list(filters),
    queryFn: () => fetchExperts(filters),
  });
}

/**
 * useExpertsInfinite - Infinite query hook for expert search with pagination
 *
 * @param filters - Optional filters to apply
 */
export function useExpertsInfinite(filters: ExpertFilters = {}) {
  return useInfiniteQuery<
    ExpertListResponse,
    Error,
    InfiniteData<ExpertListResponse>,
    ReturnType<typeof expertQueryKeys.list>,
    number
  >({
    queryKey: expertQueryKeys.list(filters),
    queryFn: ({ pageParam = 0 }) =>
      fetchExperts({ ...filters, offset: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length * DEFAULT_PAGE_SIZE;
    },
    initialPageParam: 0,
  });
}

/**
 * Fetches a single expert profile by ID
 *
 * @param id - The expert profile ID
 * @returns Expert profile with user information
 */
async function fetchExpert(id: string): Promise<ExpertWithProfile> {
  const { data: expert, error } = await supabase
    .from('expert_profiles')
    .select(
      `
      id,
      user_id,
      business_name,
      business_registration_number,
      category,
      subcategories,
      service_description,
      specialty,
      price_range_min,
      price_range_max,
      service_regions,
      portfolio_url,
      portfolio_files,
      status,
      verification_documents,
      verified_at,
      verified_by,
      rejection_reason,
      is_featured,
      is_available,
      view_count,
      contact_count,
      created_at,
      updated_at,
      submitted_at,
      collaboration_needs,
      bio,
      experience_years,
      hourly_rate,
      profile:profiles!user_id(
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
    throw new Error(`Failed to fetch expert: ${error.message}`);
  }

  return {
    id: expert.id,
    user_id: expert.user_id,
    business_name: expert.business_name,
    business_registration_number: expert.business_registration_number,
    category: expert.category,
    subcategories: expert.subcategories || [],
    service_description: expert.service_description,
    specialty: expert.specialty || [],
    price_range_min: expert.price_range_min,
    price_range_max: expert.price_range_max,
    service_regions: expert.service_regions || [],
    portfolio_url: expert.portfolio_url,
    portfolio_files: expert.portfolio_files || [],
    status: expert.status,
    verification_documents: expert.verification_documents || [],
    verified_at: expert.verified_at,
    verified_by: expert.verified_by,
    rejection_reason: expert.rejection_reason,
    is_featured: expert.is_featured,
    is_available: expert.is_available,
    view_count: expert.view_count,
    contact_count: expert.contact_count,
    created_at: expert.created_at,
    updated_at: expert.updated_at,
    submitted_at: expert.submitted_at,
    collaboration_needs: expert.collaboration_needs,
    bio: expert.bio,
    experience_years: expert.experience_years,
    hourly_rate: expert.hourly_rate,
    profile: expert.profile as ExpertProfileUser,
  };
}

/**
 * useExpert - Query hook for a single expert profile
 *
 * @param id - The expert profile ID
 */
export function useExpert(id: string) {
  return useQuery({
    queryKey: expertQueryKeys.detail(id),
    queryFn: () => fetchExpert(id),
    enabled: !!id,
  });
}

// ============================================================================
// COLLABORATION MUTATIONS
// ============================================================================

/**
 * useCreateCollaborationRequest - Mutation hook for creating collaboration requests
 *
 * Creates a new collaboration or coffee chat request to an expert.
 */
export function useCreateCollaborationRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCollaborationInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to send a collaboration request');
      }

      const { data, error } = await supabase
        .from('collaboration_requests')
        .insert({
          sender_id: user.id,
          recipient_id: input.recipient_id,
          expert_profile_id: input.expert_profile_id,
          type: input.type,
          subject: input.subject,
          message: input.message,
          contact_info: input.contact_info || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create request: ${error.message}`);
      }

      return data as CollaborationRequest;
    },
    onSuccess: () => {
      // Invalidate collaboration queries
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.sent() });
    },
  });
}

/**
 * useRespondToCollaboration - Mutation hook for responding to collaboration requests
 *
 * Allows the recipient to accept or decline a request.
 */
export function useRespondToCollaboration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RespondCollaborationInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to respond to a request');
      }

      const { data, error } = await supabase
        .from('collaboration_requests')
        .update({
          status: input.status,
          response_message: input.response_message || null,
          responded_at: new Date().toISOString(),
        })
        .eq('id', input.request_id)
        .eq('recipient_id', user.id) // Ensure only recipient can respond
        .eq('status', 'pending') // Can only respond to pending requests
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to respond to request: ${error.message}`);
      }

      return data as CollaborationRequest;
    },
    onSuccess: () => {
      // Invalidate collaboration queries
      queryClient.invalidateQueries({
        queryKey: collaborationQueryKeys.received(),
      });
    },
  });
}

/**
 * useCancelCollaborationRequest - Mutation hook for cancelling a sent request
 *
 * Allows the sender to cancel a pending request.
 */
export function useCancelCollaborationRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: number) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to cancel a request');
      }

      const { data, error } = await supabase
        .from('collaboration_requests')
        .update({
          status: 'cancelled',
        })
        .eq('id', requestId)
        .eq('sender_id', user.id) // Ensure only sender can cancel
        .eq('status', 'pending') // Can only cancel pending requests
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to cancel request: ${error.message}`);
      }

      return data as CollaborationRequest;
    },
    onSuccess: () => {
      // Invalidate collaboration queries
      queryClient.invalidateQueries({ queryKey: collaborationQueryKeys.sent() });
    },
  });
}

/**
 * useExpertMutations - Convenience hook that returns all expert-related mutations
 *
 * @returns Object containing all mutation hooks
 */
export function useExpertMutations() {
  const createCollaboration = useCreateCollaborationRequest();
  const respondToCollaboration = useRespondToCollaboration();
  const cancelCollaboration = useCancelCollaborationRequest();

  return {
    createCollaboration,
    respondToCollaboration,
    cancelCollaboration,
  };
}

// ============================================================================
// COLLABORATION QUERIES
// ============================================================================

/**
 * Fetches collaboration requests sent by the current user
 */
async function fetchSentCollaborations(): Promise<CollaborationRequest[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to view sent requests');
  }

  const { data, error } = await supabase
    .from('collaboration_requests')
    .select('*')
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch sent requests: ${error.message}`);
  }

  return (data || []) as CollaborationRequest[];
}

/**
 * useSentCollaborations - Query hook for requests sent by current user
 */
export function useSentCollaborations() {
  return useQuery({
    queryKey: collaborationQueryKeys.sent(),
    queryFn: fetchSentCollaborations,
  });
}

/**
 * Fetches collaboration requests received by the current user
 */
async function fetchReceivedCollaborations(): Promise<CollaborationRequest[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to view received requests');
  }

  const { data, error } = await supabase
    .from('collaboration_requests')
    .select('*')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch received requests: ${error.message}`);
  }

  return (data || []) as CollaborationRequest[];
}

/**
 * useReceivedCollaborations - Query hook for requests received by current user
 */
export function useReceivedCollaborations() {
  return useQuery({
    queryKey: collaborationQueryKeys.received(),
    queryFn: fetchReceivedCollaborations,
  });
}
