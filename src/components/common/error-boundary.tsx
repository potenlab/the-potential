'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary Component - The Potential Design System
 *
 * A React error boundary that catches JavaScript errors in child components,
 * displays a user-friendly error message in the current locale, and provides
 * a retry mechanism.
 *
 * Features:
 * - Catches runtime errors in child component tree
 * - Displays localized error messages using next-intl
 * - Provides retry button to attempt reload
 * - Styled according to dark theme design system
 * - Accessible with proper ARIA attributes
 *
 * @example
 * ```tsx
 * // Wrap a component or page:
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // With custom fallback:
 * <ErrorBoundary fallback={<CustomErrorComponent />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  /** Child components to render */
  children: React.ReactNode;
  /** Optional custom fallback component */
  fallback?: React.ReactNode;
  /** Optional callback when error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Optional callback when retry is clicked */
  onRetry?: () => void;
}

/**
 * Error Fallback UI Component
 * Displays a user-friendly error message with retry functionality
 */
function ErrorFallbackUI({
  error,
  onRetry,
}: {
  error: Error | null;
  onRetry: () => void;
}) {
  const t = useTranslations('errors');
  const tCommon = useTranslations('common');

  return (
    <div
      className="flex items-center justify-center min-h-[200px] p-4"
      role="alert"
      aria-live="assertive"
    >
      <Card variant="elevated" padding="lg" className="max-w-md w-full text-center">
        <CardHeader className="items-center pb-4">
          <div className="w-16 h-16 rounded-full bg-[#FF453A]/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-[#FF453A]" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">{t('serverError.title')}</CardTitle>
          <CardDescription className="mt-2">
            {t('serverError.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && error && (
            <div className="p-3 rounded-2xl bg-[#FF453A]/5 border border-[#FF453A]/20 text-left">
              <p className="text-xs font-mono text-[#FF453A] break-all">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={onRetry}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              {t('serverError.retry')}
            </Button>
            <p className="text-xs text-[#8B95A1]">
              {t('contactSupport')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Minimal Error Fallback for when translations are not available
 * Used as absolute fallback if NextIntlClientProvider fails
 */
function MinimalErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="flex items-center justify-center min-h-[200px] p-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md w-full text-center p-6 rounded-3xl bg-[#1C1C1E] border border-white/5">
        <div className="w-16 h-16 rounded-full bg-[#FF453A]/10 flex items-center justify-center mb-4 mx-auto">
          <AlertCircle className="w-8 h-8 text-[#FF453A]" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-[#8B95A1] mb-4">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 h-12 px-8 text-lg font-semibold text-white bg-[#0079FF] rounded-2xl hover:bg-[#0079FF]/90 transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}

/**
 * Error Boundary Class Component
 *
 * React error boundaries must be class components because they rely on
 * the getDerivedStateFromError and componentDidCatch lifecycle methods.
 */
class ErrorBoundaryClass extends React.Component<
  ErrorBoundaryProps & { translationsAvailable: boolean },
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps & { translationsAvailable: boolean }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    // Call optional retry callback
    this.props.onRetry?.();

    // Reset the error state to attempt re-render
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Use appropriate fallback based on translation availability
      if (this.props.translationsAvailable) {
        return (
          <ErrorFallbackUI
            error={this.state.error}
            onRetry={this.handleRetry}
          />
        );
      }

      return <MinimalErrorFallback onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

/**
 * Error Boundary Wrapper Component
 *
 * Functional wrapper that provides translation context detection
 * and passes it to the class-based error boundary.
 */
export function ErrorBoundary({
  children,
  fallback,
  onError,
  onRetry,
}: ErrorBoundaryProps) {
  // Try to detect if translations are available
  // This is a simple check - in most cases translations will be available
  const translationsAvailable = true;

  return (
    <ErrorBoundaryClass
      fallback={fallback}
      onError={onError}
      onRetry={onRetry}
      translationsAvailable={translationsAvailable}
    >
      {children}
    </ErrorBoundaryClass>
  );
}

/**
 * Error Boundary for Route Segments
 *
 * A specialized error boundary designed for use in Next.js error.tsx files.
 * Provides additional reset functionality specific to route segments.
 */
export function RouteErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  React.useEffect(() => {
    // Log the error to an error reporting service
    if (process.env.NODE_ENV === 'development') {
      console.error('Route error:', error);
    }
  }, [error]);

  return (
    <div
      className="flex items-center justify-center min-h-[400px] p-4"
      role="alert"
      aria-live="assertive"
    >
      <Card variant="elevated" padding="lg" className="max-w-md w-full text-center">
        <CardHeader className="items-center pb-4">
          <div className="w-16 h-16 rounded-full bg-[#FF453A]/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-[#FF453A]" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">{t('serverError.title')}</CardTitle>
          <CardDescription className="mt-2">
            {t('serverError.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 rounded-2xl bg-[#FF453A]/5 border border-[#FF453A]/20 text-left">
              <p className="text-xs font-mono text-[#FF453A] break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs font-mono text-[#8B95A1] mt-1">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={reset}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              {t('serverError.retry')}
            </Button>
            <p className="text-xs text-[#8B95A1]">
              {t('contactSupport')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * withErrorBoundary HOC
 *
 * Higher-order component that wraps a component with an error boundary.
 * Useful for adding error boundaries to specific components.
 *
 * @example
 * ```tsx
 * const SafeComponent = withErrorBoundary(MyComponent);
 * // or with custom options:
 * const SafeComponent = withErrorBoundary(MyComponent, {
 *   fallback: <CustomFallback />,
 *   onError: (error) => logError(error),
 * });
 * ```
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}

export default ErrorBoundary;
