/**
 * Experts Feature Types
 *
 * TypeScript types for expert profiles, search filters, and collaboration requests.
 */

import type { Database } from '@/types/database';

/**
 * Expert category enum type from database
 */
export type ExpertCategory = Database['public']['Enums']['expert_category'];

/**
 * Expert status enum type from database
 */
export type ExpertStatus = Database['public']['Enums']['expert_status'];

/**
 * Collaboration type enum from database
 */
export type CollaborationType = Database['public']['Enums']['collaboration_type'];

/**
 * Collaboration status enum from database
 */
export type CollaborationStatus =
  Database['public']['Enums']['collaboration_status'];

/**
 * Profile information for expert's user profile
 */
export interface ExpertProfileUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
}

/**
 * Expert profile entity from the database
 */
export interface ExpertProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_registration_number: string | null;
  category: ExpertCategory;
  subcategories: string[];
  service_description: string | null;
  specialty: string[];
  price_range_min: number | null;
  price_range_max: number | null;
  service_regions: string[];
  portfolio_url: string | null;
  portfolio_files: string[];
  status: ExpertStatus;
  verification_documents: string[];
  verified_at: string | null;
  verified_by: string | null;
  rejection_reason: string | null;
  is_featured: boolean;
  is_available: boolean;
  view_count: number;
  contact_count: number;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  collaboration_needs: string | null;
  bio: string | null;
  experience_years: number | null;
  hourly_rate: number | null;
}

/**
 * Expert profile with user profile information (joined from profiles)
 */
export interface ExpertWithProfile extends ExpertProfile {
  profile: ExpertProfileUser;
}

/**
 * Filters for expert search
 */
export interface ExpertFilters {
  /** Filter by expert category */
  category?: ExpertCategory;
  /** Search keyword (matches business_name, service_description, specialty) */
  keyword?: string;
  /** Minimum hourly rate */
  minPrice?: number;
  /** Maximum hourly rate */
  maxPrice?: number;
  /** Filter by service regions */
  regions?: string[];
  /** Filter by availability status */
  isAvailable?: boolean;
  /** Filter by featured status */
  isFeatured?: boolean;
}

/**
 * Pagination options for expert list
 */
export interface ExpertPaginationOptions {
  /** Number of items per page */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Sort by field */
  sortBy?: 'created_at' | 'view_count' | 'contact_count';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Combined search parameters for experts
 */
export interface ExpertSearchParams extends ExpertFilters, ExpertPaginationOptions {}

/**
 * Response for paginated expert list
 */
export interface ExpertListResponse {
  experts: ExpertWithProfile[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Collaboration request entity from the database
 */
export interface CollaborationRequest {
  id: number;
  sender_id: string;
  recipient_id: string;
  expert_profile_id: string | null;
  type: CollaborationType;
  subject: string;
  message: string;
  contact_info: string | null;
  status: CollaborationStatus;
  response_message: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Input for creating a collaboration request
 */
export interface CreateCollaborationInput {
  /** ID of the expert profile to contact */
  expert_profile_id: string;
  /** ID of the recipient user */
  recipient_id: string;
  /** Type of request: coffee_chat or collaboration */
  type: CollaborationType;
  /** Subject line for the request */
  subject: string;
  /** Message content */
  message: string;
  /** Optional contact information */
  contact_info?: string;
}

/**
 * Input for responding to a collaboration request
 */
export interface RespondCollaborationInput {
  /** ID of the collaboration request */
  request_id: number;
  /** New status: accepted or declined */
  status: 'accepted' | 'declined';
  /** Optional response message */
  response_message?: string;
}

/**
 * Query keys for TanStack Query cache management
 */
export const expertQueryKeys = {
  all: ['experts'] as const,
  lists: () => [...expertQueryKeys.all, 'list'] as const,
  list: (filters?: ExpertFilters) => [...expertQueryKeys.lists(), filters] as const,
  details: () => [...expertQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...expertQueryKeys.details(), id] as const,
} as const;

export const collaborationQueryKeys = {
  all: ['collaborations'] as const,
  sent: () => [...collaborationQueryKeys.all, 'sent'] as const,
  received: () => [...collaborationQueryKeys.all, 'received'] as const,
  detail: (id: number) => [...collaborationQueryKeys.all, 'detail', id] as const,
} as const;
