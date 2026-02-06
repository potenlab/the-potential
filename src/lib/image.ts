/**
 * Image Optimization Utilities
 *
 * Provides helpers for optimized image loading and Supabase Storage integration.
 * Follows Next.js Image best practices for performance.
 *
 * Features:
 * - Supabase Storage URL generation with transformations
 * - Responsive srcset generation
 * - Blur placeholder data URL generation
 * - Image dimension validation
 *
 * Performance Targets:
 * - LCP < 2.5s for hero images
 * - Proper width/height to prevent CLS
 * - WebP format when supported
 */

/**
 * Default image sizes for responsive images.
 * Based on common device widths and The Potential's design breakpoints.
 */
export const IMAGE_SIZES = {
  /** Thumbnail for cards and lists */
  thumbnail: { width: 80, height: 80 },
  /** Avatar sizes */
  avatar: {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 64, height: 64 },
    xl: { width: 96, height: 96 },
  },
  /** Card images */
  card: { width: 320, height: 180 },
  /** Hero/banner images */
  hero: { width: 1200, height: 630 },
  /** Post media */
  postMedia: { width: 600, height: 400 },
  /** Expert profile cover */
  expertCover: { width: 800, height: 400 },
} as const;

/**
 * Breakpoints for responsive images (matches Tailwind defaults)
 */
export const RESPONSIVE_BREAKPOINTS = [640, 768, 1024, 1280, 1536] as const;

/**
 * Supabase Storage bucket names
 */
export const STORAGE_BUCKETS = {
  avatars: 'avatars',
  postMedia: 'post-media',
  expertDocuments: 'expert-documents',
  expertPortfolio: 'expert-portfolio',
  programImages: 'program-images',
  eventImages: 'event-images',
} as const;

type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

interface TransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'origin' | 'webp';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Generates a Supabase Storage URL with optional transformations.
 *
 * @param bucket - Storage bucket name
 * @param path - File path within the bucket
 * @param transform - Optional transformation options
 * @returns Transformed image URL
 *
 * @example
 * ```tsx
 * // Basic usage
 * const avatarUrl = getStorageUrl('avatars', 'user-123/avatar.jpg');
 *
 * // With transformations
 * const thumbnailUrl = getStorageUrl('avatars', 'user-123/avatar.jpg', {
 *   width: 80,
 *   height: 80,
 *   format: 'webp',
 * });
 * ```
 */
export function getStorageUrl(
  bucket: StorageBucket,
  path: string,
  transform?: TransformOptions
): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL is not defined');
    return '';
  }

  // Clean path (remove leading slash if present)
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Build base URL
  let url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;

  // Add transformations if provided
  if (transform) {
    const params = new URLSearchParams();

    if (transform.width) params.set('width', String(transform.width));
    if (transform.height) params.set('height', String(transform.height));
    if (transform.quality) params.set('quality', String(transform.quality));
    if (transform.format) params.set('format', transform.format);
    if (transform.resize) params.set('resize', transform.resize);

    const queryString = params.toString();
    if (queryString) {
      // Use render endpoint for transformations
      url = `${supabaseUrl}/storage/v1/render/image/public/${bucket}/${cleanPath}?${queryString}`;
    }
  }

  return url;
}

/**
 * Generates a srcset string for responsive images.
 *
 * @param bucket - Storage bucket name
 * @param path - File path within the bucket
 * @param widths - Array of widths for srcset
 * @param options - Additional transform options
 * @returns srcset string for use in img or Image component
 *
 * @example
 * ```tsx
 * const srcset = generateSrcSet('post-media', 'post-123/image.jpg');
 * // Returns: "url?width=640 640w, url?width=768 768w, ..."
 * ```
 */
