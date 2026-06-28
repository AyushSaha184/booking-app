'use client'

import { motion } from 'framer-motion'

interface Suggestion {
  label: string
  prompt: string
}

const CARD_ICONS: Record<string, React.ReactNode> = {
  'Book a room': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="w-5 h-5 text-[#B93C3C]">
      <rect x="1" y="6" width="14" height="9" rx="1.5"/>
      <path d="M4 6V4.5a4 4 0 018 0V6"/>
      <path d="M6 10h4"/>
    </svg>
  ),
  'Show available rooms': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="w-5 h-5 text-[#B93C3C]">
      <circle cx="7" cy="7" r="5"/>
      <path d="M12 12l2.5 2.5"/>
    </svg>
  ),
  'Cancel my booking': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="w-5 h-5 text-[#B93C3C]">
      <rect x="2" y="2" width="12" height="12" rx="1.5"/>
      <path d="M5 7h6M5 10h4M5 4h6"/>
    </svg>
  ),
  'Resort amenities': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="w-5 h-5 text-[#B93C3C]">
      <circle cx="8" cy="6" r="4"/>
      <path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5"/>
      <path d="M11 9.5l1 1.5M13 8l1.5.5"/>
    </svg>
  ),
}

const CARD_SUBTITLES: Record<string, string> = {
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
 * Empty-state landing screen with enlarged, smooth luxury action buttons.
 */
export default function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      className="flex-1 w-full h-full my-auto flex flex-col items-center justify-center px-6 py-8 relative z-10"
    >
      <div className="flex flex-col items-center w-full max-w-[600px]">
        
        {/* Luxury Star Badge */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          className="relative w-16 h-16 rounded-full bg-[#B93C3C]/10 border border-[#B93C3C]/25 flex items-center justify-center mb-6 shadow-xs"
        >
          <div className="absolute -inset-2 rounded-full border border-[#B93C3C]/10 pointer-events-none" />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-6 h-6 text-[#B93C3C]">
            <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"/>
            <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/>
            <path d="M5 15l.6 1.4L7 17l-1.4.6L5 19l-.6-1.4L3 17l1.4-.6L5 15z"/>
          </svg>
        </motion.div>

        {/* Vertical Rule Line */}
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#B93C3C]/40 to-transparent mb-5" />

        {/* Headline */}
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.25, 1, 0.5, 1] }}
          className="font-serif text-3xl sm:text-4xl font-medium text-[#2A1A1A] text-center tracking-tight leading-tight mb-3"
        >
          Your Luxury Stay <em className="italic text-[#B93C3C]">Awaits</em>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.14, ease: [0.25, 1, 0.5, 1] }}
          className="text-sm sm:text-base text-[#2A1A1A]/65 text-center leading-relaxed max-w-[420px] font-light mb-10"
        >
          Welcome to our elite concierge. I can assist you with seamless room bookings, availability updates, and resort experiences.
        </motion.p>

        {/* Horizontal Divider */}
        <div className="w-full max-w-[440px] h-px bg-gradient-to-r from-transparent via-[#B93C3C]/25 to-transparent mb-8" />

        {/* 2-Column Action Cards Grid (Enlarged Buttons) */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-[560px]"
          role="list"
        >
          {suggestions.map((s) => (
            <motion.button
              key={s.prompt}
              onClick={() => onSelect(s.prompt)}
              role="listitem"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="group relative flex items-center gap-4 px-5 py-4 bg-white/80 backdrop-blur-md border border-[#B93C3C]/20 rounded-2xl text-left w-full cursor-pointer shadow-xs hover:shadow-md hover:bg-white hover:border-[#B93C3C]/35 transition-colors duration-200 overflow-hidden"
            >
              {/* Hover Red Accent Line on Left */}
              <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-transparent transition-colors duration-200 group-hover:bg-[#B93C3C]" />

              {/* Icon Container */}
              <div className="w-11 h-11 rounded-xl bg-[#B93C3C]/8 border border-[#B93C3C]/20 flex items-center justify-center shrink-0 group-hover:bg-[#B93C3C]/12 transition-colors duration-200">
                {CARD_ICONS[s.label] ?? CARD_ICONS['Book a room']}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-base font-semibold text-[#2A1A1A] tracking-wide truncate group-hover:text-[#B93C3C] transition-colors duration-200">
                  {s.label}
                </div>
                <div className="text-xs text-[#2A1A1A]/60 mt-0.5 font-light truncate">
                  {CARD_SUBTITLES[s.label] ?? 'Explore options'}
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

      </div>
    </motion.div>
  )
}
