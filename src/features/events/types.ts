/**
 * Events Feature Types
 *
 * TypeScript types for user-generated events, ads, and announcements.
 */

import type { Database } from '@/types/database';

/**
 * Event type enum from database
 */
export type EventType = Database['public']['Enums']['event_type'];

/**
 * Program category enum (reused from support programs)
 */
export type EventCategory = Database['public']['Enums']['program_category'];

/**
 * User event entity from the database
 */
export interface UserEvent {
  id: number;
  author_id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  category: EventCategory | null;
  image_url: string | null;
  external_url: string | null;
  event_date: string | null;
  location: string | null;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * User event with author profile info
 */
export interface UserEventWithAuthor extends UserEvent {
  author: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    company_name: string | null;
  };
}

/**
 * Filters for event search
 */
export interface UserEventFilters {
  /** Filter by event type */
  eventType?: EventType;
  /** Filter by category */
  category?: EventCategory;
  /** Search keyword (matches title, description) */
  keyword?: string;
  /** Filter by author (for "My Events") */
  authorId?: string;
  /** Show only upcoming events */
  showUpcoming?: boolean;
}

/**
 * Pagination options for event list
 */
export interface UserEventPaginationOptions {
  /** Number of items per page */
  limit?: number;
  /** Page number (1-indexed) */
  page?: number;
  /** Sort by field */
  sortBy?: 'created_at' | 'event_date' | 'view_count';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Combined search parameters for events
 */
export interface UserEventSearchParams
  extends UserEventFilters,
    UserEventPaginationOptions {}

/**
 * Response for paginated event list
 */
export interface UserEventListResponse {
  events: UserEventWithAuthor[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

/**
 * Form data for creating/updating an event
 */
export interface UserEventFormData {
  title: string;
  description?: string;
  event_type: EventType;
  category?: EventCategory;
  image_url?: string;
  external_url?: string;
  event_date?: string;
  location?: string;
}

/**
 * Query keys for TanStack Query cache management
 */
export const eventQueryKeys = {
  all: ['user-events'] as const,
  lists: () => [...eventQueryKeys.all, 'list'] as const,
  list: (params?: UserEventSearchParams) =>
    [...eventQueryKeys.lists(), params] as const,
  details: () => [...eventQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...eventQueryKeys.details(), id] as const,
  myEvents: () => [...eventQueryKeys.all, 'my-events'] as const,
} as const;

/**
 * Event Card Props
 * Used by the EventCard component
 */
export interface EventCardProps {
  /** The event data */
  event: UserEventWithAuthor;
  /** Additional CSS classes */
  className?: string;
  /** Click handler for card */
  onClick?: () => void;
  /** Whether the card should fill its container width (for grid layouts) */
  fullWidth?: boolean;
  /** Whether to show edit/delete actions (for author) */
  showActions?: boolean;
  /** Current user ID for checking ownership */
  currentUserId?: string;
  /** Callback for edit action */
  onEdit?: () => void;
  /** Callback for delete action */
  onDelete?: () => void;
}