export function generateSrcSet(
  bucket: StorageBucket,
  path: string,
  widths: readonly number[] = RESPONSIVE_BREAKPOINTS,
  options?: Omit<TransformOptions, 'width'>
): string {
  return widths
    .map((width) => {
      const url = getStorageUrl(bucket, path, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Generates a sizes attribute string for responsive images.
 *
 * @param config - Breakpoint to size mapping
 * @returns sizes string for use in img or Image component
 *
 * @example
 * ```tsx
 * const sizes = generateSizes({
 *   default: '100vw',
 *   sm: '50vw',
 *   lg: '33vw',
 * });
 * // Returns: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
 * ```
 */
export function generateSizes(config: {
  default: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
}): string {
  const breakpointMap: Record<string, number> = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };

  const conditions: string[] = [];

  // Process breakpoints in reverse order (largest first)
  const orderedKeys = ['2xl', 'xl', 'lg', 'md', 'sm'] as const;

  for (const key of orderedKeys) {
    const size = config[key];
    if (size) {
      conditions.push(`(min-width: ${breakpointMap[key]}px) ${size}`);
    }
  }

  // Add default last
  conditions.push(config.default);

  return conditions.join(', ');
}

/**
 * Generates a tiny blur placeholder data URL.
 * Use this as a placeholder while the full image loads.
 *
 * @param width - Placeholder width (default: 8)
 * @param height - Placeholder height (default: 8)
 * @param color - Background color (default: #1a1a1a - matches dark theme)
 * @returns Data URL for blur placeholder
 */
export function getBlurPlaceholder(
  width = 8,
  height = 8,
  color = '#1a1a1a'
): string {
  // Simple SVG placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><rect fill="${color}" width="${width}" height="${height}"/></svg>`;

  // Encode to base64 for data URL
  if (typeof window !== 'undefined') {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  // Server-side encoding
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Validates image dimensions to prevent layout shift (CLS).
 *
 * @param width - Image width
 * @param height - Image height
 * @returns Validated dimensions with aspect ratio preserved
 */
export function validateDimensions(
  width: number | undefined,
  height: number | undefined
): { width: number; height: number } {
  const DEFAULT_WIDTH = 400;
  const DEFAULT_HEIGHT = 300;

  if (!width && !height) {
    return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
  }

  if (!width) {
    // Calculate width from aspect ratio (assume 4:3)
    return { width: Math.round((height! * 4) / 3), height: height! };
  }

  if (!height) {
    // Calculate height from aspect ratio (assume 4:3)
    return { width: width, height: Math.round((width * 3) / 4) };
  }

  return { width, height };
}

/**
 * Image loading priority hints.
 * Use to prioritize above-the-fold images for better LCP.
 */
export const IMAGE_PRIORITY = {
  /** Critical images above the fold - use priority={true} */
  high: { priority: true, loading: 'eager' as const },
  /** Important images that will likely be visible */
  medium: { priority: false, loading: 'eager' as const },
  /** Below-the-fold images - lazy load */
  low: { priority: false, loading: 'lazy' as const },
} as const;

/**
 * Gets Next.js Image props for a Supabase storage image.
 *
 * @param bucket - Storage bucket name
 * @param path - File path within the bucket
 * @param alt - Alt text for accessibility
 * @param size - Predefined size or custom dimensions
 * @param priority - Loading priority
 * @returns Props object for Next.js Image component
 *
 * @example
 * ```tsx
 * const imageProps = getImageProps(
 *   'avatars',
 *   'user-123/avatar.jpg',
 *   'User avatar',
 *   IMAGE_SIZES.avatar.lg,
 *   IMAGE_PRIORITY.high
 * );
 *
 * <Image {...imageProps} />
 * ```
 */
export function getImageProps(
  bucket: StorageBucket,
  path: string,
  alt: string,
  size: { width: number; height: number } = IMAGE_SIZES.card,
  priority: (typeof IMAGE_PRIORITY)[keyof typeof IMAGE_PRIORITY] = IMAGE_PRIORITY.low
) {
  return {
    src: getStorageUrl(bucket, path),
    alt,
    width: size.width,
    height: size.height,
    ...priority,
    placeholder: 'blur' as const,
    blurDataURL: getBlurPlaceholder(
      Math.min(size.width, 8),
      Math.min(size.height, 8)
    ),
  };
}

export default {
  IMAGE_SIZES,
  STORAGE_BUCKETS,
  RESPONSIVE_BREAKPOINTS,
  getStorageUrl,
  generateSrcSet,
  generateSizes,
  getBlurPlaceholder,
  validateDimensions,
  IMAGE_PRIORITY,
  getImageProps,
};
