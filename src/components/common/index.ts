/**
 * Common Components Index - The Potential Design System
 *
 * Export all common/shared components from a single entry point.
 * These components are used across features and provide core functionality.
 */

// Error Handling
export {
  ErrorBoundary,
  RouteErrorBoundary,
  withErrorBoundary,
} from './error-boundary';

// Accessibility
export { SkipLink, SkipLinksContainer } from './skip-link';
export { FocusTrap, useFocusTrap } from './focus-trap';
export { VisuallyHidden, srOnlyStyles } from './visually-hidden';
export { AnnouncerProvider, useAnnouncer, Announcer } from './announcer';

// Internationalization
export { LanguageSwitcher } from './language-switcher';
