"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/cn";

/**
 * Tabs Component Wrapper
 *
 * Customized tabs with The Potential's design system:
 * - Animated active indicator
 * - Dark theme styling
 * - Support for horizontal and vertical orientations
 */

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-4",
        "data-[orientation=horizontal]:flex-col",
        "data-[orientation=vertical]:flex-row",
        className
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  // Base styles
  "inline-flex items-center justify-start gap-1 text-muted group/tabs-list",
  {
    variants: {
      variant: {
        default: [
          "bg-card/50 backdrop-blur-sm",
          "rounded-2xl p-1.5",
          "border border-white/5",
        ],
        line: [
          "bg-transparent",
          "border-b border-white/10",
          "pb-px",
          "gap-0",
        ],
        pills: [
          "bg-transparent",
          "gap-2",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        tabsListVariants({ variant }),
        // Orientation-specific styles
        "group-data-[orientation=horizontal]/tabs:w-fit",
        "group-data-[orientation=vertical]/tabs:flex-col group-data-[orientation=vertical]/tabs:h-fit",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Base styles
        "relative inline-flex items-center justify-center gap-2",
        "px-4 py-2.5",
        "text-sm font-medium",
        "whitespace-nowrap",
        "transition-all duration-200",
        // Border radius
        "rounded-xl",
        // Colors - inactive state
        "text-muted",
        "hover:text-white hover:bg-white/5",
        // Active state with animated indicator
        "data-[state=active]:text-white",
        // Default variant active state (background)
        "group-data-[variant=default]/tabs-list:data-[state=active]:bg-primary/10",
        "group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm",
        // Line variant active state (bottom border)
        "group-data-[variant=line]/tabs-list:rounded-none",
        "group-data-[variant=line]/tabs-list:px-4 group-data-[variant=line]/tabs-list:pb-3",
        "group-data-[variant=line]/tabs-list:data-[state=active]:text-primary",
        // Animated underline for line variant
        "group-data-[variant=line]/tabs-list:after:absolute",
        "group-data-[variant=line]/tabs-list:after:bottom-0",
        "group-data-[variant=line]/tabs-list:after:left-0",
        "group-data-[variant=line]/tabs-list:after:right-0",
        "group-data-[variant=line]/tabs-list:after:h-0.5",
        "group-data-[variant=line]/tabs-list:after:bg-primary",
        "group-data-[variant=line]/tabs-list:after:scale-x-0",
        "group-data-[variant=line]/tabs-list:after:transition-transform",
        "group-data-[variant=line]/tabs-list:after:duration-200",
        "group-data-[variant=line]/tabs-list:data-[state=active]:after:scale-x-100",
        // Pills variant active state
        "group-data-[variant=pills]/tabs-list:data-[state=active]:bg-primary",
        "group-data-[variant=pills]/tabs-list:data-[state=active]:text-white",
        "group-data-[variant=pills]/tabs-list:data-[state=active]:shadow-[0_0_20px_rgba(0,121,255,0.4)]",
        // Focus state
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // Disabled state
        "disabled:pointer-events-none disabled:opacity-50",
        // Orientation-specific
        "group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start",
        // SVG styling
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        // Base styles
        "flex-1 outline-none",
        // Focus state
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // Animation on mount
        "data-[state=active]:animate-in",
        "data-[state=active]:fade-in-0",
        "data-[state=active]:slide-in-from-bottom-2",
        "data-[state=inactive]:animate-out",
        "data-[state=inactive]:fade-out-0",
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
