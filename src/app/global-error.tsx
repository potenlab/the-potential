'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw, Home, Sparkles } from 'lucide-react';

/**
 * Global Error Page
 *
 * Root-level error boundary that catches errors in the root layout.
 * Toss-style dark theme design - NO providers available (no translations, no theme).
 * Must include its own <html> and <body> tags.
 *
 * Design:
 * - Background: #000000 (black)
 * - Card: #121212
 * - Error accent: #FF453A
 * - CTA: #00E5FF with glow
 * - Border radius: 24px (rounded-3xl)
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-root-layouts
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{
        backgroundColor: '#000000',
        color: '#FFFFFF',
        margin: 0,
        fontFamily: "'Pretendard Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          position: 'relative',
        }}>
          {/* Glow Background Effect */}
          <div style={{
            position: 'absolute',
            top: '25%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '600px',
            background: 'rgba(255, 69, 58, 0.05)',
            borderRadius: '50%',
            filter: 'blur(120px)',
            pointerEvents: 'none',
          }} />

          {/* Card */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '448px',
            width: '100%',
            backgroundColor: '#121212',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '32px',
            textAlign: 'center',
          }}>
            {/* Icon with Error Glow */}
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 69, 58, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '24px',
                backgroundColor: 'rgba(255, 69, 58, 0.2)',
                filter: 'blur(20px)',
              }} />
              <AlertCircle
                size={48}
                color="#FF453A"
                style={{ position: 'relative', zIndex: 1 }}
              />
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: '0 0 12px',
            }}>
              Something went wrong
            </h1>

            {/* Description */}
            <p style={{
              fontSize: '16px',
              color: '#8B95A1',
              margin: '0 0 24px',
              lineHeight: 1.6,
            }}>
              An unexpected error occurred. Please try again or refresh the page.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{
                marginBottom: '24px',
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 69, 58, 0.05)',
                border: '1px solid rgba(255, 69, 58, 0.2)',
                textAlign: 'left',
              }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FF453A',
                  margin: '0 0 8px',
                }}>
                  Error Details:
                </p>
                <p style={{
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: 'rgba(255, 69, 58, 0.8)',
                  margin: 0,
                  wordBreak: 'break-all',
                }}>
                  {error.message}
                </p>
                {error.digest && (
                  <p style={{
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#8B95A1',
                    margin: '8px 0 0',
                  }}>
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Primary CTA - Retry with Glow */}
              <button
                onClick={reset}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 32px',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#000000',
                  backgroundColor: '#00E5FF',
                  border: 'none',
                  borderRadius: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 0 40px rgba(0, 229, 255, 0.4)',
                  transition: 'transform 0.2s, box-shadow 0.3s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 0 50px rgba(0, 229, 255, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 229, 255, 0.4)';
                }}
              >
                <RefreshCw size={20} />
                Try Again
              </button>

              {/* Secondary Button - Go Home */}
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 24px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0079FF',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(0, 121, 255, 0.3)',
                  borderRadius: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, background-color 0.2s, border-color 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 121, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(0, 121, 255, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(0, 121, 255, 0.3)';
                }}
              >
                <Home size={16} />
                Go to Home
              </button>
            </div>

            {/* Contact Support */}
            <p style={{
              marginTop: '24px',
              fontSize: '12px',
              color: '#8B95A1',
            }}>
              If this problem persists, please contact support.
            </p>

            {/* Decorative Element */}
            <div style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: 'rgba(139, 149, 161, 0.5)',
              fontSize: '12px',
            }}>
              <Sparkles size={12} />
              <span>The Potential</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
