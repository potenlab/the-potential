'use client';

/**
 * Comment List Component
 *
 * Displays a list of comments with nested replies for a post.
 * Features:
 * - Chronological display of comments
 * - Nested replies with indentation
 * - Like button with count on each comment
 * - Reply button to show inline reply form
 * - Uses translations from useTranslations('thread.comments')
 */

import * as React from 'react';
import { useTranslations, useFormatter, useNow } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { cn } from '@/lib/cn';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { CommentForm } from './comment-form';
import type { CommentWithAuthor } from '../types';

export interface CommentListProps {
  /** Array of comments (top-level, with nested replies) */
  comments: CommentWithAuthor[];
  /** Post ID these comments belong to */
  postId: number;
  /** Current user info for the comment form */
  currentUser?: {
    avatarUrl?: string | null;
    name?: string | null;
  };
  /** Callback when like button is clicked */
  onLike?: (commentId: number, isCurrentlyLiked: boolean) => void;
  /** Callback when a new comment is submitted */
  onSubmitComment?: (content: string, parentId?: number | null) => void;
  /** Callback when delete is clicked */
  onDelete?: (commentId: number) => void;
  /** ID of comment currently being liked (for loading state) */
  likingCommentId?: number | null;
  /** Whether comment submission is in progress */
  isSubmitting?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Gets the initials from a full name for avatar fallback
 */
function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Single Comment Item Component
 */
interface CommentItemProps {
  comment: CommentWithAuthor;
  postId: number;
  currentUser?: {
    avatarUrl?: string | null;
    name?: string | null;
  };
  onLike?: (commentId: number, isCurrentlyLiked: boolean) => void;
  onSubmitReply?: (content: string, parentId: number) => void;
  onDelete?: (commentId: number) => void;
  likingCommentId?: number | null;
  isSubmitting?: boolean;
  depth?: number;
}

function CommentItem({
  comment,
  postId,
  currentUser,
  onLike,
  onSubmitReply,
  onDelete,
  likingCommentId,
  isSubmitting,
  depth = 0,
}: CommentItemProps) {
  const t = useTranslations('thread.comments');
  const format = useFormatter();
  const now = useNow({ updateInterval: 1000 * 60 }); // Update every minute
  const [showReplyForm, setShowReplyForm] = React.useState(false);
  const [showReplies, setShowReplies] = React.useState(true);

  const formattedTime = React.useMemo(() => {
    const date = new Date(comment.created_at);
    return format.relativeTime(date, now);
  }, [comment.created_at, format, now]);

  const hasReplies = comment.replies && comment.replies.length > 0;
  const replyCount = comment.replies?.length || 0;

  const handleLike = () => {
    onLike?.(comment.id, comment.is_liked);
  };

  const handleReplySubmit = (content: string) => {
    onSubmitReply?.(content, comment.id);
    setShowReplyForm(false);
  };

  // Maximum nesting depth (2 levels)
  const maxDepth = 2;
  const canNest = depth < maxDepth;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group',
        depth > 0 && 'pl-12 border-l border-white/[0.05] ml-6'
      )}
    >
      <div className="flex gap-3 py-3">
        {/* Avatar */}
        <Avatar size="sm" className="shrink-0">
          {comment.author.avatar_url && (
            <AvatarImage
              src={comment.author.avatar_url}
              alt={comment.author.full_name || 'User avatar'}
            />
          )}
          <AvatarFallback>{getInitials(comment.author.full_name)}</AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header: Name and time */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-white truncate">
              {comment.author.full_name || 'Unknown User'}
            </span>
            {comment.author.company_name && (
              <>
                <span className="text-white/20">|</span>
                <span className="text-muted truncate">
                  {comment.author.company_name}
                </span>
              </>
            )}
            <span className="text-muted">
              <time dateTime={comment.created_at}>{formattedTime}</time>
            </span>
          </div>

          {/* Comment content */}
          <p className="mt-1 text-white text-sm leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            {/* Like button */}
            <button
              onClick={handleLike}
              disabled={likingCommentId === comment.id}
              className={cn(
                'flex items-center gap-1 text-xs transition-colors',
                comment.is_liked
                  ? 'text-error'
                  : 'text-muted hover:text-white'
              )}
              aria-label={comment.is_liked ? t('liked') : t('like')}
            >
              <Heart
                className={cn(
                  'h-3.5 w-3.5',
                  comment.is_liked && 'fill-current'
                )}
              />
              {comment.like_count > 0 && (
                <span className="tabular-nums">{comment.like_count}</span>
              )}
            </button>

            {/* Reply button */}
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-xs text-muted hover:text-white transition-colors"
              aria-label={t('reply')}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{t('reply')}</span>
            </button>

            {/* More options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="text-muted hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => onDelete?.(comment.id)}
                  className="text-error"
                >
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Reply form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 overflow-hidden"
              >
                <CommentForm
                  postId={postId}
                  parentId={comment.id}
                  replyToName={comment.author.full_name || undefined}
                  userAvatarUrl={currentUser?.avatarUrl}
                  userName={currentUser?.name}
                  onSubmit={handleReplySubmit}
                  isSubmitting={isSubmitting}
                  onCancelReply={() => setShowReplyForm(false)}
                  isReply
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nested Replies */}
      {hasReplies && canNest && (
        <div className="mt-1">
          {/* Toggle replies button */}
          {replyCount > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 mb-2 ml-12"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  <span>{t('hideReplies')}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  <span>{t('viewReplies', { count: replyCount })}</span>
                </>
              )}
            </button>
          )}

          {/* Replies list */}
          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {comment.replies?.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    postId={postId}
                    currentUser={currentUser}
                    onLike={onLike}
                    onSubmitReply={onSubmitReply}
                    onDelete={onDelete}
                    likingCommentId={likingCommentId}
                    isSubmitting={isSubmitting}
                    depth={depth + 1}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Comment List Component
 */
export function CommentList({
  comments,
  postId,
  currentUser,
  onLike,
  onSubmitComment,
  onDelete,
  likingCommentId,
  isSubmitting,
  className,
}: CommentListProps) {
  const t = useTranslations('thread.comments');

  const handleSubmitTopLevelComment = (content: string, parentId?: number | null) => {
    onSubmitComment?.(content, parentId);
  };

  const handleSubmitReply = (content: string, parentId: number) => {
    onSubmitComment?.(content, parentId);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Comment Form */}
      <div className="border-b border-white/[0.08] pb-4">
        <h3 className="text-base font-semibold text-white mb-4">{t('title')}</h3>
        <CommentForm
          postId={postId}
          userAvatarUrl={currentUser?.avatarUrl}
          userName={currentUser?.name}
          onSubmit={handleSubmitTopLevelComment}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Comments List */}
      <div className="space-y-1">
        {comments.length === 0 ? (
          <p className="text-center text-muted py-8">{t('empty')}</p>
        ) : (
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                currentUser={currentUser}
                onLike={onLike}
                onSubmitReply={handleSubmitReply}
                onDelete={onDelete}
                likingCommentId={likingCommentId}
                isSubmitting={isSubmitting}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default CommentList;
