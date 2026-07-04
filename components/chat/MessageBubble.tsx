'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

interface MessageBubbleProps {
  message: ChatMessage
}

/**
 * Minimal message bubble used for showing confirmation text.
 * Renders user and assistant messages with a clean slide-up entrance animation.
 */
export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  if (!message.text) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
      className={cn(
        'flex w-full my-1.5',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[82%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm sm:text-base leading-relaxed break-words shadow-sm',
          isUser
            ? 'bg-linear-to-r from-[#8B1538] to-[#6E0F2A] text-white rounded-tr-sm font-medium'
            : 'bg-white border border-[#E5E7EB] text-[#1F1F1F] rounded-tl-sm font-normal'
        )}
      >
        {message.text}
     </div>
   </motion.div>
  )
}
