'use client';

/**
 * Profile API Queries
 *
 * TanStack Query hooks for user activity stats, posts, comments,
 * likes, and bookmarks on the profile/my-page.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { Author, PostWithAuthor } from '@/features/community/types';

// ============================================================================
// TYPES
// ============================================================================

export interface UserActivityStats {
  postCount: number;
  commentCount: number;
  likeCount: number;
  bookmarkCount: number;
}

export interface UserComment {
  id: number;
  post_id: number;
  content: string;
  like_count: number;
  created_at: string;
  post_content: string;
  post_author_name: string | null;
}

export interface BookmarkedProgram {
  id: number;
  bookmarkable_id: number;
  created_at: string;
  program: {
    id: number;
    title: string;
    organization: string;
    category: string;
    status: string;
    application_deadline: string | null;
    image_url: string | null;
  };
}

export interface BookmarkedExpert {
  id: number;
  bookmarkable_id: number;
  created_at: string;
  expert: {
    id: string;
    user_id: string;
    business_name: string;
    category: string;
    specialty: string[];
    bio: string | null;
    profile: {
      full_name: string | null;
      avatar_url: string | null;
      company_name: string | null;
    } | null;
  };
}

export interface BookmarkedPost {
  id: number;
  bookmarkable_id: number;
  created_at: string;
  post: PostWithAuthor | null;
}

export interface LikedItem {
  id: number;
  likeable_type: 'post' | 'comment';
  likeable_id: number;
  created_at: string;
}

export interface LikedPost extends LikedItem {
  likeable_type: 'post';
  post: {
    id: number;
    content: string;
    like_count: number;
    comment_count: number;
    created_at: string;
    author: Author;
  } | null;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export interface ReceivedCollaborationRequest {
  id: number;
  sender_id: string;
  type: 'coffee_chat' | 'collaboration';
  subject: string;
  message: string;
  contact_info: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  response_message: string | null;
  created_at: string;
  sender: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    company_name: string | null;
  };
}

export const profileQueryKeys = {
  all: ['profile'] as const,
  activity: (userId: string) => [...profileQueryKeys.all, 'activity', userId] as const,
  posts: (userId: string) => [...profileQueryKeys.all, 'posts', userId] as const,
  comments: (userId: string) => [...profileQueryKeys.all, 'comments', userId] as const,
  likes: (userId: string) => [...profileQueryKeys.all, 'likes', userId] as const,
  bookmarks: (userId: string) => [...profileQueryKeys.all, 'bookmarks', userId] as const,
  collaborations: (userId: string) => [...profileQueryKeys.all, 'collaborations', userId] as const,
} as const;

// ============================================================================
// ACTIVITY STATS
// ============================================================================

/**
 * Fetches user activity stats (counts of posts, comments, likes, bookmarks)
 */
