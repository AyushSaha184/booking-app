'use client'

import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

type GlassCardVariant = 'default' | 'elevated' | 'interactive'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: GlassCardVariant
  /** Show a decorative gradient line at the top of the card */
  topHighlight?: boolean
  children: React.ReactNode
}

const variantClasses: Record<GlassCardVariant, string> = {
  default:
    'bg-surface/70 backdrop-blur-xl border border-accent/10 rounded-xl',
  elevated:
    'bg-surface-elevated/80 backdrop-blur-xl border border-accent/15 rounded-xl shadow-lg shadow-black/30',
  interactive:
    'bg-surface/70 backdrop-blur-xl border border-accent/10 rounded-xl cursor-pointer ' +
    'hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10 ' +
    'active:scale-[0.99] transition-all duration-300 ease-out',
}

/**
 * Glassmorphism card with three visual variants.
 *
 * @example
 * <GlassCard variant="interactive" topHighlight>
 *   <p>Content</p>
 * </GlassCard>
 */
const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = 'default', topHighlight = false, className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn('relative overflow-hidden', variantClasses[variant], className)}
        {...props}
      >
        {topHighlight && (
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
          />
        )}
        {children}
      </motion.div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

export { GlassCard }
export type { GlassCardProps, GlassCardVariant }
