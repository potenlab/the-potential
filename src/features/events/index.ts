/**
 * Events Feature
 *
 * User-generated events, ads, and announcements feature.
 *
 * This feature allows authenticated users to create, view, edit,
 * and delete their own events.
 */

// Components
export {
  EventCard,
  EventList,
  CreateEventModal,
  EventDetailModal,
} from './components';

// API hooks
export {
  useUserEvents,
  useUserEvent,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useIncrementViewCount,
  useEventMutations,
} from './api';

// Types
export type {
  UserEvent,
  UserEventWithAuthor,
  EventType,
  EventCategory,
  UserEventFilters,
  UserEventSearchParams,
  UserEventPaginationOptions,
  UserEventListResponse,
  UserEventFormData,
  EventCardProps,
} from './types';

export { eventQueryKeys } from './types';
