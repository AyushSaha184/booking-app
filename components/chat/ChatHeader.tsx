'use client'

import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

const RESORT_NAME = 'Dorshi Holiday Resort'

interface ChatHeaderProps {
  onClose: () => void
}

/**
 * Top header bar for the chat interface.
 * Styled as a floating card to match the premium screenshots.
 */
export default function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-150 shrink-0 z-20 w-full"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 min-w-0">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
          className="w-11 h-11 rounded-2xl bg-[#7C1A36] flex items-center justify-center shrink-0 shadow-sm"
        >
          <Home className="w-5 h-5 text-white" strokeWidth={2} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
          className="flex flex-col min-w-0 text-left"
        >
          <span className="text-[10px] tracking-[0.16em] text-[#7C1A36] uppercase font-bold leading-none mb-1">
            Welcome To
          </span>
          <span className="text-base font-bold text-gray-900 truncate tracking-tight leading-tight font-sans">
            {RESORT_NAME}
          </span>
        </motion.div>
      </div>

      {/* Back button */}
      <button
        onClick={onClose}
        aria-label="Go Back"
        title="Back"
        className="shrink-0 text-gray-800 hover:text-[#7C1A36] active:scale-95 transition-all duration-200 cursor-pointer"
      >
        <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
      </button>
    </header>
  )
}

export { RESORT_NAME }
