'use client'

import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
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
    <header className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface/80 backdrop-blur-md shrink-0"
      style={{ paddingTop: 'calc(12px + env(safe-area-inset-top))' }}
    >
      {/* Branding */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent-muted border border-accent/20 flex items-center justify-center text-lg select-none">
          🏨
        </div>
        <div>
          <p className="text-[11px] text-text-tertiary uppercase tracking-widest leading-none mb-0.5">
            Resort assistant
          </p>
          <h1 className="text-sm font-semibold text-text-primary leading-none">
            How can I help you?
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
