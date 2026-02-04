'use client';

/**
 * Admin Expert Verification API Queries
 *
 * TanStack Query hooks for admin expert verification workflow.
 *
 * Features:
 * - Fetch pending experts (status = 'pending_review')
 * - Approve expert (status -> 'approved')
 * - Reject expert (status -> 'rejected' with reason)
 * - Create notification for expert
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

// Types
export type ExpertStatus = Database['public']['Enums']['expert_status'];

export interface AdminExpertProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_registration_number: string | null;
  category: Database['public']['Enums']['expert_category'];
  subcategories: string[];
  service_description: string | null;
  specialty: string[];
  status: ExpertStatus;
  verification_documents: string[];
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  rejection_reason: string | null;
  bio: string | null;
  experience_years: number | null;
  profile: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    company_name: string | null;
  };
}

export interface AdminExpertListResponse {
  experts: AdminExpertProfile[];
  totalCount: number;
}

export interface ApproveExpertInput {
  expertId: string;
  userId: string;
}

export interface RejectExpertInput {
  expertId: string;
  userId: string;
  reason: string;
}

// Query keys
export const adminExpertQueryKeys = {
  all: ['admin', 'experts'] as const,
  lists: () => [...adminExpertQueryKeys.all, 'list'] as const,
  list: (status?: ExpertStatus) => [...adminExpertQueryKeys.lists(), status] as const,
  detail: (id: string) => [...adminExpertQueryKeys.all, 'detail', id] as const,
} as const;

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Fetches expert profiles for admin verification
 *
 * @param status - Filter by expert status (default: 'pending_review')
 * @returns List of expert profiles with user information
 */
async function fetchAdminExperts(
  status?: ExpertStatus
): Promise<AdminExpertListResponse> {
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
      status,
      verification_documents,
      submitted_at,
      created_at,
      updated_at,
      rejection_reason,
      bio,
      experience_years,
      profile:profiles!user_id(
        id,
        full_name,
        email,
        avatar_url,
        company_name
      )
    `,
      { count: 'exact' }
    )
    .order('submitted_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  // Filter by status if provided
  if (status) {
    query = query.eq('status', status);
  }

  const { data: experts, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch experts: ${error.message}`);
  }

  return {
    experts: (experts || []) as unknown as AdminExpertProfile[],
    totalCount: count || 0,
  };
}

/**
 * useAdminExperts - Query hook for admin expert list
 *
 * @param status - Optional status filter
 */
export function useAdminExperts(status?: ExpertStatus) {
  return useQuery({
    queryKey: adminExpertQueryKeys.list(status),
    queryFn: () => fetchAdminExperts(status),
  });
}

/**
 * useAdminPendingExperts - Query hook specifically for pending review experts
 */
export function useAdminPendingExperts() {
  return useAdminExperts('pending_review');
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * useApproveExpert - Mutation hook for approving an expert
 *
 * Updates expert status to 'approved' and creates a notification.
 */
export function useApproveExpert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ expertId, userId }: ApproveExpertInput) => {
      // Get current admin user
      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser();

      if (!adminUser) {
        throw new Error('Admin authentication required');
      }

      // Update expert status
      const { data: expert, error: updateError } = await supabase
        .from('expert_profiles')
        .update({
          status: 'approved',
          verified_at: new Date().toISOString(),
          verified_by: adminUser.id,
        })
        .eq('id', expertId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to approve expert: ${updateError.message}`);
      }

      // Create notification for the expert user (optional - if notifications table exists)
      // This will fail silently if the table doesn't exist
      try {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'expert_approved',
          title: 'Expert Registration Approved',
          message: 'Your expert registration has been approved. You can now receive collaboration requests.',
          data: { expert_profile_id: expertId },
          is_read: false,
        });
      } catch {
        // Notifications table might not exist, silently continue
      }

      return expert;
    },
    onSuccess: () => {
      // Invalidate expert queries to refresh the list
      queryClient.invalidateQueries({ queryKey: adminExpertQueryKeys.all });
    },
  });
}

/**
 * useRejectExpert - Mutation hook for rejecting an expert
 *
 * Updates expert status to 'rejected' with a reason and creates a notification.
 */
export function useRejectExpert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ expertId, userId, reason }: RejectExpertInput) => {
      // Get current admin user
      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser();

      if (!adminUser) {
        throw new Error('Admin authentication required');
      }

      // Update expert status
      const { data: expert, error: updateError } = await supabase
        .from('expert_profiles')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          verified_at: new Date().toISOString(),
          verified_by: adminUser.id,
        })
        .eq('id', expertId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to reject expert: ${updateError.message}`);
      }

      // Create notification for the expert user (optional)
      try {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'expert_rejected',
          title: 'Expert Registration Rejected',
          message: `Your expert registration was rejected. Reason: ${reason}`,
          data: { expert_profile_id: expertId, rejection_reason: reason },
          is_read: false,
        });
      } catch {
        // Notifications table might not exist, silently continue
      }

      return expert;
    },
    onSuccess: () => {
      // Invalidate expert queries to refresh the list
      queryClient.invalidateQueries({ queryKey: adminExpertQueryKeys.all });
    },
  });
}

/**
 * Get signed URL for viewing expert documents from storage
 *
 * @param filePath - Path to the file in storage bucket
 * @returns Signed URL for the document
 */
export async function getExpertDocumentUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('expert-documents')
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (error) {
    throw new Error(`Failed to get document URL: ${error.message}`);
  }

  return data.signedUrl;
}
