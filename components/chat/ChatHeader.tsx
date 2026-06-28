'use client'

import { motion } from 'framer-motion'
import { Trash2, Hotel } from 'lucide-react'

interface ChatHeaderProps {
  onClear: () => void
  isConnected?: boolean
}

/**
 * Top header bar for the chat interface.
 * Shows resort branding, live connection indicator, and a clear-chat action.
 */
export default function ChatHeader({ onClear, isConnected = true }: ChatHeaderProps) {
  const dotColor = isConnected ? '#5ca882' : '#e05c5c'

  return (
    <header className="relative flex items-center justify-between px-4 py-3 bg-surface/85 backdrop-blur-lg shrink-0 z-20 border-b border-border/40"
      style={{ paddingTop: 'calc(12px + env(safe-area-inset-top))' }}
    >
      {/* Subtle bottom gradient accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9b99a]/25 to-transparent" />

       {/* Branding — fixed: grid centering for icon */}
       <div className="flex items-center gap-3">
         <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#242424] border border-[#c9b99a]/20 grid place-items-center shadow-[0_0_12px_rgba(201,185,154,0.1)]">
           <Hotel className="w-4 h-4 text-[#c9b99a]" />
         </div>
         <div className="flex flex-col justify-center">
           <p className="text-[10px] text-text-secondary uppercase tracking-[0.15em] leading-none font-semibold">
             Palace Assistant
           </p>
           <h1 className="text-sm font-bold text-text-primary leading-none tracking-wide mt-0.5">
             Luxe Concierge
           </h1>
         </div>
       </div>

       {/* Status + actions */}
       <div className="flex items-center gap-3">
         {/* Connection status indicator — fixed: grid centering */}
         <div className="flex items-center gap-2" aria-label={isConnected ? 'Connected' : 'Disconnected'}>
           <div className="relative w-2.5 h-2.5 grid place-items-center">
             <motion.span
               className="absolute w-2 h-2 rounded-full opacity-75"
               style={{ 
                 backgroundColor: dotColor,
                 boxShadow: `0 0 8px ${dotColor}`
               }}
               animate={isConnected ? { scale: [1, 1.4, 1] } : {}}
               transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
             />
             <span 
               className="relative w-1.5 h-1.5 rounded-full"
               style={{ backgroundColor: dotColor }}
             />
           </div>
           <span className="text-xs text-text-tertiary font-semibold hidden sm:inline">
             {isConnected ? 'Live' : 'Offline'}
           </span>
         </div>

         {/* Clear chat button — fixed: grid centering */}
         <motion.button
           whileTap={{ scale: 0.95 }}
           whileHover={{ scale: 1.05 }}
           onClick={onClear}
           aria-label="Clear chat history"
           className="h-9 w-9 rounded-xl text-text-secondary hover:text-danger bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-border/60 hover:border-danger/30 grid place-items-center transition-all duration-200 cursor-pointer shadow-sm shrink-0"
         >
           <Trash2 className="w-4 h-4" aria-hidden="true" />
         </motion.button>
       </div>
    </header>
  )
}
