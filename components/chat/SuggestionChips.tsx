'use client'

import { motion } from 'framer-motion'
import { Calendar, CalendarX, Image as ImageIcon } from 'lucide-react'
import { staggerContainer, staggerItem, transitions } from '@/lib/animations'

export type ChatView = 'welcome' | 'booking' | 'cancellation' | 'photos'

interface SuggestionChipsProps {
  onSelectView: (view: ChatView) => void
}

/**
 * Welcome screen with three large premium action cards.
 * Clicking a card switches the chat to the corresponding view.
 */
export default function SuggestionChips({ onSelectView }: SuggestionChipsProps) {
  const cards: Array<{
    title: string
    subtitle: string
    icon: React.ReactNode
    view: ChatView
  }> = [
    {
      title: 'Book a room',
      subtitle: 'Reserve your perfect suite',
      icon: <Calendar className="w-6 h-6" strokeWidth={1.8} />,
      view: 'booking',
    },
    {
      title: 'Cancel my booking',
      subtitle: 'Modify your current stay',
      icon: <CalendarX className="w-6 h-6" strokeWidth={1.8} />,
      view: 'cancellation',
    },
    {
      title: 'View resort photos',
      subtitle: 'Explore our resort gallery',
      icon: <ImageIcon className="w-6 h-6" strokeWidth={1.8} />,
      view: 'photos',
    },
  ]

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center px-6 py-8 relative z-10 overflow-y-auto">
      <div className="flex flex-col items-center w-full max-w-[640px]">
        {/* Brand badge */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={transitions.smooth}
          className="relative w-16 h-16 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center mb-6 shadow-sm"
        >
          <div className="absolute -inset-2 rounded-full border border-[#8B1538]/10 pointer-events-none" aria-hidden="true" />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="w-6 h-6 text-[#8B1538]"
            aria-hidden="true"
          >
            <path d="M3 21V11l9-7 9 7v10" />
            <path d="M9 21v-6h6v6" />
         </svg>
       </motion.div>

        <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#8B1538]/40 to-transparent mb-5" />

        {/* Headline */}
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...transitions.smooth, delay: 0.08 }}
          className="font-serif text-3xl sm:text-4xl font-medium text-[#1F1F1F] text-center tracking-tight leading-tight mb-3"
        >
          Your Dream Stay <em className="italic text-[#8B1538]">Awaits</em>
       </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...transitions.smooth, delay: 0.14 }}
          className="text-sm sm:text-base text-[#6B7280] text-center leading-relaxed max-w-[440px] font-light mb-10"
        >
          Welcome to Dorshi Holiday Resort cum Restaurant. Choose how
          you’d like to continue — we’re here to make every moment memorable.
       </motion.p>

        <div className="w-full max-w-[480px] h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent mb-8" />

        {/* Action cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3.5 w-full max-w-[480px]"
          role="list"
        >
          {cards.map((card) => (
            <motion.button
              key={card.view}
              variants={staggerItem}
              onClick={() => onSelectView(card.view)}
              whileHover={{
                y: -4,
                boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="group relative flex items-center gap-4 px-5 py-4 bg-white/90 backdrop-blur-lg border border-[#E5E7EB] rounded-2xl text-left w-full cursor-pointer hover:border-[#8B1538]/40 transition-colors duration-200 overflow-hidden"
              aria-label={card.title}
            >
              {/* Left accent bar */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 bottom-0 w-[4px] bg-transparent transition-colors duration-200 group-hover:bg-[#8B1538]"
              />

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#8B1538]/8 border border-[#8B1538]/15 flex items-center justify-center shrink-0 text-[#8B1538] group-hover:scale-110 transition-transform duration-200">
                {card.icon}
             </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-base font-semibold text-[#1F1F1F] tracking-wide leading-tight group-hover:text-[#8B1538] transition-colors duration-200">
                  {card.title}
               </div>
                <div className="text-xs sm:text-sm text-[#6B7280] mt-0.5 font-light">
                  {card.subtitle}
               </div>
             </div>

              {/* Arrow */}
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                className="w-4 h-4 text-[#6B7280] group-hover:text-[#8B1538] group-hover:translate-x-1 transition-all duration-200 shrink-0"
                aria-hidden="true"
              >
                <path d="M6 4l4 4-4 4" />
             </svg>
           </motion.button>
          ))}
       </motion.div>
    </div>
  </div>
  )
}
