'use client'

import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { FadeIn } from '@/app/components/ui/FadeIn'
import { Sparkles, Bed, Search, CalendarX, Palmtree } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Suggestion {
  label: string
  prompt: string
}

const SUGGESTION_ICONS: Record<string, React.ReactNode> = {
  'Book a room': <Bed className="w-5 h-5 text-[#c9b99a]" />,
  'Show available rooms': <Search className="w-5 h-5 text-[#c9b99a]" />,
  'Cancel my booking': <CalendarX className="w-5 h-5 text-[#c9b99a]" />,
  'Resort amenities': <Palmtree className="w-5 h-5 text-[#c9b99a]" />,
}

const SUGGESTION_SUBTITLES: Record<string, string> = {
  'Book a room': 'Reserve your perfect suite',
  'Show available rooms': 'Browse luxury options',
  'Cancel my booking': 'Modify your current stay',
  'Resort amenities': 'Explore pool, spa & dining',
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
    <div className="relative flex flex-col items-center justify-center min-h-full w-full px-4 py-8 sm:px-6 sm:py-10 gap-8 overflow-hidden">
      
      {/* Animated Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            y: [0, -25, 0],
            x: [0, 15, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-[#c9b99a]/30 blur-[1px]"
        />
        <motion.div
          animate={{
            y: [0, -35, 0],
            x: [0, -20, 0],
            opacity: [0.1, 0.4, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-1/3 right-1/4 w-3.5 h-3.5 rounded-full bg-[#c9b99a]/20 blur-[2px]"
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [0.15, 0.35, 0.15]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-[#c9b99a]/25 blur-[0.5px]"
        />
      </div>

      {/* Greeting Header */}
      <FadeIn direction="down" className="text-center z-10 w-full max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#242424] border border-[#c9b99a]/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(201,185,154,0.15)] shimmer-border"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#c9b99a]/5 to-[#c9b99a]/20 pointer-events-none"
          />
          <Sparkles className="w-8 h-8 text-[#c9b99a] animate-pulse" />
        </motion.div>

        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          <span className="text-gradient-gold">Your Luxury Stay Awaits</span>
        </h1>
        <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
          Welcome to our elite concierge. I can assist you with seamless room bookings, availability updates, and resort experiences.
        </p>
      </FadeIn>

      {/* Chip grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-lg z-10"
        role="list"
        aria-label="Suggested actions"
      >
        {suggestions.map((s) => (
          <motion.button
            key={s.prompt}
            variants={staggerItem}
            onClick={() => onSelect(s.prompt)}
            role="listitem"
            whileHover={{ y: -2, borderColor: 'rgba(201, 185, 154, 0.35)' }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'group relative flex items-center gap-4 p-4 min-h-[72px] h-full text-left w-full overflow-hidden',
              'bg-surface/80 backdrop-blur-2xl border border-border/80 rounded-xl transition-all duration-300',
              'hover:shadow-[0_12px_30px_rgba(201,185,154,0.08)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b99a]/50 cursor-pointer'
            )}
          >
            {/* Subtle noise texture overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.015] mix-blend-overlay z-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
              }}
            />

            {/* Content wrapped in relative div to be above noise */}
            <div className="relative z-10 flex items-center gap-4 w-full">
              {/* Icon Container */}
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] border border-border group-hover:border-[#c9b99a]/35 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                {SUGGESTION_ICONS[s.label] ?? <Sparkles className="w-5 h-5 text-[#c9b99a]" />}
              </div>
              
              {/* Text content */}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-text-primary group-hover:text-[#c9b99a] transition-colors duration-200">
                  {s.label}
                </span>
                <span className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                  {SUGGESTION_SUBTITLES[s.label] ?? 'Ask our automated assistant'}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
