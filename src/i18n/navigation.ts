import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Localized navigation utilities for next-intl
 *
 * These utilities automatically handle locale prefixes in URLs:
 * - Link: Localized <Link> component that adds locale prefix
 * - redirect: Localized redirect function
 * - usePathname: Get pathname without locale prefix
 * - useRouter: Localized router for programmatic navigation
 * - getPathname: Get localized pathname for a given route
 *
 * Usage:
 * ```tsx
 * import { Link, usePathname, useRouter } from '@/i18n/navigation';
 *
 * // In a component:
 * const pathname = usePathname(); // Returns '/home' without locale
 * const router = useRouter();
 *
 * // Navigate to a path (locale is added automatically)
 * router.push('/experts');
 *
 * // Change locale while preserving path
 * router.replace(pathname, { locale: 'en' });
 * ```
 */
export const {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname,
} = createNavigation(routing);
