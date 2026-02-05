'use client';

/**
 * Notification API Queries
 *
 * TanStack Query hooks for fetching and managing notifications.
 * Works alongside useRealtimeNotifications for live updates.
 *
 * Features:
 * - Fetch paginated notifications for current user
 * - Mark individual notifications as read
 * - Mark all notifications as read
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];

// Query keys for notifications
export const notificationQueryKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationQueryKeys.all, 'list'] as const,
  unreadCount: () => [...notificationQueryKeys.all, 'unread-count'] as const,
};

// Constants
const NOTIFICATIONS_PAGE_SIZE = 20;

/**
 * Fetches notifications for the current user, ordered by newest first.
 */
async function fetchNotifications(): Promise<NotificationRow[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(NOTIFICATIONS_PAGE_SIZE);

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  return (data || []) as NotificationRow[];
}

/**
 * useNotifications - Query hook for fetching the current user's notifications.
 */
export function useNotifications() {
  return useQuery({
    queryKey: notificationQueryKeys.list(),
    queryFn: fetchNotifications,
  });
}

/**
 * useMarkNotificationAsRead - Mutation to mark a single notification as read.
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('is_read', false);

      if (error) {
        throw new Error(`Failed to mark notification as read: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  });
}

/**
 * useMarkAllNotificationsAsRead - Mutation to mark all notifications as read.
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        throw new Error(`Failed to mark all notifications as read: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  });
}
