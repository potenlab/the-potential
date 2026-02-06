/**
 * Events API Exports
 *
 * Central export point for all events API hooks and utilities.
 */

// Query hooks
export {
  // Events queries
  useUserEvents,
  useUserEvent,
  // Events mutations
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useIncrementViewCount,
  // Convenience hooks
  useEventMutations,
} from './queries';

// Re-export types and query keys for external use
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
} from '../types';

export { eventQueryKeys } from '../types';
