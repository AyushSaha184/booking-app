'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import type { UIMessage } from 'ai'
import { isToolUIPart, getToolName } from 'ai'
import { cn } from '@/lib/utils'
import BookingFormCard from '../booking/BookingFormCard'
import type { BookingFormData } from '@/types/booking'

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
 * Renders a single chat message with smooth animations and clean alignments.
 */
export default function MessageBubble({
  message,
  onBookingSubmit,
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
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
        className="w-full my-2"
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
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      className={cn('flex gap-3.5 items-start w-full my-1.5', isUser ? 'justify-end' : 'justify-start')}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#B93C3C]/10 border border-[#B93C3C]/25 flex items-center justify-center mt-0.5 shadow-xs">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-4 h-4 text-[#B93C3C]">
            <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"/>
          </svg>
        </div>
      )}

      {/* Message Bubble Container */}
      <div className={cn(
        'group relative max-w-[82%] sm:max-w-[75%]',
        isUser ? 'order-first' : ''
      )}>
        {isUser ? (
          <div className="px-4.5 py-3 rounded-2xl rounded-tr-xs bg-gradient-to-r from-[#B93C3C] to-[#a02f2f] text-white font-medium text-sm sm:text-base leading-relaxed shadow-xs break-words">
            {content}
          </div>
        ) : (
          <div className="relative">
            <div className="px-4.5 py-3.5 rounded-2xl rounded-tl-xs bg-white/80 backdrop-blur-md border border-[#B93C3C]/15 shadow-xs">
              <div className="text-sm sm:text-base leading-relaxed text-[#2A1A1A] break-words whitespace-pre-wrap font-normal">
                {parseMessageContent(content)}
              </div>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              aria-label="Copy message"
              className={cn(
                'absolute -top-2.5 -right-2.5',
                'w-7 h-7 rounded-lg bg-white border border-[#B93C3C]/20',
                'grid place-items-center',
                'text-[#2A1A1A]/60 hover:text-[#B93C3C]',
                'transition-all duration-200',
                'opacity-0 group-hover:opacity-100 focus:opacity-100',
                'shadow-xs z-10 cursor-pointer'
              )}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#B93C3C]/12 border border-[#B93C3C]/25 flex items-center justify-center text-xs font-semibold text-[#B93C3C] mt-0.5 shadow-xs">
          U
        </div>
      )}
    </motion.div>
  )
}