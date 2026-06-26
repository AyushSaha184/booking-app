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
    'bg-surface/80 backdrop-blur-2xl border border-[#c9b99a]/15 rounded-xl',
  elevated:
    'bg-surface-elevated/90 backdrop-blur-2xl border border-[#c9b99a]/20 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.3)]',
  interactive:
    'bg-surface/80 backdrop-blur-2xl border border-[#c9b99a]/15 rounded-xl cursor-pointer ' +
    'hover:-translate-y-0.5 hover:border-[#c9b99a]/35 hover:shadow-[0_12px_30px_rgba(201,185,154,0.08)] ' +
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
        {/* Subtle noise texture overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.015] mix-blend-overlay z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />

        {topHighlight && (
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#c9b99a] to-transparent opacity-80 z-10"
          />
        )}
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </motion.div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

export { GlassCard }
export type { GlassCardProps, GlassCardVariant }
