'use client'

import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type PremiumButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type PremiumButtonSize = 'sm' | 'md' | 'lg'

interface PremiumButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: PremiumButtonVariant
  size?: PremiumButtonSize
  isLoading?: boolean
  /** Icon rendered before label text */
  leftIcon?: React.ReactNode
  /** Icon rendered after label text */
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

const variantClasses: Record<PremiumButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-[#c9b99a] via-[#f5efe6] to-[#b8a488] bg-[length:200%_auto] bg-left text-[#0f0f0f] font-bold ' +
    'hover:bg-right hover:shadow-[0_0_22px_rgba(201,185,154,0.45)] ' +
    'disabled:from-surface-elevated disabled:to-surface-elevated disabled:text-text-tertiary disabled:shadow-none transition-all duration-500',
  secondary:
    'bg-transparent border border-accent/40 text-accent ' +
    'hover:bg-accent/10 hover:border-accent/70 hover:shadow-[0_0_16px_rgba(201,185,154,0.2)] ' +
    'disabled:border-border disabled:text-text-tertiary',
  ghost:
    'bg-transparent text-text-secondary ' +
    'hover:bg-surface-elevated hover:text-text-primary ' +
    'disabled:text-text-tertiary',
  danger:
    'bg-transparent border border-danger/40 text-danger ' +
    'hover:bg-danger/10 hover:border-danger/70 ' +
    'disabled:border-border disabled:text-text-tertiary',
}

const sizeClasses: Record<PremiumButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-13 px-6 text-base gap-2.5 rounded-xl',
}

/**
 * Premium button with gradient, glow effects, loading state and press animation.
 *
 * @example
 * <PremiumButton variant="primary" isLoading={submitting}>
 *   Confirm booking
 * </PremiumButton>
 */
const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        whileTap={isDisabled ? {} : { scale: 0.96 }}
        whileHover={isDisabled ? {} : { scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'min-h-11', // touch target
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </motion.button>
    )
  }
)

PremiumButton.displayName = 'PremiumButton'

export { PremiumButton }
export type { PremiumButtonProps, PremiumButtonVariant, PremiumButtonSize }
