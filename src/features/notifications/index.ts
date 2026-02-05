/**
 * Notifications Feature
 *
 * Provides notification popover, query hooks, and UI components
 * for displaying and managing user notifications.
 */

// Components
export { NotificationPopover } from './components/notification-popover';
export { NotificationItem } from './components/notification-item';

// API / Queries
export {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  notificationQueryKeys,
} from './api/queries';
export type { NotificationRow } from './api/queries';
