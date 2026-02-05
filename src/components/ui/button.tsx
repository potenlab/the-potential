'use client';

import * as React from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { Spinner } from '@/components/ui/spinner';

/**
 * Button Component - The Potential Design System
 *
 * Design tokens from ui-ux-plan.md:
 * - Primary: #0079FF (Electric Blue)
 * - Primary Light: #00E5FF (Cyan for CTAs)
 * - Border Radius: 16px (rounded-2xl) for buttons
 * - Glow effects for primary-glow variant
 * - Heights: 32px (sm), 40px (md), 48px (lg), 56px (xl)
 */
const buttonVariants = cva(
  // Base styles - Toss-style with smooth transitions
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Primary - Electric Blue (#0079FF)
        primary:
          'bg-[#0079FF] text-white hover:bg-[#0079FF]/90',
        // Primary Glow - Cyan (#00E5FF)
        'primary-glow':
          'bg-[#00E5FF] text-black font-bold hover:bg-[#00E5FF]/85',
        // Secondary - Outline with primary color
        secondary:
          'border border-[#0079FF]/30 text-[#0079FF] bg-transparent hover:bg-[#0079FF]/10 hover:border-[#0079FF]/50',
        // Outline - White border
        outline:
          'border border-white/10 text-white bg-transparent hover:bg-white/5 hover:border-white/20',
        // Ghost - No background
        ghost: 'text-[#8B95A1] hover:text-white hover:bg-white/5',
        // Destructive - Error color
        destructive: 'bg-[#FF453A] text-white hover:bg-[#FF453A]/90',
        // Link style
        link: 'text-[#0079FF] underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-10 px-5 text-base rounded-xl', // 40px height
        md: 'h-12 px-8 text-lg rounded-2xl', // 48px height
        lg: 'h-14 px-10 text-xl rounded-2xl', // 56px height
        xl: 'h-16 px-12 text-2xl rounded-2xl', // 64px height
        icon: 'h-12 w-12 rounded-2xl',
        'icon-sm': 'h-10 w-10 rounded-xl',
        'icon-lg': 'h-14 w-14 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as a Slot for composition with other elements */
  asChild?: boolean;
  /** Show loading spinner and disable button */
  loading?: boolean;
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side */
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot.Root
          data-slot="button"
          data-variant={variant}
          data-size={size}
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot.Root>
      );
    }

    return (
      <button
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Spinner size="sm" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
