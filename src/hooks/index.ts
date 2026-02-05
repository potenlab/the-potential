/**
 * Shared custom React hooks for The Potential platform
 * This file serves as the central export point for all custom hooks
 */

// Auth hook
export { useAuth } from './use-auth';

// Realtime hooks for Supabase subscriptions
export { useRealtimePosts } from './use-realtime-posts';
export { useRealtimeNotifications } from './use-realtime-notifications';

// Re-export all hooks from subdirectories as they are created
// Example: export * from './use-media-query';
// Example: export * from './use-debounce';