async function fetchUserActivity(userId: string): Promise<UserActivityStats> {
  // Fetch counts in parallel
  const [postsResult, commentsResult, likesResult, bookmarksResult] = await Promise.all([
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', userId)
      .eq('is_hidden', false),
    supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', userId)
      .eq('is_hidden', false),
    supabase
      .from('likes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('bookmarks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);

  return {
    postCount: postsResult.count ?? 0,
    commentCount: commentsResult.count ?? 0,
    likeCount: likesResult.count ?? 0,
    bookmarkCount: bookmarksResult.count ?? 0,
  };
}

/**
 * useUserActivity - Query hook for user activity stats
 */
export function useUserActivity(userId: string | undefined) {
  return useQuery({
    queryKey: profileQueryKeys.activity(userId ?? ''),
    queryFn: () => fetchUserActivity(userId!),
    enabled: !!userId,
  });
}

// ============================================================================
// USER POSTS
// ============================================================================

/**
 * Fetches user's posts with author info
 */
async function fetchUserPosts(userId: string): Promise<PostWithAuthor[]> {
  const { data: rawPosts, error } = await supabase
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
    .eq('author_id', userId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to fetch user posts: ${error.message}`);
  }

  // Check which posts the user has liked and bookmarked
  const postIds = (rawPosts || []).map((p) => p.id);
  let likedPostIds = new Set<number>();
  let bookmarkedPostIds = new Set<number>();
  if (postIds.length > 0) {
    const [likesResult, bookmarksResult] = await Promise.all([
      supabase
        .from('likes')
        .select('likeable_id')
        .eq('likeable_type', 'post')
        .eq('user_id', userId)
        .in('likeable_id', postIds),
      supabase
        .from('bookmarks')
        .select('bookmarkable_id')
        .eq('bookmarkable_type', 'post')
        .eq('user_id', userId)
        .in('bookmarkable_id', postIds),
    ]);
    likedPostIds = new Set(likesResult.data?.map((l) => l.likeable_id) || []);
    bookmarkedPostIds = new Set(bookmarksResult.data?.map((b) => b.bookmarkable_id) || []);
  }

  return (rawPosts || []).map((post) => ({
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
}

/**
 * useUserPosts - Query hook for user's posts
 */
export function useUserPosts(userId: string | undefined) {
  return useQuery({
    queryKey: profileQueryKeys.posts(userId ?? ''),
    queryFn: () => fetchUserPosts(userId!),
    enabled: !!userId,
  });
}

// ============================================================================
// USER COMMENTS
// ============================================================================

/**
 * Fetches user's comments with associated post info
 */
async function fetchUserComments(userId: string): Promise<UserComment[]> {
  const { data: rawComments, error } = await supabase
    .from('comments')
    .select(
      `
      id,
      post_id,
      content,
      like_count,
      created_at,
      post:posts!post_id(
        content,
        author:profiles!author_id(
          full_name
        )
      )
    `
    )
    .eq('author_id', userId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to fetch user comments: ${error.message}`);
  }

  return (rawComments || []).map((comment) => {
    const post = comment.post as unknown as {
      content: string;
      author: { full_name: string | null };
    } | null;

    return {
      id: comment.id,
      post_id: comment.post_id,
      content: comment.content,
      like_count: comment.like_count,
      created_at: comment.created_at,
      post_content: post?.content ?? '',
      post_author_name: post?.author?.full_name ?? null,
    };
  });
}

/**
 * useUserComments - Query hook for user's comments
 */
export function useUserComments(userId: string | undefined) {
  return useQuery({
    queryKey: profileQueryKeys.comments(userId ?? ''),
    queryFn: () => fetchUserComments(userId!),
    enabled: !!userId,
  });
}

// ============================================================================
// USER LIKES
// ============================================================================

/**
 * Fetches user's liked posts
 */
async function fetchUserLikes(userId: string): Promise<LikedPost[]> {
  // Fetch liked post IDs
  const { data: likes, error: likesError } = await supabase
    .from('likes')
    .select('id, likeable_type, likeable_id, created_at')
    .eq('user_id', userId)
    .eq('likeable_type', 'post')
    .order('created_at', { ascending: false })
    .limit(50);

  if (likesError) {
    throw new Error(`Failed to fetch user likes: ${likesError.message}`);
  }

  if (!likes || likes.length === 0) return [];

  const postIds = likes.map((l) => l.likeable_id);

  // Fetch the actual posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select(
      `
      id,
      content,
      like_count,
      comment_count,
      created_at,
      author:profiles!author_id(
        id,
        full_name,
        avatar_url,
        company_name
      )
    `
    )
    .in('id', postIds)
    .eq('is_hidden', false);

  if (postsError) {
    throw new Error(`Failed to fetch liked posts: ${postsError.message}`);
  }

  const postMap = new Map(
    (posts || []).map((p) => [
      p.id,
      {
        id: p.id,
        content: p.content,
        like_count: p.like_count,
        comment_count: p.comment_count,
        created_at: p.created_at,
        author: p.author as Author,
      },
    ])
  );

  return likes.map((like) => ({
    id: like.id,
    likeable_type: 'post' as const,
    likeable_id: like.likeable_id,
    created_at: like.created_at,
    post: postMap.get(like.likeable_id) ?? null,
  }));
}

/**
 * useUserLikes - Query hook for user's liked posts
 */
export function useUserLikes(userId: string | undefined) {
  return useQuery({
    queryKey: profileQueryKeys.likes(userId ?? ''),
    queryFn: () => fetchUserLikes(userId!),
    enabled: !!userId,
  });
}

// ============================================================================
// USER BOOKMARKS
// ============================================================================

export interface UserBookmarks {
  programs: BookmarkedProgram[];
  posts: BookmarkedPost[];
}

/**
 * Fetches user's bookmarks grouped by type
 */
