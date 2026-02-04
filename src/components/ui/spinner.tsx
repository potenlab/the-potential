"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Spinner Component
 *
 * Loading spinner with The Potential's design system:
 * - Sizes: sm (16px), md (24px), lg (32px)
 * - Uses primary color by default
 * - Smooth rotation animation
 */

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      sm: "h-4 w-4", // 16px
      md: "h-6 w-6", // 24px
      lg: "h-8 w-8", // 32px
    },
    variant: {
      default: "text-primary",
      white: "text-white",
      muted: "text-muted",
      currentColor: "text-current",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export interface SpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {
  /** Accessible label for screen readers */
  label?: string;
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, variant, label = "Loading", ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        role="status"
        aria-label={label}
        className={cn(spinnerVariants({ size, variant, className }))}
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
        <span className="sr-only">{label}</span>
      </svg>
    );
  }
);

Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };
