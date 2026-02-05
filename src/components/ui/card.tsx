'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

/**
 * Card Component - The Potential Design System
 *
 * Design tokens from ui-ux-plan.md:
 * - Border Radius: 24px (rounded-3xl) for cards
 * - Background: #121212 (card), #1C1C1E (card-secondary)
 * - Border: rgba(255, 255, 255, 0.08)
 * - Glow effects for highlighted cards
 */
const cardVariants = cva(
  // Base - 24px border radius (rounded-3xl) with smooth transitions
  'rounded-3xl border transition-all duration-200',
  {
    variants: {
      variant: {
        // Default - Standard card background
        default: 'bg-[#121212] border-white/[0.08]',
        // Elevated - Secondary background with shadow
        elevated:
          'bg-[#1C1C1E] border-white/[0.05] shadow-lg shadow-black/20',
        // Gradient - Primary gradient background
        gradient:
          'bg-gradient-to-br from-[#0079FF]/10 to-transparent border-[#0079FF]/20',
        // Interactive - Hover effects for clickable cards
        interactive:
          'bg-[#121212] border-white/[0.08] hover:border-[#0079FF]/40 hover:scale-[1.02] cursor-pointer',
        // Glow - Primary color glow shadow
        glow: 'bg-[#121212] border-[#0079FF]/40 shadow-[0_0_12px_rgba(0,121,255,0.3)]',
        // Ghost - Transparent background
        ghost: 'bg-transparent border-transparent',
      },
      padding: {
        none: '',
        sm: 'p-5',
        md: 'p-6',
        lg: 'p-8 md:p-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      data-variant={variant}
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-header"
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    data-slot="card-title"
    className={cn('text-2xl font-bold leading-tight text-white', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="card-description"
    className={cn('text-base text-[#8B95A1]', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} data-slot="card-content" className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-footer"
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
};
