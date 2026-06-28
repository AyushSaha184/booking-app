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
 * Luxury cream & crimson input bar matching the concierge design system.
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
          'relative flex gap-2 items-end max-w-[600px] mx-auto',
          'bg-[rgba(255,255,255,0.75)] backdrop-blur-md',
          'border border-[rgba(185,60,60,0.2)] rounded-2xl',
          'px-4 py-2.5',
          'transition-all duration-300 shadow-sm',
          'focus-within:border-[#B93C3C] focus-within:shadow-[0_4px_20px_rgba(185,60,60,0.1)]'
        )}
      >
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
            'text-[#2A1A1A] placeholder:text-[rgba(150,60,60,0.45)]',
            'text-sm leading-relaxed',
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
            'shrink-0 w-9 h-9 rounded-xl grid place-items-center',
            'transition-all duration-200 cursor-pointer',
            canSend
              ? 'bg-[#B93C3C] text-white shadow-[0_2px_10px_rgba(185,60,60,0.3)] hover:bg-[#a02f2f]'
              : 'bg-[rgba(185,60,60,0.08)] text-[rgba(150,60,60,0.4)] border border-[rgba(185,60,60,0.15)] cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <div className="flex gap-[3px] items-center justify-center">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 h-1 rounded-full bg-current block"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }}
                />
              ))}
            </div>
          ) : (
            <Send className="w-4 h-4 translate-x-px" aria-hidden="true" />
          )}
        </motion.button>
      </div>
    </div>
  )
}