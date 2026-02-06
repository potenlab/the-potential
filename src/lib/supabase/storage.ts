/**
 * Supabase Storage Utilities
 *
 * Provides reusable functions for file uploads to Supabase Storage.
 * Follows patterns established in post-composer for consistency.
 */

import { supabase } from './client';
import { STORAGE_BUCKETS } from '@/lib/image';

/**
 * Allowed image MIME types
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

/**
 * Maximum file size in MB
 */
export const MAX_IMAGE_SIZE_MB = 5;

/**
 * File validation error types
 */
export type FileValidationError = 'invalid_type' | 'file_too_large' | 'upload_failed';

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean;
  error?: FileValidationError;
  message?: string;
}

/**
 * Upload result
 */
export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Validates a file before upload
 *
 * @param file - The file to validate
 * @param allowedTypes - Allowed MIME types (defaults to image types)
 * @param maxSizeMB - Maximum file size in MB (defaults to 5MB)
 * @returns Validation result
 */
export function validateFile(
  file: File,
  allowedTypes: readonly string[] = ALLOWED_IMAGE_TYPES,
  maxSizeMB: number = MAX_IMAGE_SIZE_MB
): FileValidationResult {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'invalid_type',
      message: `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: 'file_too_large',
      message: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum of ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Generates a unique file path for storage
 *
 * @param bucket - Storage bucket name
 * @param userId - User ID for the path
 * @param fileName - Original file name
 * @returns Unique file path
 */
export function generateFilePath(
  bucket: keyof typeof STORAGE_BUCKETS,
  userId: string,
  fileName: string
): string {
  const fileExt = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${userId}/${timestamp}-${randomStr}.${fileExt}`;
}

/**
 * Uploads a file to Supabase Storage
 *
 * @param bucket - Storage bucket name
 * @param file - The file to upload
 * @param userId - User ID for the path (required for RLS)
 * @param options - Additional options
 * @returns Upload result with public URL
 */
export async function uploadFile(
  bucket: keyof typeof STORAGE_BUCKETS,
  file: File,
  userId: string,
  options?: {
    allowedTypes?: readonly string[];
    maxSizeMB?: number;
  }
): Promise<UploadResult> {
  // Validate file
  const validation = validateFile(
    file,
    options?.allowedTypes,
    options?.maxSizeMB
  );

  if (!validation.valid) {
    return {
      success: false,
      error: validation.message,
    };
  }

  try {
    // Generate unique file path
    const filePath = generateFilePath(bucket, userId, file.name);
    const bucketName = STORAGE_BUCKETS[bucket];

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return {
        success: false,
        error: `Upload failed: ${uploadError.message}`,
      };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    console.error('Unexpected upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected upload error',
    };
  }
}

/**
 * Uploads an event image to Supabase Storage
 *
 * Convenience function specifically for event images.
 *
 * @param file - The image file to upload
 * @param userId - User ID for the path
 * @returns Upload result with public URL
 */
export async function uploadEventImage(
  file: File,
  userId: string
): Promise<UploadResult> {
  return uploadFile('eventImages', file, userId, {
    allowedTypes: ALLOWED_IMAGE_TYPES,
    maxSizeMB: MAX_IMAGE_SIZE_MB,
  });
}

/**
 * Deletes a file from Supabase Storage
 *
 * @param bucket - Storage bucket name
 * @param filePath - Path to the file within the bucket
 * @returns Success boolean
 */
export async function deleteFile(
  bucket: keyof typeof STORAGE_BUCKETS,
  filePath: string
): Promise<boolean> {
  try {
    const bucketName = STORAGE_BUCKETS[bucket];

    // Extract path from full URL if needed
    const path = filePath.includes(bucketName)
      ? filePath.split(`${bucketName}/`).pop() || filePath
      : filePath;

    const { error } = await supabase.storage.from(bucketName).remove([path]);

    if (error) {
      console.error('Storage delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected delete error:', error);
    return false;
  }
}

export default {
  validateFile,
  generateFilePath,
  uploadFile,
  uploadEventImage,
  deleteFile,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_MB,
};
