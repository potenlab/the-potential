/**
 * Community Feature Types
 *
 * TypeScript types for posts, comments, likes, and related entities
 * in the Thread/Community feed feature.
 */

/**
 * Author information embedded in posts and comments
 */
export interface Author {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
}

/**
 * Post entity from the database
 */
export interface Post {
  id: number;
  author_id: string;
  content: string;
  media_urls: string[];
  like_count: number;
  comment_count: number;
  is_pinned: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Post with author information (joined from profiles)
 */
export interface PostWithAuthor extends Post {
  author: Author;
  is_liked: boolean;
  is_bookmarked: boolean;
}

/**
 * Comment entity from the database
 */
export interface Comment {
  id: number;
  post_id: number;
  author_id: string;
  parent_id: number | null;
  content: string;
  like_count: number;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Comment with author information (joined from profiles)
 */
export interface CommentWithAuthor extends Comment {
  author: Author;
  is_liked: boolean;
  replies?: CommentWithAuthor[];
}

/**
 * Like entity for polymorphic likes (posts and comments)
 */
export interface Like {
  id: number;
  user_id: string;
  likeable_type: 'post' | 'comment';
  likeable_id: number;
  created_at: string;
}

/**
 * Cursor for feed pagination
 * Uses (created_at, id) for stable cursor-based pagination
 */
export interface FeedCursor {
  created_at: string;
  id: number;
}

/**
 * Paginated feed response
 */
export interface FeedPage {
  posts: PostWithAuthor[];
  nextCursor: FeedCursor | null;
  hasNextPage: boolean;
}

/**
 * Input for creating a new post
 */
export interface CreatePostInput {
  content: string;
  media_urls?: string[];
}

/**
 * Input for creating a new comment
 */
export interface CreateCommentInput {
  post_id: number;
  content: string;
  parent_id?: number;
}

/**
 * Input for liking/unliking
 */
export interface LikeInput {
  likeable_type: 'post' | 'comment';
  likeable_id: number;
}

/**
 * Post detail with comments
 */
export interface PostDetail extends PostWithAuthor {
  comments: CommentWithAuthor[];
}

/**
 * Query keys for TanStack Query cache management
 */
export const postQueryKeys = {
  all: ['posts'] as const,
  lists: () => [...postQueryKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...postQueryKeys.lists(), filters] as const,
  details: () => [...postQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...postQueryKeys.details(), id] as const,
} as const;

export const commentQueryKeys = {
  all: ['comments'] as const,
  lists: () => [...commentQueryKeys.all, 'list'] as const,
  list: (postId: number) => [...commentQueryKeys.lists(), postId] as const,
} as const;

export const likeQueryKeys = {
  all: ['likes'] as const,
  userLikes: (userId: string) => [...likeQueryKeys.all, 'user', userId] as const,
} as const;

export const bookmarkQueryKeys = {
  all: ['bookmarks'] as const,
  user: (userId: string) => [...bookmarkQueryKeys.all, 'user', userId] as const,
} as const;
