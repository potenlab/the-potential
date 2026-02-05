"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/cn"

const avatarSizeVariants = cva(
  "relative flex shrink-0 rounded-full select-none",
  {
    variants: {
      size: {
        xs: "size-6",    // 24px
        sm: "size-8",    // 32px
        md: "size-12",   // 48px
        lg: "size-16",   // 64px
        xl: "size-24",   // 96px
        "2xl": "size-32", // 128px
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const statusIndicatorVariants = cva(
  "absolute z-10 rounded-full ring-2 ring-background",
  {
    variants: {
      size: {
        xs: "size-1.5 right-0 bottom-0",
        sm: "size-2 right-0 bottom-0",
        md: "size-2.5 right-0.5 bottom-0.5",
        lg: "size-3 right-1 bottom-1",
        xl: "size-4 right-1.5 bottom-1.5",
        "2xl": "size-5 right-2 bottom-2",
      },
      statusColor: {
        success: "bg-emerald-500",
        warning: "bg-orange-500",
        error: "bg-error",
        muted: "bg-muted",
      },
    },
    defaultVariants: {
      size: "md",
      statusColor: "success",
    },
  }
)

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarSizeVariants> {
  showStatus?: boolean
  statusColor?: "success" | "warning" | "error" | "muted"
}

const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, showStatus = false, statusColor = "success", children, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    data-slot="avatar"
    data-size={size}
    className={cn(avatarSizeVariants({ size }), "group/avatar", className)}
    {...props}
  >
    {children}
    {showStatus && (
      <span
        data-slot="avatar-status"
        className={cn(statusIndicatorVariants({ size, statusColor }))}
        aria-hidden="true"
      />
    )}
  </AvatarPrimitive.Root>
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const avatarImageVariants = cva("aspect-square size-full object-cover overflow-hidden rounded-full")

const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    data-slot="avatar-image"
    className={cn(avatarImageVariants(), className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const avatarFallbackVariants = cva(
  "flex size-full items-center justify-center rounded-full overflow-hidden bg-card text-muted font-medium",
  {
    variants: {
      size: {
        xs: "text-[10px]",
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
        xl: "text-xl",
        "2xl": "text-2xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
}

const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, size, ...props }, ref) => {
  // Get size from parent avatar via data attribute or use the provided size prop
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      data-slot="avatar-fallback"
      className={cn(
        avatarFallbackVariants({ size }),
        // Support inheriting size from parent Avatar via group data attribute
        !size && [
          "group-data-[size=xs]/avatar:text-[10px]",
          "group-data-[size=sm]/avatar:text-xs",
          "group-data-[size=md]/avatar:text-sm",
          "group-data-[size=lg]/avatar:text-base",
          "group-data-[size=xl]/avatar:text-xl",
          "group-data-[size=2xl]/avatar:text-2xl",
        ],
        className
      )}
      {...props}
    />
  )
})
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// Additional utility components for groups

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "*:data-[slot=avatar]:ring-background group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "bg-card text-muted ring-background relative flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-medium ring-2",
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  avatarSizeVariants,
  statusIndicatorVariants,
}
