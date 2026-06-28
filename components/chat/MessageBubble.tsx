'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import type { UIMessage } from 'ai'
import { isToolUIPart, getToolName } from 'ai'
import { cn } from '@/lib/utils'
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
        <strong key={idx} className="font-semibold text-[#B93C3C]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

/**
 * Renders a single chat message in the Luxe Concierge cream & red design style.
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
      const rawInput = part.input as
        | {
            availableRooms?: Array<{ id: string; name: string; type: string; capacity: number; pricePerNight: number }>
            rooms?: Array<{ id: string; name: string; type: string; capacity: number; pricePerNight: number }>
            checkIn?: string
            checkOut?: string
            guests?: number
          }
        | undefined
      if (rawInput) {
        bookingFormArgs = {
          availableRooms: rawInput.availableRooms ?? rawInput.rooms ?? [],
          checkIn: rawInput.checkIn,
          checkOut: rawInput.checkOut,
          guests: rawInput.guests,
        }
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
        className="max-w-full my-2"
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
      // ignore
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className={cn('flex gap-3 items-start my-1.5 max-w-[640px] mx-auto w-full', isUser ? 'justify-end' : 'justify-start')}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgba(185,60,60,0.08)] border border-[rgba(185,60,60,0.25)] flex items-center justify-center mt-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="w-4 h-4 text-[#B93C3C]">
            <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"/>
          </svg>
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        'group relative max-w-[85%] min-w-0',
        isUser ? 'order-first' : ''
      )}>
        {isUser ? (
          <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#B93C3C] to-[#9E2B2B] text-white font-medium text-sm leading-relaxed shadow-sm break-words">
            {content}
          </div>
        ) : (
          <div className="relative">
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[rgba(255,255,255,0.75)] backdrop-blur-md border border-[rgba(185,60,60,0.15)] shadow-sm">
              <div className="text-sm leading-relaxed text-[#2A1A1A] break-words whitespace-pre-wrap font-normal">
                {parseMessageContent(content)}
              </div>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              aria-label="Copy message"
              className={cn(
                'absolute -top-2 -right-2',
                'w-6 h-6 rounded-md bg-white border border-[rgba(185,60,60,0.2)]',
                'grid place-items-center',
                'text-[rgba(150,60,60,0.6)] hover:text-[#B93C3C]',
                'transition-all duration-200',
                'opacity-0 group-hover:opacity-100 focus:opacity-100',
                'shadow-xs z-10 cursor-pointer'
              )}
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgba(185,60,60,0.1)] border border-[rgba(185,60,60,0.2)] flex items-center justify-center text-xs font-semibold text-[#B93C3C] mt-0.5">
          U
        </div>
      )}
    </motion.div>
  )
}