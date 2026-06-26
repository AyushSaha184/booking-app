'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Sparkles } from 'lucide-react'
import type { UIMessage, ToolUIPart } from 'ai'
import { isToolUIPart, getToolName } from 'ai'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/app/components/ui/GlassCard'
import BookingFormCard from '../booking/BookingFormCard'
import type { BookingFormData } from '@/app/types/booking'

interface MessageBubbleProps {
  message: UIMessage
  onBookingSubmit: (data: BookingFormData) => Promise<void>
  onCancelConfirm: (bookingId: string) => void
}

/**
 * Helper to render basic markdown bold patterns.
 * e.g., "**bold** text" -> <strong>bold</strong> text
 */
function parseMessageContent(text: string) {
  if (!text) return ''
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-[#c9b99a]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

/**
 * Renders a single chat message:
 * - AI messages: GlassCard, left-aligned, fade+slide entrance
 * - User messages: gradient accent bubble, right-aligned
 * - Booking form: rendered inline when AI calls showBookingForm tool
 */
export default function MessageBubble({
  message,
  onBookingSubmit,
  onCancelConfirm,
}: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const parts = message.parts ?? []

  let bookingFormArgs: {
    availableRooms: Array<{ id: string; name: string; type: string; capacity: number; pricePerNight: number }>
    checkIn?: string
    checkOut?: string
    guests?: number
  } | null = null

  for (const part of parts) {
    if (isToolUIPart(part) && getToolName(part) === 'showBookingForm') {
      const input = part.input as
        | {
            availableRooms: Array<{ id: string; name: string; type: string; capacity: number; pricePerNight: number }>
            checkIn?: string
            checkOut?: string
            guests?: number
          }
        | undefined
      if (input) {
        bookingFormArgs = input
        break
      }
    }
  }

  if (bookingFormArgs) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="max-w-full"
      >
        <BookingFormCard
          availableRooms={bookingFormArgs.availableRooms}
          prefill={{
            checkIn: bookingFormArgs.checkIn,
            checkOut: bookingFormArgs.checkOut,
            guests: bookingFormArgs.guests,
          }}
          onSubmit={onBookingSubmit}
        />
      </motion.div>
    )
  }

  const textPart = parts.find(
    (p): p is { type: 'text'; text: string } => p.type === 'text'
  )
  const content = textPart?.text ?? ''

  if (!content) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available — silently ignore
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      {isUser ? (
        /* User bubble — gradient accent with inner border shadow */
        <div
          className={cn(
            'max-w-[85%] px-4 py-2.5',
            'bg-gradient-to-tr from-[#a8956e] via-[#c9b99a] to-[#d6c7ab]',
            'text-[#0f0f0f]',
            'rounded-2xl rounded-br-sm',
            'text-sm leading-relaxed font-semibold',
            'break-words',
            'shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.2)]'
          )}
        >
          {content}
        </div>
      ) : (
        /* AI bubble — glass card with copy action on hover, plus brand icon */
        <div className="group relative max-w-[88%] flex items-start gap-2.5">
          {/* Brand Sparkle Indicator */}
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-[#1a1a1a] to-[#242424] border border-[#c9b99a]/25 flex items-center justify-center shadow-[0_2px_8px_rgba(201,185,154,0.1)] mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-[#c9b99a]" />
          </div>

          <div className="relative flex-1 min-w-0">
            <GlassCard
              className="px-4 py-3 rounded-2xl rounded-bl-sm border border-border/80"
              variant="default"
            >
              <div className="text-sm leading-relaxed text-text-primary break-words whitespace-pre-wrap">
                {parseMessageContent(content)}
              </div>
            </GlassCard>

            {/* Copy button — appears on hover */}
            <button
              onClick={handleCopy}
              aria-label="Copy message"
              className={cn(
                'absolute -top-2 -right-2',
                'w-7 h-7 rounded-lg',
                'bg-surface-elevated border border-border',
                'flex items-center justify-center',
                'text-text-tertiary hover:text-text-primary',
                'transition-all duration-200',
                'opacity-0 group-hover:opacity-100 focus:opacity-100',
                'shadow-sm',
                'z-10'
              )}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}