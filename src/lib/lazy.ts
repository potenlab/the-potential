'use client';

/**
 * Lazy Loading Utilities
 *
 * Provides dynamic import helpers for code splitting and lazy loading components.
 * This reduces initial bundle size by loading components only when needed.
 *
 * Features:
 * - Named export support for dynamic imports
 * - Preload hints for anticipated navigation
 * - Error boundary integration
 * - Loading state management
 *
 * @example
 * ```tsx
 * // Basic usage
 * const LazyComponent = lazyWithPreload(() => import('./HeavyComponent'));
 *
 * // Preload on hover
 * <button onMouseEnter={LazyComponent.preload}>
 *   Load Content
 * </button>
 *
 * // With Suspense
 * <Suspense fallback={<ComponentSkeleton />}>
 *   <LazyComponent />
 * </Suspense>
 * ```
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Extended lazy component with preload capability
 */
type LazyComponentWithPreload<T extends ComponentType<unknown>> =
  LazyExoticComponent<T> & {
    preload: () => Promise<{ default: T }>;
  };

/**
 * Creates a lazy component with preload capability.
 * Use this for heavy components that should be code-split.
 *
 * @param factory - Dynamic import function
 * @returns Lazy component with preload method
 */
export function lazyWithPreload<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
): LazyComponentWithPreload<T> {
  const Component = lazy(factory) as LazyComponentWithPreload<T>;
  Component.preload = factory;
  return Component;
}

/**
 * Creates a lazy component from a named export.
 * Use this when the component is not the default export.
 *
 * @param factory - Dynamic import function
 * @param exportName - Name of the exported component
 * @returns Lazy component
 *
 * @example
 * ```tsx
 * // For named exports like: export const MyComponent = () => ...
 * const LazyComponent = lazyNamed(
 *   () => import('./components'),
 *   'MyComponent'
 * );
 * ```
 */
export function lazyNamed<
  T extends ComponentType<unknown>,
  K extends string,
>(
  factory: () => Promise<Record<K, T>>,
  exportName: K
): LazyExoticComponent<T> {
  return lazy(async () => {
    const module = await factory();
    return { default: module[exportName] };
  });
}

/**
 * Preloads multiple components in parallel.
 * Call this during idle time or on route prefetch.
 *
 * @param components - Array of lazy components with preload methods
 *
 * @example
 * ```tsx
 * // Preload on page load for anticipated navigation
 * useEffect(() => {
 *   if (window.requestIdleCallback) {
 *     window.requestIdleCallback(() => {
 *       preloadComponents([LazyDashboard, LazyProfile]);
 *     });
 *   }
 * }, []);
 * ```
 */
export function preloadComponents(
  components: LazyComponentWithPreload<ComponentType<unknown>>[]
): void {
  components.forEach((component) => {
    if (typeof component.preload === 'function') {
      component.preload();
    }
  });
}

/**
 * Delays component loading until browser is idle.
 * Useful for below-the-fold content.
 *
 * @param factory - Dynamic import function
 * @param delay - Minimum delay in ms (default: 0)
 * @returns Lazy component
 *
 * @example
 * ```tsx
 * // Load after initial render settles
 * const LazyFooter = lazyIdle(() => import('./Footer'), 100);
 * ```
 */
export function lazyIdle<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
  delay = 0
): LazyExoticComponent<T> {
  return lazy(
    () =>
      new Promise((resolve) => {
        const load = () => {
          setTimeout(() => {
            factory().then(resolve);
          }, delay);
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          window.requestIdleCallback(load);
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(load, 50);
        }
      })
  );
}

/**
 * Creates a lazy component that loads on intersection (visibility).
 * Ideal for below-the-fold components.
 *
 * Note: Requires wrapping with IntersectionObserver or using
 * react-intersection-observer package.
 *
 * @param factory - Dynamic import function
 * @returns Object with component and a load trigger function
 */
export function lazyOnVisible<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
): {
  Component: LazyExoticComponent<T>;
  triggerLoad: () => void;
  isLoaded: () => boolean;
} {
  let loaded = false;
  let loadPromise: Promise<{ default: T }> | null = null;

  const triggerLoad = () => {
    if (!loadPromise) {
      loadPromise = factory();
      loadPromise.then(() => {
        loaded = true;
      });
    }
  };

  const Component = lazy(() => {
    if (loadPromise) return loadPromise;
    loadPromise = factory();
    loadPromise.then(() => {
      loaded = true;
    });
    return loadPromise;
  });

  return {
    Component,
    triggerLoad,
    isLoaded: () => loaded,
  };
}

export default {
  lazyWithPreload,
  lazyNamed,
  preloadComponents,
  lazyIdle,
  lazyOnVisible,
};
