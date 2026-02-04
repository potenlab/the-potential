'use client';

/**
 * useRealtimeNotifications Hook
 *
 * Supabase Realtime subscription for notifications.
 * Notification count updates live without requiring a refresh.
 *
 * Features:
 * - Subscribes to INSERT events on the notifications table
 * - Filters notifications to current user only
 * - Maintains unread count state
 * - Handles reconnection on disconnect
 * - Cleans up subscription on unmount
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload, User } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];

interface UseRealtimeNotificationsOptions {
  /** Whether the subscription should be active */
  enabled?: boolean;
  /** Callback when a new notification is received */
  onNewNotification?: (notification: NotificationRow) => void;
}

interface UseRealtimeNotificationsReturn {
  /** Current unread notification count */
  unreadCount: number;
  /** Whether the subscription is active */
  isSubscribed: boolean;
  /** Refetch the unread count */
  refetchCount: () => Promise<void>;
  /** Mark all notifications as read */
  markAllAsRead: () => Promise<void>;
}

export function useRealtimeNotifications(
  options: UseRealtimeNotificationsOptions = {}
): UseRealtimeNotificationsReturn {
  const { enabled = true, onNewNotification } = options;
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  // Fetch initial unread count
  const fetchUnreadCount = useCallback(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    setUser(currentUser);

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', currentUser.id)
      .eq('is_read', false);

    if (error) {
      console.error('[Realtime] Failed to fetch notification count:', error.message);
      return;
    }

    setUnreadCount(count ?? 0);
  }, []);

  // Handle new notification
  const handleNewNotification = useCallback(
    (payload: RealtimePostgresChangesPayload<NotificationRow>) => {
      if (payload.eventType === 'INSERT') {
        const notification = payload.new;

        // Increment unread count
        setUnreadCount((prev) => prev + 1);

        // Call the optional callback
        onNewNotification?.(notification);

        // Invalidate notifications query if it exists
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      } else if (payload.eventType === 'UPDATE') {
        // If a notification was marked as read, decrement count
        const notification = payload.new;
        const oldNotification = payload.old as NotificationRow;

        if (!oldNotification.is_read && notification.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    },
    [queryClient, onNewNotification]
  );

  // Setup realtime subscription
  const setupSubscription = useCallback(
    (userId: string) => {
      // Clean up existing channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      // Create new channel for notifications filtered by user_id
      const channel = supabase
        .channel('realtime-notifications')
        .on<NotificationRow>(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE)
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          handleNewNotification
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[Realtime] Notifications subscription active');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('[Realtime] Notifications subscription error, attempting reconnect...');
            // Attempt reconnection after a delay
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
            reconnectTimeoutRef.current = setTimeout(() => {
              if (userId) {
                setupSubscription(userId);
              }
            }, 5000);
          } else if (status === 'CLOSED') {
            console.log('[Realtime] Notifications subscription closed');
          }
        });

      channelRef.current = channel;
    },
    [handleNewNotification]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('[Realtime] Failed to mark notifications as read:', error.message);
      return;
    }

    setUnreadCount(0);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [user, queryClient]);

  // Initialize on mount
  useEffect(() => {
    if (!enabled) {
      // Clean up if disabled
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Fetch initial count and get user
    const init = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        return;
      }

      setUser(currentUser);
      await fetchUnreadCount();
      setupSubscription(currentUser.id);
    };

    init();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, fetchUnreadCount, setupSubscription]);

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await fetchUnreadCount();
        setupSubscription(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUnreadCount(0);
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUnreadCount, setupSubscription]);

  return {
    unreadCount,
    isSubscribed: !!channelRef.current,
    refetchCount: fetchUnreadCount,
    markAllAsRead,
  };
}

export default useRealtimeNotifications;
