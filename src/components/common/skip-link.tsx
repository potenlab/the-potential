'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

/**
 * Skip Link Component - The Potential Design System
 *
 * Provides a keyboard-accessible link that allows users to skip
 * directly to the main content, bypassing navigation and other
 * repeated elements.
 *
 * WCAG 2.1 AA Requirement:
 * - 2.4.1 Bypass Blocks: A mechanism is available to bypass blocks
 *   of content that are repeated on multiple Web pages.
 *
 * Features:
 * - Visually hidden until focused
 * - Appears at the top of the viewport when focused
 * - Uses primary color styling for visibility
 * - Properly handles focus management
 *
 * @example
 * ```tsx
 * // In your root layout or main component:
 * <SkipLink href="#main-content" />
 * // ...navigation and header...
 * <main id="main-content" tabIndex={-1}>
 *   // Main content here
 * </main>
 * ```
 */

interface SkipLinkProps {
  /** Target element ID to skip to (without #) */
  href?: string;
  /** Custom label text */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

export function SkipLink({
  href = '#main-content',
  label = 'Skip to main content',
  className,
}: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const target = document.getElementById(targetId);

    if (target) {
      // Set focus to the target element
      target.focus();
      // Scroll the element into view
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        // Visually hidden by default
        'absolute left-0 z-[100]',
        // Positioned off-screen
        '-top-12',
        // Styling when focused
        'focus:top-0',
        // Visual styling
        'bg-[#0079FF] text-white',
        'px-4 py-2',
        'font-semibold text-sm',
        'rounded-br-2xl',
        // Transition
        'transition-[top] duration-200',
        // Focus ring
        'focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:ring-offset-2 focus:ring-offset-black',
        className
      )}
    >
      {label}
    </a>
  );
}

/**
 * Skip Links Container Component
 *
 * Provides multiple skip links for different sections of the page.
 * Useful for complex pages with multiple distinct regions.
 *
 * @example
 * ```tsx
 * <SkipLinksContainer
 *   links={[
 *     { href: '#main-content', label: 'Skip to main content' },
 *     { href: '#navigation', label: 'Skip to navigation' },
 *     { href: '#footer', label: 'Skip to footer' },
 *   ]}
 * />
 * ```
 */

interface SkipLinksContainerProps {
  links: Array<{
    href: string;
    label: string;
  }>;
  className?: string;
}

export function SkipLinksContainer({ links, className }: SkipLinksContainerProps) {
  return (
    <nav
      aria-label="Skip links"
      className={cn(
        'fixed top-0 left-0 z-[100]',
        // Visually hidden until child is focused
        'focus-within:block',
        className
      )}
    >
      <ul className="flex flex-col gap-1 p-1">
        {links.map((link, index) => (
          <li key={link.href}>
            <a
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                const targetId = link.href.replace('#', '');
                const target = document.getElementById(targetId);
                if (target) {
                  target.focus();
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={cn(
                // Visually hidden by default
                'sr-only focus:not-sr-only',
                // Styling when focused
                'focus:absolute focus:top-0 focus:left-0',
                'focus:bg-[#0079FF] focus:text-white',
                'focus:px-4 focus:py-2',
                'focus:font-semibold focus:text-sm',
                'focus:rounded-br-2xl',
                // Focus ring
                'focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:ring-offset-2 focus:ring-offset-black',
                // Z-index based on index
                `focus:z-[${100 + index}]`
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SkipLink;
