'use client';

import * as React from 'react';
import { FileQuestion, Home, Globe, Sparkles } from 'lucide-react';

/**
 * Root Not Found Page
 *
 * Fallback for 404 errors at the root level (outside locale segments).
 * Provides language selection to redirect users to the appropriate locale.
 *
 * Toss-style dark theme design - NO providers available (no translations, no theme).
 * Must include its own <html> and <body> tags.
 *
 * Design:
 * - Background: #000000 (black)
 * - Card: #121212
 * - Primary accent: #0079FF / #00E5FF
 * - Border radius: 24px (rounded-3xl)
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: '#000000',
          color: '#FFFFFF',
          margin: 0,
          fontFamily:
            "'Pretendard Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            position: 'relative',
          }}
        >
          {/* Glow Background Effect */}
          <div
            style={{
              position: 'absolute',
              top: '25%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '600px',
              height: '600px',
              background: 'rgba(0, 121, 255, 0.1)',
              borderRadius: '50%',
              filter: 'blur(120px)',
              pointerEvents: 'none',
            }}
          />

          {/* Card */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              maxWidth: '448px',
              width: '100%',
              backgroundColor: '#121212',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '32px',
              textAlign: 'center',
            }}
          >
            {/* Icon with Glow */}
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '24px',
                backgroundColor: 'rgba(0, 121, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '24px',
                  backgroundColor: 'rgba(0, 121, 255, 0.2)',
                  filter: 'blur(20px)',
                }}
              />
              <FileQuestion
                size={48}
                color="#0079FF"
                style={{ position: 'relative', zIndex: 1 }}
              />
            </div>

            {/* 404 Number */}
            <div style={{ marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '64px',
                  fontWeight: 800,
                  background: 'linear-gradient(to right, #0079FF, #00E5FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                404
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#FFFFFF',
                margin: '0 0 12px',
              }}
            >
              Page Not Found
            </h1>

            {/* Description - English */}
            <p
              style={{
                fontSize: '16px',
                color: '#8B95A1',
                margin: '0 0 8px',
                lineHeight: 1.6,
              }}
            >
              The page you&apos;re looking for doesn&apos;t exist.
            </p>

            {/* Description - Korean */}
            <p
              style={{
                fontSize: '14px',
                color: '#8B95A1',
                margin: '0 0 24px',
              }}
            >
              찾으시는 페이지가 존재하지 않습니다.
            </p>

            {/* Language Selection Label */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#8B95A1',
                fontSize: '14px',
                marginBottom: '16px',
              }}
            >
              <Globe size={16} />
              <span>Select your language</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Korean Home - Primary CTA with Glow */}
              <a
                href="/ko/home"
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '48px',
                  padding: '0 32px',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#000000',
                  backgroundColor: '#00E5FF',
                  border: 'none',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 0 40px rgba(0, 229, 255, 0.4)',
                  transition: 'transform 0.2s, box-shadow 0.3s',
                  textDecoration: 'none',
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
                <Home size={20} />
                한국어로 홈 이동
              </a>

              {/* English Home - Secondary Button */}
              <a
                href="/en/home"
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '44px',
                  padding: '0 24px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0079FF',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(0, 121, 255, 0.3)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, background-color 0.2s, border-color 0.2s',
                  textDecoration: 'none',
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
                Go to Home (English)
              </a>
            </div>

            {/* Decorative Element */}
            <div
              style={{
                marginTop: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'rgba(139, 149, 161, 0.5)',
                fontSize: '12px',
              }}
            >
              <Sparkles size={12} />
              <span>The Potential</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
