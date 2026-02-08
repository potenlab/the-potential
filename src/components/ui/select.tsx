"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";

import { cn } from "@/lib/cn";

/**
 * Select Component Wrapper
 *
 * Customized select with The Potential's design system:
 * - Trigger: 48px height, rounded-2xl
 * - Dark theme styling
 * - Smooth animations
 */

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default" | "lg";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        // Base styles
        "flex w-full items-center justify-between gap-2",
        // Size variants - default is 48px (h-12), rounded-2xl
        "data-[size=sm]:h-10 data-[size=sm]:rounded-xl data-[size=sm]:px-3 data-[size=sm]:text-sm",
        "data-[size=default]:h-12 data-[size=default]:rounded-2xl data-[size=default]:px-4",
        "data-[size=lg]:h-14 data-[size=lg]:rounded-2xl data-[size=lg]:px-5 data-[size=lg]:text-lg",
        // Background and border - dark theme
        "bg-card border border-white/10",
        // Text
        "text-base text-white",
        "data-[placeholder]:text-muted",
        // Transitions
        "transition-all duration-200",
        // Hover state
        "hover:border-white/20",
        // Focus state
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        // Invalid/error state
        "aria-invalid:border-error aria-invalid:ring-error/20",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-card/50",
        // Shadow
        "shadow-sm",
        // SVG icon styling
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "[&_svg:not([class*='text-'])]:text-muted",
        // Select value styling
        "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-5 w-5 opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  align = "start",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          // Base styles - dark theme
          "relative z-50",
          "bg-card border border-white/10",
          // Rounded corners matching design system
          "rounded-2xl",
          // Shadow
          "shadow-xl",
          // Size constraints – let the Viewport handle scrolling
          "min-w-[8rem]",
          "origin-[--radix-select-content-transform-origin]",
          // Animations
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          // Position adjustments for popper
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1.5",
            position === "popper" &&
              "max-h-[min(var(--radix-select-content-available-height,300px),256px)] w-full min-w-[var(--radix-select-trigger-width)] overflow-y-auto"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wider",
        className
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        // Base styles
        "relative flex w-full cursor-pointer items-center gap-2",
        // Padding and sizing
        "rounded-xl py-2.5 pl-3 pr-10",
        // Text
        "text-sm text-white",
        // Focus and hover states
        "outline-none",
        "focus:bg-white/5 focus:text-white",
        "hover:bg-white/5",
        // Selected state
        "data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary",
        // Disabled state
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        // Transitions
        "transition-colors duration-150",
        // SVG styling
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "[&_svg:not([class*='text-'])]:text-muted",
        "*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-3 flex h-4 w-4 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4 text-primary" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        "pointer-events-none -mx-1 my-1 h-px bg-white/10",
        className
      )}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-2 text-muted",
        className
      )}
      {...props}
    >
      <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-2 text-muted",
        className
      )}
      {...props}
    >
      <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
