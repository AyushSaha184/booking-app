'use client'

import { motion } from 'framer-motion'

interface Suggestion {
  label: string
  prompt: string
}

const CARD_ICONS: Record<string, React.ReactNode> = {
  'Book a room': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="w-[15px] h-[15px] text-[#B93C3C]">
      <rect x="1" y="6" width="14" height="9" rx="1.5"/>
      <path d="M4 6V4.5a4 4 0 018 0V6"/>
      <path d="M6 10h4"/>
    </svg>
  ),
  'Show available rooms': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="w-[15px] h-[15px] text-[#B93C3C]">
      <circle cx="7" cy="7" r="5"/>
      <path d="M12 12l2.5 2.5"/>
    </svg>
  ),
  'Cancel my booking': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="w-[15px] h-[15px] text-[#B93C3C]">
      <rect x="2" y="2" width="12" height="12" rx="1.5"/>
      <path d="M5 7h6M5 10h4M5 4h6"/>
    </svg>
  ),
  'Resort amenities': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="w-[15px] h-[15px] text-[#B93C3C]">
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
 * Empty-state landing screen matching luxe_concierge_cream_red.html (.lc-content).
 */
export default function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 relative z-1">
      <div className="flex flex-col items-center w-full max-w-[540px]">
        
        {/* Luxury Star Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-[56px] h-[56px] rounded-full bg-[rgba(185,60,60,0.08)] border border-[rgba(185,60,60,0.25)] flex items-center justify-center mb-6"
        >
          <div className="absolute -inset-[6px] rounded-full border border-[rgba(185,60,60,0.1)] pointer-events-none" />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="w-[22px] h-[22px] text-[#B93C3C]">
            <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"/>
            <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/>
            <path d="M5 15l.6 1.4L7 17l-1.4.6L5 19l-.6-1.4L3 17l1.4-.6L5 15z"/>
          </svg>
        </motion.div>

        {/* Vertical Rule Line */}
        <div className="w-[1px] h-[32px] bg-gradient-to-b from-transparent via-[rgba(185,60,60,0.4)] to-transparent mb-5" />

        {/* Headline */}
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="font-serif text-[32px] font-medium text-[#2A1A1A] text-center tracking-[-0.01em] leading-[1.2] mb-3"
        >
          Your Luxury Stay <em className="italic text-[#B93C3C]">Awaits</em>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-[13px] text-[rgba(80,40,40,0.55)] text-center leading-[1.7] max-w-[360px] font-light tracking-[0.01em] mb-9"
        >
          Welcome to our elite concierge. I can assist you with seamless room bookings, availability updates, and resort experiences.
        </motion.p>

        {/* Horizontal Divider */}
        <div className="w-full max-w-[400px] h-[0.5px] bg-gradient-to-r from-transparent via-[rgba(185,60,60,0.2)] to-transparent mb-8" />

        {/* 2-Column Action Cards Grid */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-[480px]"
          role="list"
        >
          {suggestions.map((s) => (
            <button
              key={s.prompt}
              onClick={() => onSelect(s.prompt)}
              role="listitem"
              className="group relative flex items-center gap-3 p-[14px_16px] bg-[rgba(255,255,255,0.6)] border border-[rgba(185,60,60,0.12)] rounded-[10px] text-left w-full cursor-pointer transition-all duration-200 hover:bg-[rgba(185,60,60,0.05)] hover:border-[rgba(185,60,60,0.25)] active:scale-[0.98] overflow-hidden"
            >
              {/* Hover Red Accent Line on Left */}
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent transition-colors duration-200 group-hover:bg-[rgba(185,60,60,0.65)]" />

              {/* Icon Container */}
              <div className="w-8 h-8 rounded-[7px] bg-[rgba(185,60,60,0.07)] border border-[rgba(185,60,60,0.18)] flex items-center justify-center shrink-0">
                {CARD_ICONS[s.label] ?? CARD_ICONS['Book a room']}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-[#2A1A1A] tracking-[0.01em] truncate">
                  {s.label}
                </div>
                <div className="text-[11px] text-[rgba(150,60,60,0.5)] mt-0.5 font-light truncate">
                  {CARD_SUBTITLES[s.label] ?? 'Explore options'}
                </div>
              </div>
            </button>
          ))}
        </motion.div>

      </div>
    </div>
  )
}
