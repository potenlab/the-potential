'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ApprovalStatus = Database['public']['Enums']['approval_status'];

export interface PendingMember {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  approval_status: ApprovalStatus;
  created_at: string;
}

interface MemberFilters {
  status?: ApprovalStatus | 'all';
  search?: string;
}

/**
 * Hook to fetch members with filtering by status
 */
export function useMembers(filters: MemberFilters = {}) {
  const { status = 'all', search } = filters;

  return useQuery({
    queryKey: ['admin', 'members', { status, search }],
    queryFn: async (): Promise<PendingMember[]> => {
      let query = supabase
        .from('profiles')
        .select('id, email, full_name, company_name, avatar_url, approval_status, created_at')
        .order('created_at', { ascending: false });

      // Filter by status if not 'all'
      if (status && status !== 'all') {
        query = query.eq('approval_status', status);
      }

      // Search filter
      if (search && search.trim()) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as PendingMember[];
    },
  });
}

/**
 * Hook to approve a member
 */
export function useApproveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: 'approved' })
        .eq('id', memberId);

      if (error) {
        throw new Error(error.message);
      }

      // TODO: Send notification to user (will be implemented in task 6.5)
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate and refetch members queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
    },
  });
}

/**
 * Hook to reject a member
 */
export function useRejectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, reason }: { memberId: string; reason: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          approval_status: 'rejected',
          rejection_reason: reason,
        } as Partial<Profile>)
        .eq('id', memberId);

      if (error) {
        throw new Error(error.message);
      }

      // TODO: Send notification to user (will be implemented in task 6.5)
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate and refetch members queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
    },
  });
}

/**
 * Hook to suspend a member
 */
export function useSuspendMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: 'suspended' })
        .eq('id', memberId);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
    },
  });
}

/**
 * Hook to unsuspend a member (restore to approved)
 */
export function useUnsuspendMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: 'approved' })
        .eq('id', memberId);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
    },
  });
}

/**
 * Hook to permanently delete a member (auth user + profile)
 * Calls a server API route that uses the service role key.
 */
export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch('/api/admin/delete-member', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to delete member');
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
    },
  });
}
