'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import type { UIMessage } from 'ai'
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

  interface BookingFormArgs {
    availableRooms: Array<{ id: string; name: string; type: string; capacity: number; pricePerNight: number }>
    checkIn?: string
    checkOut?: string
    guests?: number
  }

  let bookingFormArgs: BookingFormArgs | null = null

  for (const part of parts) {
    if (
      part.type === 'tool-invocation' &&
      (part as { type: string; toolName?: string; state?: string }).toolName === 'showBookingForm' &&
      (part as { type: string; toolName?: string; state?: string; args?: unknown }).state === 'call'
    ) {
      bookingFormArgs = (part as { type: string; toolName?: string; state?: string; args?: unknown }).args as BookingFormArgs
      break
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
        /* User bubble — gradient accent */
        <div
          className={cn(
            'max-w-[82%] px-4 py-2.5',
            'bg-gradient-to-b from-accent/90 to-accent/70',
            'border border-accent/40 text-[#0f0f0f]',
            'rounded-2xl rounded-br-sm',
            'text-sm leading-relaxed font-medium',
            'break-words'
          )}
        >
          {content}
        </div>
      ) : (
        /* AI bubble — glass card with copy action on hover */
        <div className="group relative max-w-[88%]">
          <GlassCard
            className="px-4 py-3 rounded-2xl rounded-bl-sm"
            variant="default"
          >
            <p className="text-sm leading-relaxed text-text-primary break-words whitespace-pre-wrap">
              {content}
            </p>
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
              'shadow-sm'
            )}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}
    </motion.div>
  )
}