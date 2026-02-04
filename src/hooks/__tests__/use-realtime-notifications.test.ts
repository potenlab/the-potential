/**
 * useRealtimeNotifications Hook Tests
 *
 * Tests the Supabase Realtime subscription hook for notifications.
 * Tests cover:
 * - Subscription setup and cleanup
 * - Unread count management
 * - Handling new notifications
 * - Mark all as read functionality
 * - Auth state changes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRealtimeNotifications } from '../use-realtime-notifications';
import { supabase } from '@/lib/supabase/client';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('useRealtimeNotifications Hook', () => {
  let mockChannel: any;
  let subscribeCallback: ((status: string) => void) | null = null;
  let postgresCallback: ((payload: any) => void) | null = null;
  let authStateCallback: ((event: string, session: any) => void) | null = null;

  const mockUser = { id: 'user-123', email: 'test@example.com' };

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
        setTimeout(() => callback?.('SUBSCRIBED'), 0);
        return mockChannel;
      }),
    };

    // Mock supabase.channel
    vi.mocked(supabase.channel).mockReturnValue(mockChannel);
    vi.mocked(supabase.removeChannel).mockReturnValue(Promise.resolve('ok'));

    // Mock supabase.auth.getUser
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser as any },
      error: null,
    });

    // Mock supabase.auth.onAuthStateChange
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authStateCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      } as any;
    });

    // Mock supabase.from for notifications
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
    } as any);
  });

  afterEach(() => {
    subscribeCallback = null;
    postgresCallback = null;
    authStateCallback = null;
  });

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  describe('initial state', () => {
    it('returns initial unread count of 0', async () => {
      // Mock empty notifications
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      } as any);

      const { result } = renderHook(() => useRealtimeNotifications(), {
        wrapper: createWrapper(),
      });

      expect(result.current.unreadCount).toBe(0);
    });

    it('returns isSubscribed state', async () => {
      const { result } = renderHook(() => useRealtimeNotifications(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.isSubscribed).toBe('boolean');
    });

    it('returns refetchCount function', async () => {
      const { result } = renderHook(() => useRealtimeNotifications(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.refetchCount).toBe('function');
    });

    it('returns markAllAsRead function', async () => {
      const { result } = renderHook(() => useRealtimeNotifications(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.markAllAsRead).toBe('function');
    });
  });

  describe('subscription setup', () => {
    it('creates a realtime channel with user filter', async () => {
      renderHook(() => useRealtimeNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalledWith('realtime-notifications');
      });
    });

    it('does not create subscription when disabled', () => {
      renderHook(() => useRealtimeNotifications({ enabled: false }), {
        wrapper: createWrapper(),
      });

      expect(supabase.channel).not.toHaveBeenCalled();
    });

    it('does not subscribe without authenticated user', async () => {
      // Mock no user
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      renderHook(() => useRealtimeNotifications(), {
        wrapper: createWrapper(),
      });

      // Wait a bit for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Channel should not be created without user
      expect(mockChannel.subscribe).not.toHaveBeenCalled();
    });
  });

  describe('unread count management', () => {
    it('fetches initial unread count on mount', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ count: 5, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      } as any);

      renderHook(() => useRealtimeNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('notifications');
      });
    });

    it('increments count on new notification', async () => {
      const { result } = renderHook(() => useRealtimeNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      // Simulate new notification
      if (postgresCallback) {
        act(() => {
          postgresCallback({
            eventType: 'INSERT',
            new: { id: 1, user_id: 'user-123', is_read: false },
          });
        });
      }

      expect(result.current.unreadCount).toBe(1);
    });

    it('decrements count when notification is marked as read', async () => {
      const { result } = renderHook(() => useRealtimeNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      // First, add a notification
      if (postgresCallback) {
        act(() => {
          postgresCallback({
            eventType: 'INSERT',
            new: { id: 1, user_id: 'user-123', is_read: false },
          });
        });
      }

      expect(result.current.unreadCount).toBe(1);

      // Mark as read
      if (postgresCallback) {
        act(() => {
          postgresCallback({
            eventType: 'UPDATE',
            old: { id: 1, is_read: false },
            new: { id: 1, is_read: true },
          });
        });
      }

      expect(result.current.unreadCount).toBe(0);
    });

    it('does not go below 0', async () => {
      const { result } = renderHook(() => useRealtimeNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      // Try to decrement from 0
      if (postgresCallback) {
        act(() => {
          postgresCallback({
            eventType: 'UPDATE',
            old: { id: 1, is_read: false },
            new: { id: 1, is_read: true },
          });
        });
      }

      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('callback handling', () => {
    it('calls onNewNotification callback when new notification arrives', async () => {
      const onNewNotification = vi.fn();

      renderHook(() => useRealtimeNotifications({ onNewNotification }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      const notification = { id: 1, user_id: 'user-123', is_read: false, type: 'like' };

      if (postgresCallback) {
        act(() => {
          postgresCallback({
            eventType: 'INSERT',
            new: notification,
          });
        });
      }

      expect(onNewNotification).toHaveBeenCalledWith(notification);
    });
  });

  describe('markAllAsRead', () => {
    it('updates all unread notifications', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        update: mockUpdate,
        eq: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      } as any);

      const { result } = renderHook(() => useRealtimeNotifications(), {
        wrapper: createWrapper(),
      });

      // Add some unread notifications
      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      if (postgresCallback) {
        act(() => {
          postgresCallback({
            eventType: 'INSERT',
            new: { id: 1, is_read: false },
          });
        });
      }

      // Mark all as read
      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('auth state changes', () => {
    it('sets up subscription on sign in', async () => {
      // Start without user
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      renderHook(() => useRealtimeNotifications(), {
        wrapper: createWrapper(),
      });

      // Simulate sign in
      if (authStateCallback) {
        act(() => {
          authStateCallback('SIGNED_IN', { user: mockUser });
        });
      }

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalled();
      });
    });

    it('clears state on sign out', async () => {
      const { result } = renderHook(() => useRealtimeNotifications(), {
        wrapper: createWrapper(),
      });

      // Add notification
      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      if (postgresCallback) {
        act(() => {
          postgresCallback({
            eventType: 'INSERT',
            new: { id: 1, is_read: false },
          });
        });
      }

      expect(result.current.unreadCount).toBe(1);

      // Simulate sign out
      if (authStateCallback) {
        act(() => {
          authStateCallback('SIGNED_OUT', null);
        });
      }

      expect(result.current.unreadCount).toBe(0);
      expect(supabase.removeChannel).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('removes channel on unmount', async () => {
      const { unmount } = renderHook(() => useRealtimeNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      unmount();

      expect(supabase.removeChannel).toHaveBeenCalled();
    });

    it('unsubscribes from auth state changes on unmount', async () => {
      const unsubscribe = vi.fn();

      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(() => ({
        data: {
          subscription: {
            unsubscribe,
          },
        },
      } as any));

      const { unmount } = renderHook(() => useRealtimeNotifications(), {
        wrapper: createWrapper(),
      });

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});
