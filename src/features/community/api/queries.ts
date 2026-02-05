'use client';

/**
 * Community Feed API Queries
 *
 * TanStack Query hooks for posts, comments, and likes.
 * Implements cursor-based pagination, optimistic updates, and proper cache invalidation.
 */

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type {
  PostWithAuthor,
  CommentWithAuthor,
  FeedCursor,
  FeedPage,
  CreatePostInput,
  CreateCommentInput,
  LikeInput,
  Author,
} from '../types';
import { postQueryKeys, commentQueryKeys, bookmarkQueryKeys } from '../types';

// Constants
const FEED_PAGE_SIZE = 20;

// ============================================================================
// POSTS QUERIES
// ============================================================================

/**
 * Fetches a page of posts for the feed with author information
 * Uses cursor-based pagination for stable infinite scroll
 */
async function fetchPostsPage(cursor?: FeedCursor): Promise<FeedPage> {
  // Get current user for like status check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Build the query
  let query = supabase
    .from('posts')
    .select(
      `
      id,
      author_id,
      content,
      media_urls,
      like_count,
      comment_count,
      is_pinned,
      is_hidden,
      created_at,
      updated_at,
      author:profiles!author_id(
        id,
        full_name,
        avatar_url,
        company_name
      )
    `
    )
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(FEED_PAGE_SIZE + 1); // Fetch one extra to check if there's a next page

  // Apply cursor for pagination
  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`
    );
  }

  const { data: rawPosts, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }

  const posts = rawPosts || [];
  const hasNextPage = posts.length > FEED_PAGE_SIZE;
  const postsToReturn = hasNextPage ? posts.slice(0, FEED_PAGE_SIZE) : posts;

  // If user is logged in, batch check like and bookmark status for all posts
  let likedPostIds = new Set<number>();
  let bookmarkedPostIds = new Set<number>();
  if (user && postsToReturn.length > 0) {
    const postIds = postsToReturn.map((p) => p.id);
    const [likesResult, bookmarksResult] = await Promise.all([
      supabase
        .from('likes')
        .select('likeable_id')
        .eq('likeable_type', 'post')
        .eq('user_id', user.id)
        .in('likeable_id', postIds),
      supabase
        .from('bookmarks')
        .select('bookmarkable_id')
        .eq('bookmarkable_type', 'post')
        .eq('user_id', user.id)
        .in('bookmarkable_id', postIds),
    ]);

    likedPostIds = new Set(likesResult.data?.map((l) => l.likeable_id) || []);
    bookmarkedPostIds = new Set(bookmarksResult.data?.map((b) => b.bookmarkable_id) || []);
  }

  // Transform posts to include like and bookmark status
  const postsWithAuthor: PostWithAuthor[] = postsToReturn.map((post) => ({
    id: post.id,
    author_id: post.author_id,
    content: post.content,
    media_urls: post.media_urls || [],
    like_count: post.like_count,
    comment_count: post.comment_count,
    is_pinned: post.is_pinned,
    is_hidden: post.is_hidden,
    created_at: post.created_at,
    updated_at: post.updated_at,
    author: post.author as Author,
    is_liked: likedPostIds.has(post.id),
    is_bookmarked: bookmarkedPostIds.has(post.id),
  }));

  // Calculate next cursor
  const lastPost = postsToReturn[postsToReturn.length - 1];
  const nextCursor: FeedCursor | null =
    hasNextPage && lastPost
      ? {
          created_at: lastPost.created_at,
          id: lastPost.id,
        }
      : null;

  return {
    posts: postsWithAuthor,
    nextCursor,
    hasNextPage,
  };
}

/**
 * usePosts - Infinite query hook for feed with cursor pagination
 *
 * Features:
 * - Cursor-based pagination for stable infinite scroll
 * - Posts loaded with author info via JOIN
 * - Like status batch checked per page
 */
export function usePosts() {
  return useInfiniteQuery<
    FeedPage,
    Error,
    InfiniteData<FeedPage>,
    ReturnType<typeof postQueryKeys.lists>,
    FeedCursor | undefined
  >({
    queryKey: postQueryKeys.lists(),
    queryFn: ({ pageParam }) => fetchPostsPage(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    initialPageParam: undefined,
  });
}

/**
 * Fetches a single post by ID with author information
 */
async function fetchPost(id: number): Promise<PostWithAuthor> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post, error } = await supabase
    .from('posts')
    .select(
      `
      id,
      author_id,
      content,
      media_urls,
      like_count,
      comment_count,
      is_pinned,
      is_hidden,
      created_at,
      updated_at,
      author:profiles!author_id(
        id,
        full_name,
        avatar_url,
        company_name
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch post: ${error.message}`);
  }

  // Check if user liked and bookmarked this post
  let isLiked = false;
  let isBookmarked = false;
  if (user) {
    const [likeResult, bookmarkResult] = await Promise.all([
      supabase
        .from('likes')
        .select('id')
        .eq('likeable_type', 'post')
        .eq('likeable_id', id)
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('bookmarks')
        .select('id')
        .eq('bookmarkable_type', 'post')
        .eq('bookmarkable_id', id)
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);

    isLiked = !!likeResult.data;
    isBookmarked = !!bookmarkResult.data;
  }

  return {
    id: post.id,
    author_id: post.author_id,
    content: post.content,
    media_urls: post.media_urls || [],
    like_count: post.like_count,
    comment_count: post.comment_count,
    is_pinned: post.is_pinned,
    is_hidden: post.is_hidden,
    created_at: post.created_at,
    updated_at: post.updated_at,
    author: post.author as Author,
    is_liked: isLiked,
    is_bookmarked: isBookmarked,
  };
}

/**
 * usePost - Query hook for a single post
 *
 * @param id - The post ID to fetch
 */
export function usePost(id: number) {
  return useQuery({
    queryKey: postQueryKeys.detail(id),
    queryFn: () => fetchPost(id),
    enabled: !!id,
  });
}

// ============================================================================
// COMMENTS QUERIES
// ============================================================================

/**
 * Fetches comments for a post, organized with nested replies
 */
async function fetchComments(postId: number): Promise<CommentWithAuthor[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rawComments, error } = await supabase
    .from('comments')
    .select(
      `
      id,
      post_id,
      author_id,
      parent_id,
      content,
      like_count,
      is_hidden,
      created_at,
      updated_at,
      author:profiles!author_id(
        id,
        full_name,
        avatar_url,
        company_name
      )
    `
    )
    .eq('post_id', postId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch comments: ${error.message}`);
  }

  const comments = rawComments || [];

  // Batch check like status for all comments
  let likedCommentIds = new Set<number>();
  if (user && comments.length > 0) {
    const commentIds = comments.map((c) => c.id);
    const { data: userLikes } = await supabase
      .from('likes')
      .select('likeable_id')
      .eq('likeable_type', 'comment')
      .eq('user_id', user.id)
      .in('likeable_id', commentIds);

    likedCommentIds = new Set(userLikes?.map((l) => l.likeable_id) || []);
  }

  // Transform comments with like status
  const commentsWithAuthor: CommentWithAuthor[] = comments.map((comment) => ({
    id: comment.id,
    post_id: comment.post_id,
    author_id: comment.author_id,
    parent_id: comment.parent_id,
    content: comment.content,
    like_count: comment.like_count,
    is_hidden: comment.is_hidden,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    author: comment.author as Author,
    is_liked: likedCommentIds.has(comment.id),
  }));

  // Organize into nested structure (top-level comments with replies)
  const commentMap = new Map<number, CommentWithAuthor>();
  const topLevelComments: CommentWithAuthor[] = [];

  // First pass: index all comments
  commentsWithAuthor.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: organize into tree structure
  commentsWithAuthor.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id)!;
    if (comment.parent_id === null) {
      topLevelComments.push(commentWithReplies);
    } else {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(commentWithReplies);
      }
    }
  });

  return topLevelComments;
}

