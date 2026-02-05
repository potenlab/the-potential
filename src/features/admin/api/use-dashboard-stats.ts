'use client';

/**
 * Admin Dashboard Stats API Queries
 *
 * TanStack Query hooks for fetching admin dashboard statistics.
 *
 * Features:
 * - Fetch overview stats (pending approvals, new members, total posts, active users)
 * - Fetch recent activity (new signups, new posts, expert applications)
 * - Auto-refreshes every 60 seconds
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

// Types
export interface DashboardStats {
  pendingApprovals: number;
  newMembers: number;
  totalPosts: number;
  activeUsers: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'new_member' | 'new_post' | 'expert_application' | 'expert_approved' | 'expert_rejected';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    userId?: string;
    userName?: string;
    postId?: number;
    expertId?: string;
    expertName?: string;
  };
}

// Query keys
export const dashboardQueryKeys = {
  all: ['admin', 'dashboard'] as const,
  stats: () => [...dashboardQueryKeys.all, 'stats'] as const,
  recentActivity: () => [...dashboardQueryKeys.all, 'recent-activity'] as const,
} as const;

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

/**
 * Fetches dashboard overview statistics from multiple tables
 */
async function fetchDashboardStats(): Promise<DashboardStats> {
  // Run all queries in parallel for performance
  const [
    pendingApprovalsResult,
    newMembersResult,
    totalPostsResult,
    activeUsersResult,
  ] = await Promise.all([
    // 1. Pending approvals: members with approval_status = 'pending'
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('approval_status', 'pending'),

    // 2. New members this month: profiles created in the current month
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', getStartOfMonth()),

    // 3. Total posts (visible, non-hidden)
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('is_hidden', false),

    // 4. Active users: approved members
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('approval_status', 'approved'),
  ]);

  return {
    pendingApprovals: pendingApprovalsResult.count ?? 0,
    newMembers: newMembersResult.count ?? 0,
    totalPosts: totalPostsResult.count ?? 0,
    activeUsers: activeUsersResult.count ?? 0,
  };
}

/**
 * Fetches recent activity for the admin dashboard
 * Combines new member signups, new posts, and expert applications
 */
async function fetchRecentActivity(): Promise<RecentActivityItem[]> {
  const activities: RecentActivityItem[] = [];

  // Run all queries in parallel
  const [
    recentMembersResult,
    recentPostsResult,
    recentExpertsResult,
  ] = await Promise.all([
    // Recent new member signups (last 10)
    supabase
      .from('profiles')
      .select('id, full_name, email, created_at, approval_status')
      .order('created_at', { ascending: false })
      .limit(5),

    // Recent posts (last 5)
    supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        author:profiles!posts_author_id_fkey(id, full_name, email)
      `)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .limit(5),

    // Recent expert applications (last 5)
    supabase
      .from('expert_profiles')
      .select(`
        id,
        business_name,
        status,
        submitted_at,
        created_at,
        profile:profiles!user_id(id, full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  // Process new members
  if (recentMembersResult.data) {
    for (const member of recentMembersResult.data) {
      activities.push({
        id: `member-${member.id}`,
        type: 'new_member',
        title: 'New member signed up',
        description: member.full_name || member.email,
        timestamp: member.created_at,
        metadata: {
          userId: member.id,
          userName: member.full_name || member.email,
        },
      });
    }
  }

  // Process new posts
  if (recentPostsResult.data) {
    for (const post of recentPostsResult.data) {
      const author = post.author as unknown as { id: string; full_name: string | null; email: string } | null;
      activities.push({
        id: `post-${post.id}`,
        type: 'new_post',
        title: 'New post created',
        description: `${author?.full_name || author?.email || 'Unknown'}: "${post.content.substring(0, 80)}${post.content.length > 80 ? '...' : ''}"`,
        timestamp: post.created_at,
        metadata: {
          postId: post.id,
          userName: author?.full_name || author?.email || undefined,
        },
      });
    }
  }

  // Process expert applications
  if (recentExpertsResult.data) {
    for (const expert of recentExpertsResult.data) {
      const profile = expert.profile as unknown as { id: string; full_name: string | null; email: string } | null;
      const typeMap: Record<string, RecentActivityItem['type']> = {
        pending_review: 'expert_application',
        approved: 'expert_approved',
        rejected: 'expert_rejected',
      };
      activities.push({
        id: `expert-${expert.id}`,
        type: typeMap[expert.status] || 'expert_application',
        title: expert.status === 'approved'
          ? 'Expert approved'
          : expert.status === 'rejected'
            ? 'Expert rejected'
            : 'New expert application',
        description: `${profile?.full_name || profile?.email || 'Unknown'} - ${expert.business_name}`,
        timestamp: expert.submitted_at || expert.created_at,
        metadata: {
          expertId: expert.id,
          expertName: profile?.full_name || profile?.email || undefined,
          userName: profile?.full_name || profile?.email || undefined,
        },
      });
    }
  }

  // Sort by timestamp descending and take the most recent 10
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return activities.slice(0, 10);
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * useDashboardStats - Query hook for admin dashboard stats
 *
 * Refreshes every 60 seconds to keep data current.
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardQueryKeys.stats(),
    queryFn: fetchDashboardStats,
    refetchInterval: 60_000, // Refresh every 60 seconds
    staleTime: 30_000, // Consider data stale after 30 seconds
  });
}

/**
 * useRecentActivity - Query hook for admin dashboard recent activity
 *
 * Refreshes every 60 seconds to keep data current.
 */
export function useRecentActivity() {
  return useQuery({
    queryKey: dashboardQueryKeys.recentActivity(),
    queryFn: fetchRecentActivity,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Returns the ISO timestamp for the start of the current month
 */
function getStartOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}
