'use client';

/**
 * useRealtimePosts Hook
 *
 * Supabase Realtime subscription for posts.
 * New posts appear in the feed without requiring a refresh.
 *
 * Features:
 * - Subscribes to INSERT events on the posts table
 * - Automatically updates React Query cache when new posts arrive
 * - Handles reconnection on disconnect
 * - Cleans up subscription on unmount
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type PostRow = Database['public']['Tables']['posts']['Row'];

interface UseRealtimePostsOptions {
  /** Whether the subscription should be active */
  enabled?: boolean;
  /** Callback when a new post is received */
  onNewPost?: (post: PostRow) => void;
}

export function useRealtimePosts(options: UseRealtimePostsOptions = {}) {
  const { enabled = true, onNewPost } = options;
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNewPost = useCallback(
    (payload: RealtimePostgresChangesPayload<PostRow>) => {
      if (payload.eventType === 'INSERT') {
        const newPost = payload.new;

        // Call the optional callback
        onNewPost?.(newPost);

        // Invalidate the posts query to trigger a refetch
        // This ensures the feed is updated with the new post including author info
        queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
      }
    },
    [queryClient, onNewPost]
  );

  const setupSubscription = useCallback(() => {
    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create new channel for posts
    const channel = supabase
      .channel('realtime-posts')
      .on<PostRow>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        },
        handleNewPost
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Posts subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Posts subscription error, attempting reconnect...');
          // Attempt reconnection after a delay
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            setupSubscription();
          }, 5000);
        } else if (status === 'CLOSED') {
          console.log('[Realtime] Posts subscription closed');
        }
      });

    channelRef.current = channel;
  }, [handleNewPost]);

  useEffect(() => {
    if (!enabled) {
      // Clean up if disabled
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    setupSubscription();

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
  }, [enabled, setupSubscription]);

  return {
    isSubscribed: !!channelRef.current,
  };
}

export default useRealtimePosts;
