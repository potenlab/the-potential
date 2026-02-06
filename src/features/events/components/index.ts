/**
 * Events Components
 *
 * Export all event components for easier imports.
 */

export { EventCard, default as EventCardDefault } from './event-card';
export { EventList, default as EventListDefault } from './event-list';
export { CreateEventModal, default as CreateEventModalDefault } from './create-event-modal';
export { EventDetailModal, default as EventDetailModalDefault } from './event-detail-modal';

// Re-export types for convenience
export type { EventListProps } from './event-list';
export type { CreateEventModalProps } from './create-event-modal';
export type { EventDetailModalProps } from './event-detail-modal';