async function fetchUserBookmarks(userId: string): Promise<UserBookmarks> {
  // Fetch all bookmarks for the user
  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('id, bookmarkable_type, bookmarkable_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch bookmarks: ${error.message}`);
  }

  if (!bookmarks || bookmarks.length === 0) {
    return { programs: [], posts: [] };
  }

  // Group bookmark IDs by type
  const programIds = bookmarks
    .filter((b) => b.bookmarkable_type === 'support_program')
    .map((b) => b.bookmarkable_id);
  const postIds = bookmarks
    .filter((b) => b.bookmarkable_type === 'post')
    .map((b) => b.bookmarkable_id);

  // Fetch programs
  let programs: BookmarkedProgram[] = [];
  if (programIds.length > 0) {
    const { data: programsData } = await supabase
      .from('support_programs')
      .select('id, title, organization, category, status, application_deadline, image_url')
      .in('id', programIds);

    const programMap = new Map(
      (programsData || []).map((p) => [p.id, p])
    );

    programs = bookmarks
      .filter((b) => b.bookmarkable_type === 'support_program' && programMap.has(b.bookmarkable_id))
      .map((b) => ({
        id: b.id,
        bookmarkable_id: b.bookmarkable_id,
        created_at: b.created_at,
        program: programMap.get(b.bookmarkable_id)!,
      }));
  }

  // Fetch posts
  let postBookmarks: BookmarkedPost[] = [];
  if (postIds.length > 0) {
    const { data: postsData } = await supabase
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
      .in('id', postIds)
      .eq('is_hidden', false);

    const postMap = new Map(
      (postsData || []).map((p) => [
        p.id,
        {
          id: p.id,
          author_id: p.author_id,
          content: p.content,
          media_urls: p.media_urls || [],
          like_count: p.like_count,
          comment_count: p.comment_count,
          is_pinned: p.is_pinned,
          is_hidden: p.is_hidden,
          created_at: p.created_at,
          updated_at: p.updated_at,
          author: p.author as Author,
          is_liked: false,
          is_bookmarked: true,
        } as PostWithAuthor,
      ])
    );

    postBookmarks = bookmarks
      .filter((b) => b.bookmarkable_type === 'post')
      .map((b) => ({
        id: b.id,
        bookmarkable_id: b.bookmarkable_id,
        created_at: b.created_at,
        post: postMap.get(b.bookmarkable_id) ?? null,
      }));
  }

  return { programs, posts: postBookmarks };
}

/**
 * useUserBookmarks - Query hook for user's bookmarks
 */
export function useUserBookmarks(userId: string | undefined) {
  return useQuery({
    queryKey: profileQueryKeys.bookmarks(userId ?? ''),
    queryFn: () => fetchUserBookmarks(userId!),
    enabled: !!userId,
  });
}

// ============================================================================
// RECEIVED COLLABORATION REQUESTS (for expert profiles)
// ============================================================================

/**
 * Fetches collaboration requests received by the user, with sender profile info
 */
async function fetchReceivedCollaborationRequests(
  userId: string
): Promise<ReceivedCollaborationRequest[]> {
  const { data, error } = await supabase
    .from('collaboration_requests')
    .select(
      `
      id,
      sender_id,
      type,
      subject,
      message,
      contact_info,
      status,
      response_message,
      created_at,
      sender:profiles!sender_id(
        id,
        full_name,
        avatar_url,
        company_name
      )
    `
    )
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch collaboration requests: ${error.message}`);
  }

  return (data || []).map((item) => ({
    id: item.id,
    sender_id: item.sender_id,
    type: item.type as 'coffee_chat' | 'collaboration',
    subject: item.subject,
    message: item.message,
    contact_info: item.contact_info,
    status: item.status as 'pending' | 'accepted' | 'declined' | 'cancelled',
    response_message: item.response_message,
    created_at: item.created_at,
    sender: item.sender as unknown as ReceivedCollaborationRequest['sender'],
  }));
}

/**
 * useReceivedCollaborationRequests - Query hook for expert's received collaboration requests
 */
export function useReceivedCollaborationRequests(userId: string | undefined) {
  return useQuery({
    queryKey: profileQueryKeys.collaborations(userId ?? ''),
    queryFn: () => fetchReceivedCollaborationRequests(userId!),
    enabled: !!userId,
  });
}

// ============================================================================
// UNBOOKMARK MUTATION
// ============================================================================

/**
 * useUnbookmarkMutation - Mutation for removing a bookmark from the profile page
 */
export function useUnbookmarkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookmarkableType,
      bookmarkableId,
    }: {
      bookmarkableType: 'post' | 'expert_profile' | 'support_program';
      bookmarkableId: number;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to remove a bookmark');
      }

      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('bookmarkable_type', bookmarkableType)
        .eq('bookmarkable_id', bookmarkableId);

      if (error) {
        throw new Error(`Failed to remove bookmark: ${error.message}`);
      }

      return { bookmarkableType, bookmarkableId, userId: user.id };
    },
    onSuccess: (data) => {
      // Invalidate bookmarks and activity queries
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.bookmarks(data.userId),
      });
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.activity(data.userId),
      });
    },
  });
}
