'use client'

import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

type GlassCardVariant = 'default' | 'elevated' | 'interactive'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: GlassCardVariant
  topHighlight?: boolean
  children: React.ReactNode
}

const variantClasses: Record<GlassCardVariant, string> = {
  default:
    'bg-[rgba(255,255,255,0.65)] backdrop-blur-md border border-[rgba(185,60,60,0.15)] rounded-xl shadow-xs',
  elevated:
    'bg-[rgba(255,255,255,0.85)] backdrop-blur-md border border-[rgba(185,60,60,0.2)] rounded-xl shadow-md',
  interactive:
    'bg-[rgba(255,255,255,0.6)] backdrop-blur-md border border-[rgba(185,60,60,0.12)] rounded-[10px] cursor-pointer ' +
    'hover:bg-[rgba(185,60,60,0.05)] hover:border-[rgba(185,60,60,0.25)] ' +
    'active:scale-[0.98] transition-all duration-200 ease-out',
}

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
            className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-[#B93C3C] to-transparent opacity-70 z-10"
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
