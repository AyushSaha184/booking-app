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
 * Luxury cream & crimson input bar aligned with max-w-3xl message container.
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

  // Auto-resize textarea up to 160px
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [input, ref])

  const canSend = input.trim() && !isLoading

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      className="px-4 pb-5 pt-2 shrink-0 bg-transparent w-full"
      style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
    >
      <div
        className={cn(
          'relative flex gap-3 items-end max-w-3xl mx-auto w-full',
          'bg-white/85 backdrop-blur-md',
          'border border-[#B93C3C]/20 rounded-2xl',
          'px-5 py-3.5',
          'transition-all duration-300 shadow-sm',
          'focus-within:border-[#B93C3C] focus-within:shadow-[0_4px_24px_rgba(185,60,60,0.12)]'
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
            'text-[#2A1A1A] placeholder:text-[#2A1A1A]/45',
            'text-base leading-relaxed font-normal',
            'py-1 min-h-[28px] max-h-[160px] overflow-y-auto',
            '-webkit-overflow-scrolling-touch',
          )}
          style={{ WebkitOverflowScrolling: 'touch', WebkitAppearance: 'none' }}
        />

        {/* Send button */}
        <motion.button
          type="button"
          onClick={(e) => { if (canSend) onSubmit(e as unknown as React.FormEvent) }}
          disabled={!canSend}
          whileTap={canSend ? { scale: 0.94 } : {}}
          whileHover={canSend ? { scale: 1.06 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          aria-label="Send message"
          className={cn(
            'shrink-0 w-11 h-11 rounded-xl grid place-items-center',
            'transition-all duration-200 cursor-pointer shadow-xs',
            canSend
              ? 'bg-[#B93C3C] text-white shadow-[0_2px_12px_rgba(185,60,60,0.35)] hover:bg-[#a02f2f]'
              : 'bg-[#B93C3C]/10 text-[#B93C3C]/40 border border-[#B93C3C]/15 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <div className="flex gap-[3px] items-center justify-center">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-current block"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }}
                />
              ))}
            </div>
          ) : (
            <Send className="w-5 h-5 translate-x-px" aria-hidden="true" />
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}