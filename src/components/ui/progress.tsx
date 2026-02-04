"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "@/lib/cn";

/**
 * Progress Component Wrapper
 *
 * Customized progress bar with The Potential's design system:
 * - Uses primary color (Electric Blue)
 * - Dark theme background
 * - Smooth transition animations
 * - Size variants
 */

const progressVariants = cva(
  // Base styles
  "relative w-full overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
      variant: {
        default: "bg-white/10",
        muted: "bg-card-secondary",
        card: "bg-card",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

const indicatorVariants = cva(
  // Base indicator styles
  "h-full w-full flex-1 transition-all duration-300 ease-out",
  {
    variants: {
      indicatorColor: {
        primary: "bg-primary",
        success: "bg-success",
        warning: "bg-warning",
        error: "bg-error",
        info: "bg-info",
        gradient: "bg-gradient-to-r from-primary to-primary-light",
      },
      glow: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        indicatorColor: "primary",
        glow: true,
        className: "shadow-[0_0_10px_rgba(0,121,255,0.5)]",
      },
      {
        indicatorColor: "success",
        glow: true,
        className: "shadow-[0_0_10px_rgba(52,211,153,0.5)]",
      },
      {
        indicatorColor: "warning",
        glow: true,
        className: "shadow-[0_0_10px_rgba(251,146,60,0.5)]",
      },
      {
        indicatorColor: "error",
        glow: true,
        className: "shadow-[0_0_10px_rgba(255,69,58,0.5)]",
      },
      {
        indicatorColor: "info",
        glow: true,
        className: "shadow-[0_0_10px_rgba(34,211,238,0.5)]",
      },
      {
        indicatorColor: "gradient",
        glow: true,
        className: "shadow-[0_0_10px_rgba(0,229,255,0.5)]",
      },
    ],
    defaultVariants: {
      indicatorColor: "primary",
      glow: false,
    },
  }
);

export interface ProgressProps
  extends Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "value">,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof indicatorVariants> {
  value?: number;
  /** Show percentage label */
  showLabel?: boolean;
  /** Label position */
  labelPosition?: "inside" | "outside";
  /** Animated/indeterminate mode */
  indeterminate?: boolean;
}

function Progress({
  className,
  value = 0,
  size,
  variant,
  indicatorColor,
  glow,
  showLabel,
  labelPosition = "outside",
  indeterminate = false,
  ...props
}: ProgressProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", showLabel && "space-y-1.5")}>
      {showLabel && labelPosition === "outside" && (
        <div className="flex justify-between text-xs font-medium">
          <span className="text-muted">Progress</span>
          <span className="text-white">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(progressVariants({ size, variant, className }))}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(
            indicatorVariants({ indicatorColor, glow }),
            // Rounded end on the right side
            "rounded-full",
            // Indeterminate animation
            indeterminate && "animate-[indeterminate_1.5s_ease-in-out_infinite]"
          )}
          style={{
            transform: indeterminate
              ? undefined
              : `translateX(-${100 - clampedValue}%)`,
          }}
        >
          {showLabel && labelPosition === "inside" && size === "xl" && (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
              {Math.round(clampedValue)}%
            </span>
          )}
        </ProgressPrimitive.Indicator>
      </ProgressPrimitive.Root>
    </div>
  );
}

export { Progress, progressVariants, indicatorVariants };
