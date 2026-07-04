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
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

const variantClasses: Record<PremiumButtonVariant, string> = {
  primary:
    'bg-linear-to-r from-[#B93C3C] to-[#9E2B2B] text-white font-medium shadow-sm ' +
    'hover:bg-[#a02f2f] hover:shadow-[0_4px_16px_rgba(185,60,60,0.3)] ' +
    'disabled:bg-[rgba(185,60,60,0.2)] disabled:text-[rgba(150,60,60,0.4)] disabled:shadow-none transition-all duration-200',
  secondary:
    'bg-transparent border border-[#B93C3C]/40 text-[#B93C3C] ' +
    'hover:bg-[#B93C3C]/10 hover:border-[#B93C3C]/70 ' +
    'disabled:border-gray-300 disabled:text-gray-400',
  ghost:
    'bg-transparent text-[rgba(80,40,40,0.7)] ' +
    'hover:bg-[rgba(185,60,60,0.08)] hover:text-[#2A1A1A] ' +
    'disabled:text-gray-400',
  danger:
    'bg-transparent border border-[#B93C3C]/40 text-[#B93C3C] ' +
    'hover:bg-[#B93C3C]/10 hover:border-[#B93C3C]/70 ' +
    'disabled:border-gray-300 disabled:text-gray-400',
}

const sizeClasses: Record<PremiumButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
}

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
          'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B93C3C]/50',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'min-h-10',
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
