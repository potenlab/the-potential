import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * Create next-intl plugin with custom request config path
 * This enables internationalization support throughout the app
 */
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  experimental: {
    // Enable optimized imports to avoid barrel file performance issues
    // Reference: vercel-react-best-practices/bundle-barrel-imports.md
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      'date-fns',
      'zod',
      'sonner',
      '@tanstack/react-query',
      'react-hook-form',
    ],
  },
  images: {
    // Enable modern image formats for better compression
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images (matches Tailwind breakpoints)
    deviceSizes: [640, 768, 1024, 1280, 1536],
    // Image sizes for the `sizes` prop
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimize layout shift with blur placeholder
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile images
      },
    ],
  },
  // Enable compression for better transfer speeds
  compress: true,
  // Generate source maps for production debugging (can be disabled if not needed)
  productionBrowserSourceMaps: false,
  // Strict mode for better React development
  reactStrictMode: true,
  // Power bundle analyzer in development (uncomment when needed)
  // ANALYZE=true npm run build
};

export default withNextIntl(nextConfig);
