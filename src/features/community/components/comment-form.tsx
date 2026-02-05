'use client';

/**
 * Comment Form Component
 *
 * A form for submitting new comments or replies to a post.
 * Features:
 * - Expandable textarea
 * - Character count
 * - Submit on Ctrl+Enter
 * - Loading state
 * - Uses translations from useTranslations('thread.comments')
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { SendHorizontal } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export interface CommentFormProps {
  /** Post ID to comment on */
  postId: number;
  /** Parent comment ID for replies (optional) */
  parentId?: number | null;
  /** Name of the user being replied to (for display) */
  replyToName?: string;
  /** Current user's avatar URL */
  userAvatarUrl?: string | null;
  /** Current user's name */
  userName?: string | null;
  /** Callback when form is submitted */
  onSubmit: (content: string, parentId?: number | null) => void;
  /** Whether submission is in progress */
  isSubmitting?: boolean;
  /** Callback to cancel reply mode */
  onCancelReply?: () => void;
  /** Whether this is a reply form (smaller/compact) */
  isReply?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const MAX_COMMENT_LENGTH = 2000;

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
 * Comment Form Component
 */
export function CommentForm({
  postId: _postId,
  parentId = null,
  replyToName,
  userAvatarUrl,
  userName,
  onSubmit,
  isSubmitting = false,
  onCancelReply,
  isReply = false,
  className,
}: CommentFormProps) {
  const t = useTranslations('thread.comments');
  const [content, setContent] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-focus when in reply mode
  React.useEffect(() => {
    if (isReply && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isReply]);

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    onSubmit(content.trim(), parentId);
    setContent('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (content.trim() && !isSubmitting) {
        onSubmit(content.trim(), parentId);
        setContent('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    }
  };

  const canSubmit = content.trim().length > 0 && content.length <= MAX_COMMENT_LENGTH;
  const placeholder = replyToName
    ? t('replyPlaceholder')
    : t('placeholder');

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex gap-3',
        isReply && 'pl-12',
        className
      )}
    >
      {/* User Avatar */}
      <Avatar size={isReply ? 'sm' : 'md'} className="shrink-0">
        {userAvatarUrl && (
          <AvatarImage src={userAvatarUrl} alt={userName || 'User avatar'} />
        )}
        <AvatarFallback>{getInitials(userName ?? null)}</AvatarFallback>
      </Avatar>

      {/* Input Area */}
      <div className="flex-1 space-y-2">
        {/* Reply indicator */}
        {replyToName && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <span>{t('replyTo', { name: replyToName })}</span>
            {onCancelReply && (
              <button
                type="button"
                onClick={onCancelReply}
                className="text-primary hover:underline"
              >
                {t('cancelReply')}
              </button>
            )}
          </div>
        )}

        {/* Textarea and Submit */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isSubmitting}
              rows={1}
              maxLength={MAX_COMMENT_LENGTH}
              className={cn(
                'w-full resize-none overflow-hidden rounded-2xl bg-card border border-white/8 px-4 py-3',
                'text-white placeholder:text-muted',
                'transition-colors duration-200',
                'hover:border-white/20 focus:border-primary focus:outline-none focus:ring-0',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isReply ? 'min-h-[40px] text-sm' : 'min-h-[48px] text-base'
              )}
              aria-label={placeholder}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="icon-sm"
            disabled={!canSubmit || isSubmitting}
            loading={isSubmitting}
            className="shrink-0 rounded-full"
            aria-label={t('submit')}
          >
            {!isSubmitting && <SendHorizontal className="h-4 w-4" />}
          </Button>
        </div>

        {/* Character count (show when approaching limit) */}
        {content.length > MAX_COMMENT_LENGTH * 0.8 && (
          <p
            className={cn(
              'text-xs text-right',
              content.length > MAX_COMMENT_LENGTH ? 'text-error' : 'text-muted'
            )}
          >
            {content.length}/{MAX_COMMENT_LENGTH}
          </p>
        )}
      </div>
    </form>
  );
}

export default CommentForm;
