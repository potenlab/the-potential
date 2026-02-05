'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  MessageCircle,
  Heart,
  Users,
  CheckCircle,
  XCircle,
  Bell,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Database } from '@/types/database';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];
type NotificationType = Database['public']['Enums']['notification_type'];

/**
 * Maps notification types to their corresponding icons and accent colors.
 */
const notificationConfig: Record<
  NotificationType,
  { icon: LucideIcon; color: string }
> = {
  member_approved: { icon: CheckCircle, color: 'text-emerald-400' },
  member_rejected: { icon: XCircle, color: 'text-[#FF453A]' },
  expert_approved: { icon: CheckCircle, color: 'text-emerald-400' },
  expert_rejected: { icon: XCircle, color: 'text-[#FF453A]' },
  new_comment: { icon: MessageCircle, color: 'text-[#0079FF]' },
  new_like: { icon: Heart, color: 'text-pink-400' },
  new_collaboration_request: { icon: Users, color: 'text-[#0079FF]' },
  collaboration_accepted: { icon: CheckCircle, color: 'text-emerald-400' },
  collaboration_declined: { icon: XCircle, color: 'text-orange-400' },
  system_announcement: { icon: Megaphone, color: 'text-[#0079FF]' },
};

/**
 * Formats a date string into a human-readable relative time.
 */
function useRelativeTime(dateString: string): string {
  const t = useTranslations('time');

  return React.useMemo(() => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) return t('justNow');
    if (diffMinutes < 60) return t('minutesAgo', { minutes: diffMinutes });
    if (diffHours < 24) return t('hoursAgo', { hours: diffHours });
    if (diffDays < 7) return t('daysAgo', { days: diffDays });
    if (diffWeeks < 5) return t('weeksAgo', { weeks: diffWeeks });
    if (diffMonths < 12) return t('monthsAgo', { months: diffMonths });
    return t('yearsAgo', { years: diffYears });
  }, [dateString, t]);
}

interface NotificationItemProps {
  notification: NotificationRow;
  onClick?: (notification: NotificationRow) => void;
}

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const relativeTime = useRelativeTime(notification.created_at);

  const config = notificationConfig[notification.type] || {
    icon: Bell,
    color: 'text-[#8B95A1]',
  };

  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={() => onClick?.(notification)}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
        'hover:bg-white/5 focus:bg-white/5 focus:outline-none',
        !notification.is_read && 'bg-[#0079FF]/5'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 mt-0.5 p-2 rounded-full',
          'bg-white/5',
          config.color
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm leading-snug',
            notification.is_read ? 'text-[#8B95A1]' : 'text-white font-medium'
          )}
        >
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-xs text-[#8B95A1] mt-0.5 line-clamp-2">
            {notification.body}
          </p>
        )}
        <p className="text-xs text-[#8B95A1]/60 mt-1">{relativeTime}</p>
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <div className="flex-shrink-0 mt-2">
          <div className="h-2 w-2 rounded-full bg-[#0079FF]" />
        </div>
      )}
    </button>
  );
}

export default NotificationItem;
