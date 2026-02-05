'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Bell, Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';
import { useNotifications, useMarkAllNotificationsAsRead } from '../api/queries';
import { NotificationItem } from './notification-item';
import { EmptyNotificationsState } from '@/components/common/empty-state';

/**
 * Skeleton placeholder for a single notification item.
 * Mirrors the layout of NotificationItem: icon circle + text lines + unread dot.
 */
function NotificationItemSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      {/* Icon circle */}
      <Skeleton
        className="flex-shrink-0 mt-0.5 h-8 w-8"
        rounded="full"
        variant="lighter"
      />

      {/* Content lines */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Title */}
        <Skeleton className="h-3.5 w-3/4" rounded="md" variant="lighter" />
        {/* Body */}
        <Skeleton className="h-3 w-full" rounded="md" variant="lighter" />
        {/* Time */}
        <Skeleton className="h-3 w-16" rounded="md" variant="lighter" />
      </div>

      {/* Unread dot placeholder */}
      <div className="flex-shrink-0 mt-2">
        <Skeleton className="h-2 w-2" rounded="full" variant="lighter" />
      </div>
    </div>
  );
}

/**
 * NotificationPopover
 *
 * A popover that displays the user's notifications when the bell icon is clicked.
 *
 * Features:
 * - Shows unread badge count on bell icon (from realtime subscription)
 * - Fetches full notification list on open via TanStack Query
 * - Scrollable list with max height
 * - Mark all as read button
 * - Empty state when no notifications
 * - Marks all as read when popover is opened
 */
export function NotificationPopover() {
  const t = useTranslations('notifications');
  const navT = useTranslations('navigation');
  const [open, setOpen] = React.useState(false);

  // Realtime unread count (lightweight, always subscribed)
  const { unreadCount, markAllAsRead: realtimeMarkAllAsRead } =
    useRealtimeNotifications();

  // Full notification list (only fetched when needed)
  const {
    data: notifications,
    isLoading,
    refetch,
  } = useNotifications();

  // Mark all as read mutation
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  // When the popover opens, refetch notifications
  const handleOpenChange = React.useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (isOpen) {
        refetch();
      }
    },
    [refetch]
  );

  // Handle mark all as read
  const handleMarkAllAsRead = React.useCallback(async () => {
    await markAllAsReadMutation.mutateAsync();
    await realtimeMarkAllAsRead();
  }, [markAllAsReadMutation, realtimeMarkAllAsRead]);

  // Handle clicking a notification item
  const handleNotificationClick = React.useCallback(
    (notification: { reference_type?: string | null; reference_id?: string | null; metadata?: unknown }) => {
      // If the notification has a link in metadata, navigate to it
      const metadata = notification.metadata as Record<string, unknown> | null;
      if (metadata && typeof metadata === 'object' && 'link' in metadata && typeof metadata.link === 'string') {
        window.location.href = metadata.link;
        setOpen(false);
      }
    },
    []
  );

  const hasNotifications = notifications && notifications.length > 0;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-[#8B95A1] hover:text-white relative"
          aria-label={navT('notifications')}
        >
          <Bell className="h-6 w-6" />
          {/* Notification badge - shows unread count from realtime subscription */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-[#FF453A] rounded-full text-[11px] font-bold flex items-center justify-center text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className={cn(
          'w-[380px] p-0 rounded-2xl overflow-hidden',
          '!bg-[#1C1C1E] border border-white/10',
          'shadow-2xl shadow-black/80 z-[100]'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
          <h3 className="text-sm font-semibold text-white">{t('title')}</h3>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className={cn(
                'flex items-center gap-1 text-xs text-[#0079FF] hover:text-[#0079FF]/80',
                'transition-colors focus:outline-none disabled:opacity-50'
              )}
            >
              <Check className="h-3 w-3" />
              {t('markAllRead')}
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
          {isLoading ? (
            <div className="divide-y divide-white/[0.05]">
              {Array.from({ length: 4 }).map((_, i) => (
                <NotificationItemSkeleton key={i} />
              ))}
            </div>
          ) : hasNotifications ? (
            <div className="divide-y divide-white/[0.05]">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          ) : (
            <EmptyNotificationsState className="py-8" />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationPopover;
