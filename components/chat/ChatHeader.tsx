'use client'

import { motion } from 'framer-motion'
import { Trash2, Hotel } from 'lucide-react'
import { PremiumButton } from '@/app/components/ui/PremiumButton'

interface ChatHeaderProps {
  onClear: () => void
  isConnected?: boolean
}

/**
 * Top header bar for the chat interface.
 * Shows resort branding, live connection indicator, and a clear-chat action.
 */
export default function ChatHeader({ onClear, isConnected = true }: ChatHeaderProps) {
  return (
    <header className="relative flex items-center justify-between px-4 py-3 bg-surface/85 backdrop-blur-lg shrink-0 z-20 border-b border-border/40"
      style={{ paddingTop: 'calc(12px + env(safe-area-inset-top))' }}
    >
      {/* Subtle bottom gradient accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9b99a]/25 to-transparent" />

      {/* Branding */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#242424] border border-[#c9b99a]/20 flex items-center justify-center shadow-[0_0_12px_rgba(201,185,154,0.1)]">
          <Hotel className="w-4.5 h-4.5 text-[#c9b99a]" />
        </div>
        <div>
          <p className="text-[10px] text-text-secondary uppercase tracking-[0.15em] leading-none mb-1 font-semibold">
            Palace Assistant
          </p>
          <h1 className="text-sm font-bold text-text-primary leading-none tracking-wide">
            Luxe Concierge
          </h1>
        </div>
      </div>

      {/* Status + actions */}
      <div className="flex items-center gap-3">
        {/* Connection dot */}
        <div className="flex items-center gap-1.5" aria-label={isConnected ? 'Connected' : 'Disconnected'}>
          <motion.span
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-danger'}`}
            animate={isConnected ? { scale: [1, 1.3, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
          <span className="text-xs text-text-tertiary hidden sm:inline">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Clear chat */}
        <PremiumButton
          variant="ghost"
          size="sm"
          onClick={onClear}
          aria-label="Clear chat history"
          className="h-8 w-8 p-0 rounded-lg text-text-tertiary hover:text-danger"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </PremiumButton>
      </div>
    </header>
  )
}
