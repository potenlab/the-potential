/**
 * Experts API Exports
 *
 * Central export point for all expert search API hooks and utilities.
 */

// Query hooks
export {
  // Expert queries
  useExperts,
  useExpertsInfinite,
  useExpert,
  // Collaboration queries
  useSentCollaborations,
  useReceivedCollaborations,
  // Collaboration mutations
  useCreateCollaborationRequest,
  useRespondToCollaboration,
  useCancelCollaborationRequest,
  useExpertMutations,
} from './queries';

// Re-export types and query keys for external use
export type {
  ExpertProfile,
  ExpertWithProfile,
  ExpertProfileUser,
  ExpertCategory,
  ExpertStatus,
  ExpertFilters,
  ExpertSearchParams,
  ExpertPaginationOptions,
  ExpertListResponse,
  CollaborationRequest,
  CollaborationType,
  CollaborationStatus,
  CreateCollaborationInput,
  RespondCollaborationInput,
} from '../types';

export { expertQueryKeys, collaborationQueryKeys } from '../types';
