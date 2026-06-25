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
      className="px-4 py-3 shrink-0 bg-surface/80 backdrop-blur-md border-t border-border-subtle"
      style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
    >
      <div
        className={cn(
          'flex gap-2 items-end',
          'bg-input/80 backdrop-blur-sm',
          'border border-border rounded-2xl',
          'px-4 py-2',
          'transition-all duration-200',
          'focus-within:border-accent/60 focus-within:shadow-[0_0_0_3px_rgba(201,185,154,0.12)]'
        )}
      >
        <textarea
          ref={ref}
          value={input}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Message…"
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
          whileTap={canSend ? { scale: 0.9 } : {}}
          aria-label="Send message"
          className={cn(
            'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center',
            'min-w-[44px] min-h-[44px]',    // touch target
            'transition-all duration-200',
            canSend
              ? 'bg-gradient-to-b from-accent to-[#b8a488] text-[#0f0f0f] shadow-[0_0_12px_rgba(201,185,154,0.3)] hover:shadow-[0_0_20px_rgba(201,185,154,0.45)]'
              : 'bg-surface-elevated text-text-tertiary cursor-not-allowed'
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