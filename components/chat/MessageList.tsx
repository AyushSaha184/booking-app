'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { UIMessage } from 'ai'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import type { BookingFormData } from '@/types/booking'

interface MessageListProps {
  messages: UIMessage[]
  isLoading: boolean
  onBookingSubmit: (data: BookingFormData) => Promise<void>
  onCancelConfirm: (bookingId: string) => void
}

/**
 * Scrollable list of chat messages centered within the main layout.
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
      className="flex flex-col gap-4 px-4 py-6 max-w-3xl mx-auto w-full overscroll-none"
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