'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { UIMessage } from 'ai'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import type { BookingFormData } from '@/app/types/booking'

interface MessageListProps {
  messages: UIMessage[]
  isLoading: boolean
  onBookingSubmit: (data: BookingFormData) => Promise<void>
  onCancelConfirm: (bookingId: string) => void
}

/**
 * Scrollable list of chat messages with smooth auto-scroll to bottom.
 * AnimatePresence enables exit animations for messages.
 */
export default function MessageList({
  messages,
  isLoading,
  onBookingSubmit,
  onCancelConfirm,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div
      className="flex flex-col gap-2 p-4 overscroll-none"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onBookingSubmit={onBookingSubmit}
            onCancelConfirm={onCancelConfirm}
          />
        ))}
        {isLoading && <TypingIndicator key="typing" />}
      </AnimatePresence>
      <div ref={bottomRef} className="h-px" aria-hidden="true" />
    </div>
  )
}