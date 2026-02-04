"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

// Icons - importing from lucide-react (tree-shaking handled by optimizePackageImports in next.config)
import {
  Inbox,
  Search,
  Users,
  FileText,
  MessageCircle,
  Bookmark,
  Bell,
  Calendar,
  Folder,
  type LucideIcon,
} from "lucide-react";

/**
 * Empty State Component
 *
 * Displays friendly empty state messages with:
 * - Illustration or icon
 * - Localized message in current locale
 * - Action suggestion/button
 *
 * Uses useTranslations from next-intl for i18n support.
 */

// Pre-defined icon variants for common empty states
const emptyStateIcons: Record<string, LucideIcon> = {
  search: Search,
  posts: MessageCircle,
  experts: Users,
  programs: Calendar,
  comments: MessageCircle,
  bookmarks: Bookmark,
  notifications: Bell,
  files: FileText,
  folder: Folder,
  default: Inbox,
};

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center py-12 px-6",
  {
    variants: {
      size: {
        sm: "py-8 px-4",
        md: "py-12 px-6",
        lg: "py-16 px-8",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  /**
   * The icon to display. Can be a string key for pre-defined icons
   * or a custom LucideIcon component.
   */
  icon?: keyof typeof emptyStateIcons | LucideIcon;

  /**
   * The main title/message to display.
   * If not provided, will use a default message based on type.
   */
  title?: string;

  /**
   * Optional description text below the title.
   */
  description?: string;

  /**
   * Type of empty state - used to auto-select icon and default messages.
   */
  type?: "search" | "posts" | "experts" | "programs" | "comments" | "bookmarks" | "notifications" | "files" | "default";

  /**
   * Optional action button configuration.
   */
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };

  /**
   * Optional secondary action button configuration.
   */
  secondaryAction?: {
    label: string;
    onClick?: () => void;
  };

  /**
   * Whether to show a border around the component.
   */
  bordered?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  type = "default",
  action,
  secondaryAction,
  size,
  bordered = false,
  className,
  ...props
}: EmptyStateProps) {
  const t = useTranslations("common");

  // Determine the icon to use
  const IconComponent = React.useMemo(() => {
    if (typeof icon === "string") {
      return emptyStateIcons[icon] || emptyStateIcons.default;
    }
    if (icon) {
      return icon;
    }
    return emptyStateIcons[type] || emptyStateIcons.default;
  }, [icon, type]);

  // Default titles based on type
  const defaultTitles: Record<string, string> = {
    search: t("noResults"),
    posts: t("emptyList"),
    experts: t("noResults"),
    programs: t("emptyList"),
    comments: t("emptyList"),
    bookmarks: t("emptyList"),
    notifications: t("noData"),
    files: t("emptyList"),
    default: t("noData"),
  };

  const displayTitle = title || defaultTitles[type] || defaultTitles.default;

  return (
    <div
      className={cn(
        emptyStateVariants({ size }),
        bordered && "rounded-3xl border border-white/8 bg-card",
        className
      )}
      {...props}
    >
      {/* Icon Container */}
      <div className="relative mb-4">
        {/* Glow effect behind icon */}
        <div className="absolute inset-0 blur-xl bg-primary/10 rounded-full" />
        <div className="relative p-4 rounded-full bg-card-secondary border border-white/8">
          <IconComponent className="h-10 w-10 text-muted" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-2">
        {displayTitle}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          {action && (
            <Button
              variant="primary"
              onClick={action.onClick}
              asChild={!!action.href}
            >
              {action.href ? (
                <a href={action.href}>{action.label}</a>
              ) : (
                action.label
              )}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Pre-configured Empty State Variants
// ============================================

/**
 * Empty state for search results
 */
export function EmptySearchState({
  searchTerm,
  onClear,
  className,
}: {
  searchTerm?: string;
  onClear?: () => void;
  className?: string;
}) {
  const t = useTranslations("common");

  return (
    <EmptyState
      type="search"
      title={t("noResults")}
      description={
        searchTerm
          ? `No results found for "${searchTerm}". Try different keywords or filters.`
          : "Try different keywords or filters."
      }
      action={
        onClear
          ? {
              label: t("reset"),
              onClick: onClear,
            }
          : undefined
      }
      className={className}
    />
  );
}

/**
 * Empty state for posts/thread feed
 */
export function EmptyPostsState({
  onCreatePost,
  className,
}: {
  onCreatePost?: () => void;
  className?: string;
}) {
  const t = useTranslations("thread");

  return (
    <EmptyState
      type="posts"
      title={t("empty")}
      action={
        onCreatePost
          ? {
              label: t("compose.submit"),
              onClick: onCreatePost,
            }
          : undefined
      }
      className={className}
    />
  );
}

/**
 * Empty state for experts list
 */
export function EmptyExpertsState({
  onResetFilters,
  className,
}: {
  onResetFilters?: () => void;
  className?: string;
}) {
  const t = useTranslations("experts");

  return (
    <EmptyState
      type="experts"
      title={t("empty")}
      description={t("emptyDescription")}
      action={
        onResetFilters
          ? {
              label: t("filters.reset"),
              onClick: onResetFilters,
            }
          : undefined
      }
      className={className}
    />
  );
}

/**
 * Empty state for support programs
 */
export function EmptyProgramsState({
  className,
}: {
  className?: string;
}) {
  const t = useTranslations("supportPrograms");

  return (
    <EmptyState
      type="programs"
      title={t("empty")}
      description={t("emptyDescription")}
      className={className}
    />
  );
}

/**
 * Empty state for comments
 */
export function EmptyCommentsState({
  className,
}: {
  className?: string;
}) {
  const t = useTranslations("thread.comments");

  return (
    <EmptyState
      type="comments"
      title={t("empty")}
      size="sm"
      className={className}
    />
  );
}

/**
 * Empty state for bookmarks
 */
export function EmptyBookmarksState({
  className,
}: {
  className?: string;
}) {
  const t = useTranslations("supportPrograms.bookmarks");

  return (
    <EmptyState
      type="bookmarks"
      title={t("empty")}
      className={className}
    />
  );
}

/**
 * Empty state for notifications
 */
export function EmptyNotificationsState({
  className,
}: {
  className?: string;
}) {
  const t = useTranslations("notifications");

  return (
    <EmptyState
      type="notifications"
      title={t("empty")}
      size="sm"
      className={className}
    />
  );
}

/**
 * Empty state for clubs
 */
export function EmptyClubsState({
  onCreateClub,
  className,
}: {
  onCreateClub?: () => void;
  className?: string;
}) {
  const t = useTranslations("clubs");

  return (
    <EmptyState
      type="default"
      icon={Users}
      title={t("empty")}
      description={t("emptyDescription")}
      action={
        onCreateClub
          ? {
              label: t("create"),
              onClick: onCreateClub,
            }
          : undefined
      }
      className={className}
    />
  );
}

export default EmptyState;
