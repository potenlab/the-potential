/**
 * Support Programs API Exports
 *
 * Central export point for all support programs API hooks and utilities.
 */

// Query hooks
export {
  // Programs queries
  useSupportPrograms,
  useSupportProgramsInfinite,
  useSupportProgram,
  // Bookmark queries
  useBookmarkedPrograms,
  // Bookmark mutations
  useBookmarkMutation,
  // Convenience hooks
  useSupportProgramMutations,
} from './queries';

// Re-export types and query keys for external use
export type {
  SupportProgram,
  SupportProgramWithBookmark,
  ProgramStatus,
  ProgramCategory,
  SupportProgramFilters,
  SupportProgramSearchParams,
  SupportProgramPaginationOptions,
  SupportProgramListResponse,
  ProgramCardProps,
} from '../types';

export { supportProgramQueryKeys, bookmarkQueryKeys } from '../types';