/**
 * useComments - Query hook for comments on a post
 *
 * @param postId - The post ID to fetch comments for
 */
export function useComments(postId: number) {
  return useQuery({
    queryKey: commentQueryKeys.list(postId),
    queryFn: () => fetchComments(postId),
    enabled: !!postId,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * useCreatePost - Mutation hook for creating a new post
 *
 * Features:
 * - Invalidates feed cache on success
 * - Returns the newly created post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePostInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to create a post');
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: input.content,
          media_urls: input.media_urls || [],
        })
        .select(
          `
          id,
          author_id,
          content,
          media_urls,
          like_count,
          comment_count,
          is_pinned,
          is_hidden,
          created_at,
          updated_at,
          author:profiles!author_id(
            id,
            full_name,
            avatar_url,
            company_name
          )
        `
        )
        .single();

      if (error) {
        throw new Error(`Failed to create post: ${error.message}`);
      }

      return {
        ...data,
        author: data.author as Author,
        is_liked: false,
        is_bookmarked: false,
        media_urls: data.media_urls || [],
      } as PostWithAuthor;
    },
    onSuccess: () => {
      // Invalidate and refetch posts list
      queryClient.invalidateQueries({ queryKey: postQueryKeys.lists() });
    },
  });
}

/**
 * useCreateComment - Mutation hook for creating a comment
 *
 * Features:
 * - Invalidates comments cache for the post
 * - Updates post comment_count optimistically
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCommentInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to comment');
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: input.post_id,
          author_id: user.id,
          content: input.content,
          parent_id: input.parent_id || null,
        })
        .select(
          `
          id,
          post_id,
          author_id,
          parent_id,
          content,
          like_count,
          is_hidden,
          created_at,
          updated_at,
          author:profiles!author_id(
            id,
            full_name,
            avatar_url,
            company_name
          )
        `
        )
        .single();

      if (error) {
        throw new Error(`Failed to create comment: ${error.message}`);
      }

      return {
        ...data,
        author: data.author as Author,
        is_liked: false,
      } as CommentWithAuthor;
    },
    onSuccess: (newComment) => {
      // Invalidate comments for this post
      queryClient.invalidateQueries({
        queryKey: commentQueryKeys.list(newComment.post_id),
      });

      // Also invalidate post detail to update comment count
      queryClient.invalidateQueries({
        queryKey: postQueryKeys.detail(newComment.post_id),
      });

      // Invalidate posts list to update comment counts
      queryClient.invalidateQueries({ queryKey: postQueryKeys.lists() });
    },
  });
}

/**
 * useLikeMutation - Mutation hook for liking/unliking posts and comments
 *
 * Features:
 * - Optimistic updates for immediate UI feedback
 * - Automatic rollback on error
 * - Handles both like and unlike actions
 */
