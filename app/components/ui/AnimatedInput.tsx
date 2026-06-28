'use client'

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  /** Extra wrapper class */
  wrapperClassName?: string
}

/**
 * Styled input with icon slots, accent focus ring, and error state with shake animation.
 */
const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, leftIcon, rightIcon, className, wrapperClassName, id, ...props }, ref) => {
    const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, '-')}`

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-text-secondary tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            'relative flex items-center',
            'bg-input border rounded-lg transition-all duration-200',
            error
              ? 'border-danger/70 animate-shake'
              : 'border-border hover:border-border/80 focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(201,185,154,0.15)]'
          )}
        >
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none grid place-items-center">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-transparent outline-none text-text-primary placeholder:text-text-tertiary',
              'text-base py-3',
              leftIcon ? 'pl-10' : 'pl-3',
              rightIcon ? 'pr-10' : 'pr-3',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none grid place-items-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-danger mt-0.5"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

AnimatedInput.displayName = 'AnimatedInput'

export { AnimatedInput }
export type { AnimatedInputProps }
