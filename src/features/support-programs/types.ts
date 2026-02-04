/**
 * Support Programs Feature Types
 *
 * TypeScript types for support programs, search filters, and bookmarks.
 */

import type { Database } from '@/types/database';

/**
 * Program status enum type from database
 */
export type ProgramStatus = Database['public']['Enums']['program_status'];

/**
 * Program category enum type from database
 */
export type ProgramCategory = Database['public']['Enums']['program_category'];

/**
 * Support program entity from the database
 */
export interface SupportProgram {
  id: number;
  title: string;
  description: string;
  organization: string;
  category: ProgramCategory;
  amount: string | null;
  eligibility: string | null;
  benefits: string[];
  external_url: string | null;
  image_url: string | null;
  application_start: string | null;
  application_deadline: string | null;
  program_start: string | null;
  program_end: string | null;
  status: ProgramStatus;
  created_by: string;
  view_count: number;
  bookmark_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/**
 * Support program with bookmark status
 */
export interface SupportProgramWithBookmark extends SupportProgram {
  is_bookmarked: boolean;
}

/**
 * Filters for support program search
 */
export interface SupportProgramFilters {
  /** Filter by program category */
  category?: ProgramCategory;
  /** Search keyword (matches title, organization, description) */
  keyword?: string;
  /** Show only programs with upcoming deadlines */
  showUpcoming?: boolean;
  /** Show only programs that are currently open for applications */
  showOpen?: boolean;
}

/**
 * Pagination options for program list
 */
export interface SupportProgramPaginationOptions {
  /** Number of items per page */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Sort by field */
  sortBy?: 'created_at' | 'application_deadline' | 'view_count';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Combined search parameters for support programs
 */
export interface SupportProgramSearchParams
  extends SupportProgramFilters,
    SupportProgramPaginationOptions {}

/**
 * Response for paginated program list
 */
export interface SupportProgramListResponse {
  programs: SupportProgramWithBookmark[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Query keys for TanStack Query cache management
 */
export const supportProgramQueryKeys = {
  all: ['support-programs'] as const,
  lists: () => [...supportProgramQueryKeys.all, 'list'] as const,
  list: (filters?: SupportProgramFilters) =>
    [...supportProgramQueryKeys.lists(), filters] as const,
  details: () => [...supportProgramQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...supportProgramQueryKeys.details(), id] as const,
  bookmarks: () => [...supportProgramQueryKeys.all, 'bookmarks'] as const,
} as const;

export const bookmarkQueryKeys = {
  all: ['bookmarks'] as const,
  programs: () => [...bookmarkQueryKeys.all, 'programs'] as const,
} as const;

/**
 * Support Program Card Props
 * Used by the ProgramCard component
 */
export interface ProgramCardProps {
  /** The program data */
  program: SupportProgramWithBookmark;
  /** Additional CSS classes */
  className?: string;
  /** Click handler for card */
  onClick?: () => void;
  /** Whether the card should fill its container width (for grid layouts) */
  fullWidth?: boolean;
}