export function useLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      likeable_type,
      likeable_id,
      isCurrentlyLiked,
    }: LikeInput & { isCurrentlyLiked: boolean }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to like');
      }

      if (isCurrentlyLiked) {
        // Unlike: delete the like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('likeable_type', likeable_type)
          .eq('likeable_id', likeable_id);

        if (error) {
          throw new Error(`Failed to unlike: ${error.message}`);
        }

        return { action: 'unliked' as const, likeable_type, likeable_id };
      } else {
        // Like: insert a new like
        const { error } = await supabase.from('likes').insert({
          user_id: user.id,
          likeable_type,
          likeable_id,
        });

        if (error) {
          throw new Error(`Failed to like: ${error.message}`);
        }

        return { action: 'liked' as const, likeable_type, likeable_id };
      }
    },
    onMutate: async ({ likeable_type, likeable_id, isCurrentlyLiked }) => {
      // Cancel any outgoing refetches
      if (likeable_type === 'post') {
        await queryClient.cancelQueries({ queryKey: postQueryKeys.lists() });
        await queryClient.cancelQueries({
          queryKey: postQueryKeys.detail(likeable_id),
        });
      }

      // Snapshot previous values
      const previousPosts = queryClient.getQueryData<InfiniteData<FeedPage>>(
        postQueryKeys.lists()
      );
      const previousPost = queryClient.getQueryData<PostWithAuthor>(
        postQueryKeys.detail(likeable_id)
      );

      // Optimistically update posts feed
      if (likeable_type === 'post') {
        queryClient.setQueryData<InfiniteData<FeedPage>>(
          postQueryKeys.lists(),
          (old) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                posts: page.posts.map((post) =>
                  post.id === likeable_id
                    ? {
                        ...post,
                        is_liked: !isCurrentlyLiked,
                        like_count: isCurrentlyLiked
                          ? Math.max(0, post.like_count - 1)
                          : post.like_count + 1,
                      }
                    : post
                ),
              })),
            };
          }
        );

        // Optimistically update single post if cached
        queryClient.setQueryData<PostWithAuthor>(
          postQueryKeys.detail(likeable_id),
          (old) => {
            if (!old) return old;

            return {
              ...old,
              is_liked: !isCurrentlyLiked,
              like_count: isCurrentlyLiked
                ? Math.max(0, old.like_count - 1)
                : old.like_count + 1,
            };
          }
        );
      }

      // Return context with snapshot for rollback
      return { previousPosts, previousPost };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(postQueryKeys.lists(), context.previousPosts);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(
          postQueryKeys.detail(variables.likeable_id),
          context.previousPost
        );
      }
    },
    onSettled: (data) => {
      // Refetch to ensure consistency
      if (data?.likeable_type === 'post') {
        queryClient.invalidateQueries({ queryKey: postQueryKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: postQueryKeys.detail(data.likeable_id),
        });
      } else if (data?.likeable_type === 'comment') {
        // For comments, we need to know the post_id, but we can invalidate all comment lists
        queryClient.invalidateQueries({ queryKey: commentQueryKeys.all });
      }
    },
  });
}

