/**
 * Community API Exports
 *
 * Central export point for all community feed API hooks and utilities.
 */

// Query hooks
export {
  // Posts
  usePosts,
  usePost,
  useCreatePost,
  useDeletePost,
  // Comments
  useComments,
  useCreateComment,
  useDeleteComment,
  // Likes
  useLikeMutation,
  // Bookmarks
  useBookmarkMutation,
} from './queries';

// Re-export types and query keys for external use
export type {
  Post,
  PostWithAuthor,
  Comment,
  CommentWithAuthor,
  Author,
  Like,
  FeedCursor,
  FeedPage,
  CreatePostInput,
  CreateCommentInput,
  LikeInput,
  PostDetail,
} from '../types';

export { postQueryKeys, commentQueryKeys, likeQueryKeys, bookmarkQueryKeys } from '../types';
