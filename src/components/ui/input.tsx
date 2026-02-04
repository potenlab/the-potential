'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';
import { Label } from '@/components/ui/label';

/**
 * Input Component - The Potential Design System
 *
 * Design tokens from ui-ux-plan.md:
 * - Height: 48px (h-12)
 * - Border Radius: 16px (rounded-2xl)
 * - Background: #121212 (card)
 * - Border: rgba(255, 255, 255, 0.08)
 * - Focus: Primary color ring (#0079FF)
 * - Error: #FF453A with error background
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message - displays in red and changes border color */
  error?: string;
  /** Icon displayed on the left side of the input */
  leftIcon?: React.ReactNode;
  /** Icon displayed on the right side of the input */
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const hasError = !!error;

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={inputId} className="text-sm font-semibold text-white">
            {label}
          </Label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8B95A1]">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            ref={ref}
            disabled={disabled}
            data-slot="input"
            className={cn(
              // Base styles - 48px height, 16px radius (rounded-2xl)
              'flex h-12 w-full rounded-2xl bg-[#121212] border px-4 text-base text-white placeholder:text-[#6B7280]',
              'transition-colors duration-200',
              // Focus state - Primary color ring
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0079FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#000000]',
              // Disabled state
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#0a0a0a]',
              // Border color based on state
              hasError
                ? 'border-[#FF453A] bg-[#FF453A]/5'
                : 'border-white/[0.08] hover:border-white/20 focus:border-[#0079FF]',
              // Icon padding
              leftIcon && 'pl-12',
              rightIcon && 'pr-12',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            {...props}
          />
          {rightIcon && (
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8B95A1]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm font-medium text-[#FF453A]"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-[#8B95A1]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
