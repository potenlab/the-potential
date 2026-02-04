'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

/**
 * Visually Hidden Component - The Potential Design System
 *
 * Hides content visually while keeping it accessible to screen readers.
 * Essential for providing context to assistive technology users without
 * affecting visual layout.
 *
 * WCAG 2.1 AA Requirements:
 * - 1.3.1 Info and Relationships: Information, structure, and relationships
 *   conveyed through presentation can be programmatically determined.
 * - 4.1.2 Name, Role, Value: For all user interface components, the name
 *   and role can be programmatically determined.
 *
 * Use cases:
 * - Icon-only buttons that need accessible labels
 * - Form labels that are visually implied but not shown
 * - Skip links before they're focused
 * - Additional context for screen readers
 *
 * @example
 * ```tsx
 * // Icon button with accessible label:
 * <button>
 *   <SearchIcon />
 *   <VisuallyHidden>Search</VisuallyHidden>
 * </button>
 *
 * // As a span for inline use:
 * <VisuallyHidden as="span">Additional context</VisuallyHidden>
 *
 * // Show content when focused (for skip links):
 * <VisuallyHidden focusable>Skip to main content</VisuallyHidden>
 * ```
 */

type VisuallyHiddenElement = 'span' | 'div' | 'label';

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLElement> {
  /** The HTML element to render */
  as?: VisuallyHiddenElement;
  /** If true, content becomes visible when focused */
  focusable?: boolean;
  /** Child content to hide visually */
  children: React.ReactNode;
}

export function VisuallyHidden({
  as: Component = 'span',
  focusable = false,
  children,
  className,
  ...props
}: VisuallyHiddenProps) {
  return (
    <Component
      className={cn(
        // Standard screen reader only styles
        'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        // Clip to hide content
        '[clip:rect(0,0,0,0)]',
        // If focusable, show on focus
        focusable && [
          'focus:static focus:w-auto focus:h-auto focus:p-2 focus:m-0',
          'focus:overflow-visible focus:whitespace-normal focus:[clip:auto]',
          'focus:bg-[#0079FF] focus:text-white focus:rounded-xl',
          'focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:ring-offset-2 focus:ring-offset-black',
        ],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Screen Reader Only (sr-only) class utility
 *
 * A CSS class that matches Tailwind's sr-only for use in className strings.
 * Provides the same functionality as VisuallyHidden component.
 */
export const srOnlyStyles =
  'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip:rect(0,0,0,0)]';

export default VisuallyHidden;
