import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/cn"

const badgeVariants = cva(
  // Base styles - pill shape (rounded-full)
  "inline-flex items-center justify-center rounded-full border font-medium whitespace-nowrap shrink-0 [&>svg]:pointer-events-none transition-colors duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        // Default - primary blue
        default:
          "bg-primary/10 text-primary border-primary/20 [a&]:hover:bg-primary/20",
        // Success - emerald green
        success:
          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 [a&]:hover:bg-emerald-500/20",
        // Warning - orange
        warning:
          "bg-orange-500/10 text-orange-400 border-orange-500/20 [a&]:hover:bg-orange-500/20",
        // Error - red
        error:
          "bg-error/10 text-error border-error/20 [a&]:hover:bg-error/20",
        // Info - cyan
        info:
          "bg-info/10 text-info border-info/20 [a&]:hover:bg-info/20",
        // Muted - gray
        muted:
          "bg-white/5 text-muted border-white/10 [a&]:hover:bg-white/10",
        // Outline - transparent with border
        outline:
          "bg-transparent text-white border-white/20 [a&]:hover:bg-white/5 [a&]:hover:border-white/30",
      },
      size: {
        sm: "h-5 px-2 text-xs gap-1 [&>svg]:size-3",
        md: "h-6 px-2.5 text-xs gap-1.5 [&>svg]:size-3.5",
        lg: "h-7 px-3 text-sm gap-1.5 [&>svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
