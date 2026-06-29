'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'

const RESORT_NAME = 'Dorshi Holiday Resort cum Restaurant'

interface ChatHeaderProps {
  onClose: () => void
}

/**
 * Top header bar for the chat interface.
 * Shows the resort name cleanly with no AI/live status indicators.
 */
export default function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <header
      className="relative flex items-center justify-between px-5 h-14 bg-[#FAFAF8]/85 backdrop-blur-xl shrink-0 z-20 border-b border-[#E5E7EB]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 min-w-0">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B1538] to-[#6E0F2A] flex items-center justify-center shrink-0 shadow-md"
        >
          <svg
            viewBox="0 0 14 14"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.4"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <rect x="1" y="1" width="5" height="5" rx="1" />
            <rect x="8" y="1" width="5" height="5" rx="1" />
            <rect x="1" y="8" width="5" height="5" rx="1" />
            <rect x="8" y="8" width="5" height="5" rx="1" />
         </svg>
       </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col min-w-0"
        >
          <span className="text-[10px] tracking-[0.16em] text-[#6B7280] uppercase font-medium leading-none mb-0.5">
            Welcome
         </span>
          <span className="text-sm font-semibold text-[#1F1F1F] truncate tracking-tight leading-tight">
            {RESORT_NAME}
         </span>
       </motion.div>
     </div>

      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close chat"
        title="Close"
        className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer text-[#6B7280] hover:text-[#8B1538] hover:bg-[#8B1538]/10 active:scale-95 transition-all duration-200 border border-transparent hover:border-[#8B1538]/15"
      >
        <X className="w-5 h-5" strokeWidth={2} />
     </button>
   </header>
  )
}

export { RESORT_NAME }