/**
 * useDeletePost - Mutation hook for deleting a post
 *
 * Features:
 * - Invalidates feed cache on success
 * - Only allows deleting own posts (RLS enforced)
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to delete a post');
      }

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) {
        throw new Error(`Failed to delete post: ${error.message}`);
      }

      return { postId };
    },
    onSuccess: () => {
      // Invalidate posts list
      queryClient.invalidateQueries({ queryKey: postQueryKeys.lists() });
    },
  });
}

/**
 * useDeleteComment - Mutation hook for deleting a comment
 *
 * Features:
 * - Invalidates comments cache for the post
 * - Updates post comment_count
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      postId,
    }: {
      commentId: number;
      postId: number;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to delete a comment');
      }

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id);

      if (error) {
        throw new Error(`Failed to delete comment: ${error.message}`);
      }

      return { commentId, postId };
    },
    onSuccess: (data) => {
      // Invalidate comments for this post
      queryClient.invalidateQueries({
        queryKey: commentQueryKeys.list(data.postId),
      });

      // Also invalidate post detail to update comment count
      queryClient.invalidateQueries({
        queryKey: postQueryKeys.detail(data.postId),
      });

      // Invalidate posts list to update comment counts
      queryClient.invalidateQueries({ queryKey: postQueryKeys.lists() });
    },
  });
}

/**
 * useBookmarkMutation - Mutation hook for bookmarking/unbookmarking posts
 *
 * Features:
 * - Optimistic updates for immediate UI feedback
 * - Automatic rollback on error
 * - Invalidates profile bookmark queries
 */
export function useBookmarkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      isCurrentlyBookmarked,
    }: {
      postId: number;
      isCurrentlyBookmarked: boolean;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to bookmark');
      }

      if (isCurrentlyBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('bookmarkable_type', 'post')
          .eq('bookmarkable_id', postId);

        if (error) {
          throw new Error(`Failed to remove bookmark: ${error.message}`);
        }

        return { action: 'unbookmarked' as const, postId, userId: user.id };
      } else {
        const { error } = await supabase.from('bookmarks').insert({
          user_id: user.id,
          bookmarkable_type: 'post',
          bookmarkable_id: postId,
        });

        if (error) {
          throw new Error(`Failed to bookmark: ${error.message}`);
        }

        return { action: 'bookmarked' as const, postId, userId: user.id };
      }
    },
    onMutate: async ({ postId, isCurrentlyBookmarked }) => {
      await queryClient.cancelQueries({ queryKey: postQueryKeys.lists() });
      await queryClient.cancelQueries({
        queryKey: postQueryKeys.detail(postId),
      });

      const previousPosts = queryClient.getQueryData<InfiniteData<FeedPage>>(
        postQueryKeys.lists()
      );
      const previousPost = queryClient.getQueryData<PostWithAuthor>(
        postQueryKeys.detail(postId)
      );

      // Optimistically update posts feed
      queryClient.setQueryData<InfiniteData<FeedPage>>(
        postQueryKeys.lists(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) =>
                post.id === postId
                  ? { ...post, is_bookmarked: !isCurrentlyBookmarked }
                  : post
              ),
            })),
          };
        }
      );

      // Optimistically update single post if cached
      queryClient.setQueryData<PostWithAuthor>(
        postQueryKeys.detail(postId),
        (old) => {
          if (!old) return old;
          return { ...old, is_bookmarked: !isCurrentlyBookmarked };
        }
      );

      return { previousPosts, previousPost };
    },
    onError: (_err, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(postQueryKeys.lists(), context.previousPosts);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(
          postQueryKeys.detail(variables.postId),
          context.previousPost
        );
      }
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: postQueryKeys.lists() });
      if (data) {
        queryClient.invalidateQueries({
          queryKey: postQueryKeys.detail(data.postId),
        });
        // Invalidate profile bookmarks cache
        queryClient.invalidateQueries({
          queryKey: ['profile', 'bookmarks', data.userId],
        });
        queryClient.invalidateQueries({
          queryKey: ['profile', 'activity', data.userId],
        });
      }
    },
  });
}
