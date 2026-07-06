'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

const RESORT_NAME = 'Dorshi Holiday Resort'

interface ChatHeaderProps {
  onClose: () => void
}

/**
 * Custom SVG logo representing a house with an arched doorway.
 * Matches the reference image logo.
 */
const ResortLogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-white"
    {...props}
  >
    {/* House shape */}
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    {/* Arched doorway */}
    <path d="M9 22V12a3 3 0 0 1 6 0v10" />
  </svg>
)

/**
 * Top header bar for the chat interface.
 * Styled as a floating card to match the premium screenshots.
 */
export default function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-6 py-4 bg-white border border-gray-200/80 rounded-3xl shrink-0 z-20 w-full shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 min-w-0">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
          className="w-11 h-11 rounded-2xl bg-[#7C1A36] flex items-center justify-center shrink-0 shadow-sm"
        >
          <ResortLogoIcon />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
          className="flex flex-col min-w-0 text-left"
        >
          <span className="text-[10px] tracking-[0.16em] text-[#A12444] uppercase font-bold leading-none mb-1">
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
        className="shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-800 hover:text-[#7C1A36] hover:border-[#7C1A36]/30 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" strokeWidth={2} />
      </button>
    </header>
  )
}

export { RESORT_NAME }

