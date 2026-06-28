'use client'

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  wrapperClassName?: string
}

const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, leftIcon, rightIcon, className, wrapperClassName, id, ...props }, ref) => {
    const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, '-')}`

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-medium text-[rgba(80,40,40,0.65)] tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            'relative flex items-center',
            'bg-[rgba(255,255,255,0.8)] border rounded-lg transition-all duration-200',
            error
              ? 'border-[#B93C3C] animate-shake'
              : 'border-[rgba(185,60,60,0.2)] hover:border-[rgba(185,60,60,0.35)] focus-within:border-[#B93C3C] focus-within:shadow-[0_0_0_3px_rgba(185,60,60,0.1)]'
          )}
        >
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(150,60,60,0.55)] pointer-events-none grid place-items-center">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-transparent outline-none text-[#2A1A1A] placeholder:text-[rgba(150,60,60,0.45)]',
              'text-sm py-2.5',
              leftIcon ? 'pl-9' : 'pl-3',
              rightIcon ? 'pr-9' : 'pr-3',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(150,60,60,0.55)] pointer-events-none grid place-items-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-[#B93C3C] mt-0.5"
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
