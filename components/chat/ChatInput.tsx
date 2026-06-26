'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  input: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  isLoading: boolean
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>
}

/**
 * Glassmorphism input bar at the bottom of the chat.
 * Auto-resizing textarea (max 120px), PremiumButton send trigger,
 * Enter-to-send (Shift+Enter for newline).
 */
export default function ChatInput({
  input,
  onChange,
  onSubmit,
  onKeyDown,
  isLoading,
  textareaRef,
}: ChatInputProps) {
  const internalRef = useRef<HTMLTextAreaElement>(null)
  const ref = textareaRef ?? internalRef

  // Auto-resize textarea
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [input, ref])

  const canSend = input.trim() && !isLoading

  return (
    <div
      className="px-4 pb-4 pt-2 shrink-0 bg-transparent"
      style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
    >
      <div
        className={cn(
          'relative flex gap-2 items-end',
          'bg-surface/85 backdrop-blur-lg',
          'border border-border/80 rounded-2xl',
          'px-4 py-2.5',
          'transition-all duration-300',
          'shadow-[0_8px_32px_rgba(0,0,0,0.25)]',
          'focus-within:border-[#c9b99a]/50 focus-within:shadow-[0_8px_32px_rgba(201,185,154,0.08),0_0_0_3px_rgba(201,185,154,0.08)]'
        )}
      >
        {/* Top subtle gradient highlight line */}
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#c9b99a]/25 to-transparent" />

        <textarea
          ref={ref}
          value={input}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Message Concierge…"
          rows={1}
          aria-label="Message input"
          className={cn(
            'flex-1 bg-transparent border-none outline-none resize-none',
            'text-text-primary placeholder:text-text-tertiary',
            'text-base leading-relaxed',     // 16px prevents iOS zoom
            'py-1.5 max-h-[120px] overflow-y-auto',
            '-webkit-overflow-scrolling-touch',
          )}
          style={{ WebkitOverflowScrolling: 'touch', WebkitAppearance: 'none' }}
        />
 
        {/* Send button */}
        <motion.button
          type="button"
          onClick={(e) => { if (canSend) onSubmit(e as unknown as React.FormEvent) }}
          disabled={!canSend}
          whileTap={canSend ? { scale: 0.95 } : {}}
          whileHover={canSend ? { scale: 1.05 } : {}}
          aria-label="Send message"
          className={cn(
            'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center',
            'min-w-[44px] min-h-[44px]',    // touch target
            'transition-all duration-300',
            canSend
              ? 'bg-gradient-to-tr from-[#a8956e] via-[#c9b99a] to-[#d6c7ab] text-[#0f0f0f] shadow-[0_0_12px_rgba(201,185,154,0.35)] hover:shadow-[0_0_20px_rgba(201,185,154,0.55)]'
              : 'bg-surface-elevated text-text-tertiary border border-border/30 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            /* Spinning dots when streaming */
            <div className="flex gap-[3px] items-center">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 h-1 rounded-full bg-current"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }}
                />
              ))}
            </div>
          ) : (
            <Send className="w-4 h-4" aria-hidden="true" />
          )}
        </motion.button>
      </div>
    </div>
  )
}