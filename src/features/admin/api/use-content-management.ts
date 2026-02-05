'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type SupportProgram = Database['public']['Tables']['support_programs']['Row'];
type SupportProgramInsert = Database['public']['Tables']['support_programs']['Insert'];
type SupportProgramUpdate = Database['public']['Tables']['support_programs']['Update'];
type Post = Database['public']['Tables']['posts']['Row'];
type ProgramStatus = Database['public']['Enums']['program_status'];
type ProgramCategory = Database['public']['Enums']['program_category'];

export interface ProgramWithAuthor extends SupportProgram {
  created_by_profile?: {
    full_name: string | null;
    email: string;
  } | null;
}

export interface PostWithAuthor extends Post {
  author?: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    company_name: string | null;
  } | null;
}

interface ProgramFilters {
  status?: ProgramStatus | 'all';
  category?: ProgramCategory | 'all';
  search?: string;
}

interface PostFilters {
  search?: string;
  showHidden?: boolean;
  pinnedOnly?: boolean;
}

/**
 * Hook to fetch support programs for admin management
 */
export function useAdminPrograms(filters: ProgramFilters = {}) {
  const { status = 'all', category = 'all', search } = filters;

  return useQuery({
    queryKey: ['admin', 'programs', { status, category, search }],
    queryFn: async (): Promise<ProgramWithAuthor[]> => {
      let query = supabase
        .from('support_programs')
        .select(`
          *,
          created_by_profile:profiles!support_programs_created_by_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (search && search.trim()) {
        query = query.or(`title.ilike.%${search}%,organization.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as ProgramWithAuthor[];
    },
  });
}

/**
 * Hook to create a new support program
 */
export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (program: Omit<SupportProgramInsert, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to create a program');
      }

      const { data, error } = await supabase
        .from('support_programs')
        .insert({ ...program, created_by: user.id })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
    },
  });
}

/**
 * Hook to update an existing support program
 */
export function useUpdateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: SupportProgramUpdate }) => {
      const { data, error } = await supabase
        .from('support_programs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
    },
  });
}

/**
 * Hook to delete a support program
 */
export function useDeleteProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (programId: number) => {
      const { error } = await supabase
        .from('support_programs')
        .delete()
        .eq('id', programId);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
    },
  });
}

/**
 * Hook to fetch posts for admin management
 */
export function useAdminPosts(filters: PostFilters = {}) {
  const { search, showHidden = true, pinnedOnly = false } = filters;

  return useQuery({
    queryKey: ['admin', 'posts', { search, showHidden, pinnedOnly }],
    queryFn: async (): Promise<PostWithAuthor[]> => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(full_name, email, avatar_url, company_name)
        `)
        .order('created_at', { ascending: false });

      if (!showHidden) {
        query = query.eq('is_hidden', false);
      }

      if (pinnedOnly) {
        query = query.eq('is_pinned', true);
      }

      if (search && search.trim()) {
        query = query.ilike('content', `%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as PostWithAuthor[];
    },
  });
}

/**
 * Hook to pin/unpin a post
 */
export function useTogglePinPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isPinned }: { postId: number; isPinned: boolean }) => {
      const { error } = await supabase
        .from('posts')
        .update({ is_pinned: isPinned })
        .eq('id', postId);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
    },
  });
}

/**
 * Hook to hide/show a post
 */
export function useToggleHidePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      isHidden,
      hiddenBy,
      hiddenReason
    }: {
      postId: number;
      isHidden: boolean;
      hiddenBy?: string;
      hiddenReason?: string;
    }) => {
      const { error } = await supabase
        .from('posts')
        .update({
          is_hidden: isHidden,
          hidden_by: isHidden ? hiddenBy : null,
          hidden_reason: isHidden ? hiddenReason : null,
        })
        .eq('id', postId);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
    },
  });
}

/**
 * Hook to delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
    },
  });
}
