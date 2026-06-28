'use client'

import { motion } from 'framer-motion'

interface ChatHeaderProps {
  onClear: () => void
  isConnected?: boolean
}

/**
 * Top header bar for the chat interface matching luxe_concierge_cream_red.html (.lc-topbar).
 */
export default function ChatHeader({ onClear, isConnected = true }: ChatHeaderProps) {
  return (
    <header className="relative flex items-center justify-between px-5 h-12 bg-[#F5F0E8]/80 backdrop-blur-md shrink-0 z-20 border-b border-[#B93C3C]/15"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md border border-[#B93C3C]/35 flex items-center justify-center bg-transparent">
          <svg viewBox="0 0 14 14" fill="none" stroke="#B93C3C" strokeWidth="1.2" className="w-3.5 h-3.5">
            <rect x="1" y="1" width="5" height="5" rx="1"/>
            <rect x="8" y="1" width="5" height="5" rx="1"/>
            <rect x="1" y="8" width="5" height="5" rx="1"/>
            <rect x="8" y="8" width="5" height="5" rx="1"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] tracking-widest text-[#2A1A1A]/60 uppercase font-normal leading-none">
            Palace Assistant
          </span>
          <span className="text-xs text-[#B93C3C] font-medium tracking-wide leading-snug">
            Luxe Concierge
          </span>
        </div>
      </div>

      {/* Status + actions */}
      <div className="flex items-center gap-3">
        {/* Connection status indicator pill */}
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 text-xs font-medium tracking-wide shadow-2xs" 
          aria-label={isConnected ? 'Connected' : 'Disconnected'}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
            animate={isConnected ? { scale: [1, 1.25, 1], opacity: [1, 0.6, 1] } : { opacity: 0.3 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
          <span>
            {isConnected ? 'Live Concierge' : 'Offline'}
          </span>
        </div>

        {/* Clear chat button */}
        <button
          onClick={onClear}
          aria-label="Clear chat history"
          title="Clear conversation"
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer text-[#B93C3C]/60 hover:text-[#B93C3C] hover:bg-[#B93C3C]/10 transition-all duration-200 border-0"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="w-4 h-4">
            <path d="M2 4h12M5 4V2.5A.5.5 0 015.5 2h5a.5.5 0 01.5.5V4M6 7v5M10 7v5M3 4l1 9.5a.5.5 0 00.5.5h7a.5.5 0 00.5-.5L13 4"/>
          </svg>
        </button>
      </div>
    </header>
  )
}
