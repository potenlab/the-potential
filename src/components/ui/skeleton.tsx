"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

/**
 * Skeleton Component
 *
 * Loading skeleton with The Potential's design system:
 * - Shimmer animation
 * - Dark theme colors
 * - Multiple shape variants
 */

const skeletonVariants = cva(
  // Base styles with shimmer animation
  [
    "relative overflow-hidden",
    // Shimmer animation using CSS gradient
    "before:absolute before:inset-0",
    "before:translate-x-[-100%]",
    "before:animate-[shimmer_1.5s_infinite]",
    "before:bg-gradient-to-r",
    "before:from-transparent before:via-white/10 before:to-transparent",
  ],
  {
    variants: {
      variant: {
        default: "bg-card-secondary",
        darker: "bg-card",
        lighter: "bg-white/5",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        "3xl": "rounded-3xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      rounded: "md",
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({
  className,
  variant,
  rounded,
  ...props
}: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant, rounded, className }))}
      {...props}
    />
  );
}

// Pre-styled skeleton variants for common use cases
function SkeletonText({
  className,
  lines = 1,
  ...props
}: SkeletonProps & { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            // Last line is shorter for natural text appearance
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full",
            className
          )}
          rounded="md"
          {...props}
        />
      ))}
    </div>
  );
}

function SkeletonAvatar({
  className,
  size = "md",
  ...props
}: SkeletonProps & { size?: "sm" | "md" | "lg" | "xl" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  return (
    <Skeleton
      className={cn(sizeClasses[size], className)}
      rounded="full"
      {...props}
    />
  );
}

function SkeletonCard({
  className,
  ...props
}: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-40 w-full", className)}
      rounded="3xl"
      {...props}
    />
  );
}

function SkeletonButton({
  className,
  size = "md",
  ...props
}: SkeletonProps & { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-20",
    md: "h-10 w-24",
    lg: "h-12 w-32",
  };

  return (
    <Skeleton
      className={cn(sizeClasses[size], className)}
      rounded="2xl"
      {...props}
    />
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonButton,
  skeletonVariants,
};
