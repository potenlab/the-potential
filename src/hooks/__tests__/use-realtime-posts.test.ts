/**
 * useRealtimePosts Hook Tests
 *
 * Tests the Supabase Realtime subscription hook for posts.
 * Tests cover:
 * - Subscription setup and cleanup
 * - Handling new posts
 * - Query invalidation
 * - Error handling and reconnection
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRealtimePosts } from '../use-realtime-posts';
import { supabase } from '@/lib/supabase/client';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Type for mocked functions
type MockChannel = {
  on: ReturnType<typeof vi.fn>;
  subscribe: ReturnType<typeof vi.fn>;
};

describe('useRealtimePosts Hook', () => {
  let mockChannel: MockChannel;
  let subscribeCallback: ((status: string) => void) | null = null;
  let postgresCallback: ((payload: any) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock channel
    mockChannel = {
      on: vi.fn().mockImplementation((event, config, callback) => {
        postgresCallback = callback;
        return mockChannel;
      }),
      subscribe: vi.fn().mockImplementation((callback) => {
        subscribeCallback = callback;
        // Simulate successful subscription
        setTimeout(() => callback?.('SUBSCRIBED'), 0);
        return mockChannel;
      }),
    };

    // Mock supabase.channel
    vi.mocked(supabase.channel).mockReturnValue(mockChannel as any);
    vi.mocked(supabase.removeChannel).mockReturnValue(Promise.resolve('ok'));
  });

  afterEach(() => {
    subscribeCallback = null;
    postgresCallback = null;
  });

  // Wrapper component with QueryClientProvider
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  describe('subscription setup', () => {
    it('creates a realtime channel on mount', () => {
      renderHook(() => useRealtimePosts(), {
        wrapper: createWrapper(),
      });

      expect(supabase.channel).toHaveBeenCalledWith('realtime-posts');
    });

    it('subscribes to postgres changes on posts table', async () => {
      renderHook(() => useRealtimePosts(), {
        wrapper: createWrapper(),
      });

      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        }),
        expect.any(Function)
      );
    });

    it('does not create subscription when disabled', () => {
      renderHook(() => useRealtimePosts({ enabled: false }), {
        wrapper: createWrapper(),
      });

      expect(supabase.channel).not.toHaveBeenCalled();
    });

    it('returns isSubscribed state', async () => {
      const { result } = renderHook(() => useRealtimePosts(), {
        wrapper: createWrapper(),
      });

      // Initially may be false, then true after subscription
      expect(typeof result.current.isSubscribed).toBe('boolean');
    });
  });

  describe('subscription cleanup', () => {
    it('removes channel on unmount', async () => {
      const { unmount } = renderHook(() => useRealtimePosts(), {
        wrapper: createWrapper(),
      });

      unmount();

      expect(supabase.removeChannel).toHaveBeenCalled();
    });

    it('removes channel when disabled', async () => {
      const { rerender } = renderHook(
        ({ enabled }) => useRealtimePosts({ enabled }),
        {
          wrapper: createWrapper(),
          initialProps: { enabled: true },
        }
      );

      // Wait for initial subscription
      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalled();
      });

      // Disable the hook
      rerender({ enabled: false });

      expect(supabase.removeChannel).toHaveBeenCalled();
    });
  });

  describe('handling new posts', () => {
    it('calls onNewPost callback when new post arrives', async () => {
      const onNewPost = vi.fn();

      renderHook(() => useRealtimePosts({ onNewPost }), {
        wrapper: createWrapper(),
      });

      // Wait for subscription
      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      // Simulate new post
      if (postgresCallback) {
        act(() => {
          postgresCallback({
            eventType: 'INSERT',
            new: { id: 1, content: 'New post', author_id: 'user-1' },
          });
        });
      }

      expect(onNewPost).toHaveBeenCalledWith({
        id: 1,
        content: 'New post',
        author_id: 'user-1',
      });
    });

    it('does not call onNewPost for non-INSERT events', async () => {
      const onNewPost = vi.fn();

      renderHook(() => useRealtimePosts({ onNewPost }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      // Simulate UPDATE event
      if (postgresCallback) {
        act(() => {
          postgresCallback({
            eventType: 'UPDATE',
            new: { id: 1, content: 'Updated post' },
          });
        });
      }

      expect(onNewPost).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('logs error on CHANNEL_ERROR', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderHook(() => useRealtimePosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      // Simulate channel error
      if (subscribeCallback) {
        act(() => {
          subscribeCallback('CHANNEL_ERROR');
        });
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Realtime] Posts subscription error')
      );

      consoleSpy.mockRestore();
    });

    it('logs message on CLOSED status', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      renderHook(() => useRealtimePosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      // Simulate channel closed
      if (subscribeCallback) {
        act(() => {
          subscribeCallback('CLOSED');
        });
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Realtime] Posts subscription closed')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('cleanup', () => {
    it('removes channel on unmount', async () => {
      const { unmount } = renderHook(() => useRealtimePosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      unmount();

      expect(supabase.removeChannel).toHaveBeenCalled();
    });
  });
});
