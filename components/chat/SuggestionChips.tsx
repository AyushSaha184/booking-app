'use client'

import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { GlassCard } from '@/app/components/ui/GlassCard'
import { FadeIn } from '@/app/components/ui/FadeIn'

interface Suggestion {
  label: string
  prompt: string
}

const SUGGESTION_ICONS: Record<string, string> = {
  'Book a room': '🛏️',
  'Show available rooms': '🔍',
  'Cancel my booking': '✕',
  'Resort amenities': '🌊',
}

interface SuggestionChipsProps {
  suggestions: Suggestion[]
  onSelect: (prompt: string) => void
}

/**
 * Empty-state screen shown before first message.
 * Has animated greeting, resort icon, and suggestion chip grid.
 */
export default function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-10 gap-8">

      {/* Greeting */}
      <FadeIn direction="down" className="text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-16 h-16 rounded-2xl bg-accent-muted border border-accent/25 flex items-center justify-center text-3xl mx-auto mb-4 shadow-[0_0_24px_rgba(201,185,154,0.15)]"
          aria-hidden="true"
        >
          🏨
        </motion.div>

        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Welcome
        </h2>
        <p className="text-sm text-text-secondary max-w-xs leading-relaxed">
          I can help you book a room, check availability, or manage an existing reservation.
        </p>
      </FadeIn>

      {/* Chip grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-2.5 w-full max-w-sm"
        role="list"
        aria-label="Suggested actions"
      >
        {suggestions.map((s) => (
          <motion.button
            key={s.prompt}
            variants={staggerItem}
            onClick={() => onSelect(s.prompt)}
            role="listitem"
            className={[
              'group flex flex-col gap-1.5 p-3.5 text-left',
              'bg-surface/80 backdrop-blur-sm',
              'border border-border hover:border-accent/40',
              'rounded-xl transition-all duration-200',
              'hover:bg-surface-elevated hover:shadow-[0_0_16px_rgba(201,185,154,0.12)]',
              'active:scale-[0.97]',
              'min-h-[52px]',          // 44px touch target
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
            ].join(' ')}
          >
            <span className="text-base leading-none" aria-hidden="true">
              {SUGGESTION_ICONS[s.label] ?? '💬'}
            </span>
            <span className="text-sm text-text-primary font-medium leading-snug">
              {s.label}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
