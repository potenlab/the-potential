'use client';

import * as React from 'react';

/**
 * Announcer Component - The Potential Design System
 *
 * A live region component for screen reader announcements.
 * Provides a way to communicate dynamic changes to assistive technology users.
 *
 * WCAG 2.1 AA Requirements:
 * - 4.1.3 Status Messages: Status messages can be programmatically determined
 *   through role or properties such that they can be presented to the user
 *   by assistive technologies without receiving focus.
 *
 * Features:
 * - Supports polite and assertive announcements
 * - Visually hidden but accessible to screen readers
 * - Automatically clears after announcement
 * - Context-based API for easy use throughout the app
 *
 * @example
 * ```tsx
 * // Wrap your app with the provider:
 * <AnnouncerProvider>
 *   <App />
 * </AnnouncerProvider>
 *
 * // Use the hook anywhere:
 * function MyComponent() {
 *   const { announce } = useAnnouncer();
 *
 *   const handleSubmit = async () => {
 *     await submitForm();
 *     announce('Form submitted successfully');
 *   };
 * }
 * ```
 */

type Politeness = 'polite' | 'assertive';

interface AnnouncerContextValue {
  /** Announce a message to screen readers */
  announce: (message: string, politeness?: Politeness) => void;
  /** Announce a polite message (won't interrupt) */
  announcePolite: (message: string) => void;
  /** Announce an assertive message (will interrupt) */
  announceAssertive: (message: string) => void;
}

const AnnouncerContext = React.createContext<AnnouncerContextValue | null>(null);

interface AnnouncerProviderProps {
  children: React.ReactNode;
  /** Timeout in ms before clearing the announcement (default: 1000) */
  timeout?: number;
}

export function AnnouncerProvider({ children, timeout = 1000 }: AnnouncerProviderProps) {
  const [politeMessage, setPoliteMessage] = React.useState('');
  const [assertiveMessage, setAssertiveMessage] = React.useState('');

  const politeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const assertiveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const announce = React.useCallback(
    (message: string, politeness: Politeness = 'polite') => {
      if (politeness === 'assertive') {
        // Clear any pending timeout
        if (assertiveTimeoutRef.current) {
          clearTimeout(assertiveTimeoutRef.current);
        }

        // Clear first, then set after a brief delay to ensure change is detected
        setAssertiveMessage('');
        setTimeout(() => {
          setAssertiveMessage(message);
        }, 50);

        // Clear after timeout
        assertiveTimeoutRef.current = setTimeout(() => {
          setAssertiveMessage('');
        }, timeout);
      } else {
        // Clear any pending timeout
        if (politeTimeoutRef.current) {
          clearTimeout(politeTimeoutRef.current);
        }

        // Clear first, then set after a brief delay
        setPoliteMessage('');
        setTimeout(() => {
          setPoliteMessage(message);
        }, 50);

        // Clear after timeout
        politeTimeoutRef.current = setTimeout(() => {
          setPoliteMessage('');
        }, timeout);
      }
    },
    [timeout]
  );

  const announcePolite = React.useCallback(
    (message: string) => announce(message, 'polite'),
    [announce]
  );

  const announceAssertive = React.useCallback(
    (message: string) => announce(message, 'assertive'),
    [announce]
  );

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (politeTimeoutRef.current) {
        clearTimeout(politeTimeoutRef.current);
      }
      if (assertiveTimeoutRef.current) {
        clearTimeout(assertiveTimeoutRef.current);
      }
    };
  }, []);

  const value = React.useMemo(
    () => ({ announce, announcePolite, announceAssertive }),
    [announce, announcePolite, announceAssertive]
  );

  return (
    <AnnouncerContext.Provider value={value}>
      {children}
      {/* Polite live region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip:rect(0,0,0,0)]"
      >
        {politeMessage}
      </div>
      {/* Assertive live region */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip:rect(0,0,0,0)]"
      >
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  );
}

/**
 * Hook to access the announcer context
 */
export function useAnnouncer(): AnnouncerContextValue {
  const context = React.useContext(AnnouncerContext);

  if (!context) {
    throw new Error('useAnnouncer must be used within an AnnouncerProvider');
  }

  return context;
}

/**
 * Standalone Announcer Component
 *
 * For cases where you want to render announcements without the provider pattern.
 *
 * @example
 * ```tsx
 * const [message, setMessage] = useState('');
 *
 * <Announcer message={message} />
 *
 * // Later:
 * setMessage('Item added to cart');
 * ```
 */
interface AnnouncerProps {
  /** Message to announce */
  message: string;
  /** Politeness level */
  politeness?: Politeness;
}

export function Announcer({ message, politeness = 'polite' }: AnnouncerProps) {
  const [currentMessage, setCurrentMessage] = React.useState('');

  React.useEffect(() => {
    if (message) {
      // Clear first to ensure change is detected
      setCurrentMessage('');
      const setTimeoutId = setTimeout(() => {
        setCurrentMessage(message);
      }, 50);

      // Clear after 1 second
      const clearTimeoutId = setTimeout(() => {
        setCurrentMessage('');
      }, 1000);

      return () => {
        clearTimeout(setTimeoutId);
        clearTimeout(clearTimeoutId);
      };
    }
  }, [message]);

  return (
    <div
      role={politeness === 'assertive' ? 'alert' : 'status'}
      aria-live={politeness}
      aria-atomic="true"
      className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip:rect(0,0,0,0)]"
    >
      {currentMessage}
    </div>
  );
}

export default AnnouncerProvider;
