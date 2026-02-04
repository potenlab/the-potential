'use client';

import * as React from 'react';

/**
 * Focus Trap Component - The Potential Design System
 *
 * Traps focus within a container, ensuring keyboard navigation
 * cycles through focusable elements without escaping.
 * Essential for accessible modal dialogs and drawers.
 *
 * WCAG 2.1 AA Requirements:
 * - 2.4.3 Focus Order: Focusable components receive focus in an order
 *   that preserves meaning and operability.
 * - 2.1.2 No Keyboard Trap: Keyboard users are not trapped.
 *
 * Features:
 * - Traps focus within container
 * - Handles Tab and Shift+Tab navigation
 * - Auto-focuses first element on mount
 * - Returns focus to trigger element on unmount
 * - Escape key support for closing
 *
 * @example
 * ```tsx
 * <FocusTrap
 *   active={isModalOpen}
 *   onEscape={() => setIsModalOpen(false)}
 * >
 *   <div role="dialog" aria-modal="true">
 *     <button>First focusable</button>
 *     <input type="text" />
 *     <button>Last focusable</button>
 *   </div>
 * </FocusTrap>
 * ```
 */

interface FocusTrapProps {
  /** Child elements to trap focus within */
  children: React.ReactNode;
  /** Whether the focus trap is active */
  active?: boolean;
  /** Callback when Escape key is pressed */
  onEscape?: () => void;
  /** Element to focus when trap activates (defaults to first focusable) */
  initialFocus?: React.RefObject<HTMLElement>;
  /** Element to return focus to when trap deactivates */
  returnFocus?: React.RefObject<HTMLElement>;
  /** Whether to auto-focus the first element */
  autoFocus?: boolean;
}

/** Query selector for all focusable elements */
const FOCUSABLE_ELEMENTS = [
  'a[href]:not([disabled]):not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
  '[contenteditable="true"]:not([tabindex="-1"])',
].join(', ');

export function FocusTrap({
  children,
  active = true,
  onEscape,
  initialFocus,
  returnFocus,
  autoFocus = true,
}: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<Element | null>(null);

  /**
   * Get all focusable elements within the container
   */
  const getFocusableElements = React.useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(containerRef.current.querySelectorAll(FOCUSABLE_ELEMENTS));
  }, []);

  /**
   * Focus the first focusable element
   */
  const focusFirstElement = React.useCallback(() => {
    if (initialFocus?.current) {
      initialFocus.current.focus();
      return;
    }
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
    }
  }, [getFocusableElements, initialFocus]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (!active) return;

      // Handle Escape key
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape?.();
        return;
      }

      // Only handle Tab key for focus trapping
      if (event.key !== 'Tab') return;

      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      const activeElement = document.activeElement;

      // Shift + Tab: If on first element, go to last
      if (event.shiftKey) {
        if (activeElement === firstElement || !containerRef.current?.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: If on last element, go to first
        if (activeElement === lastElement || !containerRef.current?.contains(activeElement)) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [active, getFocusableElements, onEscape]
  );

  /**
   * Store previous active element and focus first element on mount
   */
  React.useEffect(() => {
    if (!active) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement;

    // Focus the first element after a small delay to ensure render
    if (autoFocus) {
      const timeoutId = setTimeout(focusFirstElement, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [active, autoFocus, focusFirstElement]);

  /**
   * Return focus to previous element on unmount
   */
  React.useEffect(() => {
    return () => {
      if (!active) return;

      // Return focus to specified element or previous active element
      const elementToFocus = returnFocus?.current || previousActiveElement.current;
      if (elementToFocus instanceof HTMLElement) {
        elementToFocus.focus();
      }
    };
  }, [active, returnFocus]);

  /**
   * Add keyboard event listener
   */
  React.useEffect(() => {
    if (!active) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active, handleKeyDown]);

  return (
    <div ref={containerRef} className="contents">
      {children}
    </div>
  );
}

/**
 * useFocusTrap Hook
 *
 * A hook-based alternative for focus trapping that provides
 * more control over the focus trap behavior.
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const { containerRef, focusFirst } = useFocusTrap({
 *     active: isOpen,
 *     onEscape: onClose,
 *   });
 *
 *   return (
 *     <div ref={containerRef}>
 *       <button onClick={onClose}>Close</button>
 *       <input type="text" />
 *     </div>
 *   );
 * }
 * ```
 */
interface UseFocusTrapOptions {
  active?: boolean;
  onEscape?: () => void;
  autoFocus?: boolean;
}

export function useFocusTrap({
  active = true,
  onEscape,
  autoFocus = true,
}: UseFocusTrapOptions = {}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<Element | null>(null);

  const getFocusableElements = React.useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(containerRef.current.querySelectorAll(FOCUSABLE_ELEMENTS));
  }, []);

  const focusFirst = React.useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
    }
  }, [getFocusableElements]);

  const focusLast = React.useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
    }
  }, [getFocusableElements]);

  React.useEffect(() => {
    if (!active) return;

    previousActiveElement.current = document.activeElement;

    if (autoFocus) {
      const timeoutId = setTimeout(focusFirst, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [active, autoFocus, focusFirst]);

  React.useEffect(() => {
    return () => {
      if (!active) return;
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [active]);

  React.useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape?.();
        return;
      }

      if (event.key !== 'Tab') return;

      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === firstElement || !containerRef.current?.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (activeElement === lastElement || !containerRef.current?.contains(activeElement)) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active, getFocusableElements, onEscape]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    getFocusableElements,
  };
}

export default FocusTrap;
