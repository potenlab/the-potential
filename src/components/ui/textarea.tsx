"use client"

import * as React from "react"

import { cn } from "@/lib/cn"
import { Label } from "@/components/ui/label"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => {
    const generatedId = React.useId()
    const textareaId = id || generatedId
    const hasError = !!error

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={textareaId} className="text-sm font-semibold text-white">
            {label}
          </Label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          data-slot="textarea"
          className={cn(
            // Base styles - min 120px height, rounded-2xl (16px radius)
            "flex w-full min-h-[120px] rounded-2xl bg-card px-4 py-3 text-base text-white placeholder:text-muted",
            "transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-card/50",
            // Resize behavior
            "resize-y",
            // Border color based on state
            hasError
              ? "border border-error bg-error/5"
              : "border border-white/8 hover:border-white/20 focus:border-primary",
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${textareaId}-error`
              : helperText
                ? `${textareaId}-helper`
                : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="text-sm font-medium text-error">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="text-sm text-muted">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
