'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import SuggestionChips from './SuggestionChips'
import ChatHeader from './ChatHeader'
import type { BookingFormData } from '@/app/types/booking'

const SUGGESTIONS = [
  { label: 'Book a room', prompt: 'I want to book a room' },
  { label: 'Show available rooms', prompt: 'Show me all available rooms' },
  { label: 'Cancel my booking', prompt: 'I want to cancel my booking' },
  { label: 'Resort amenities', prompt: 'What amenities does the resort offer?' },
]

export default function ChatPage() {
  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  })

  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const showSuggestions = messages.length === 0
  const isLoading = status === 'streaming'

  const handleChip = (prompt: string) => {
    sendMessage({ role: 'user', parts: [{ type: 'text', text: prompt }] })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] })
      setInput('')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 640) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] })
        setInput('')
      }
    }
  }

  // Auto-resize textarea (delegated here so ChatInput is pure display)
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [input])

  const handleBookingSubmit = async (formData: BookingFormData) => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    const data = await res.json() as { success: boolean; booking?: { id: string }; error?: string }
    if (!res.ok || !data.success) {
      setMessages((prev) => [
        ...prev,
        {
          id: `booking-error-${Date.now()}`,
          role: 'assistant' as const,
          parts: [
            {
              type: 'text' as const,
              text: `Sorry, I couldn't complete your booking: ${data.error ?? 'Please try again or contact support.'}`,
            },
          ],
        },
      ])
      return
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `booking-confirm-${Date.now()}`,
        role: 'assistant' as const,
        parts: [
          {
            type: 'text' as const,
            text: `Your booking is confirmed! Reference: **${data.booking!.id}**. We look forward to welcoming you on ${formData.checkIn}. To cancel, just come back here and say "cancel my booking" with your name and phone number.`,
          },
        ],
      },
    ])
  }

  return (
    <div
      className="flex flex-col h-svh bg-background overflow-hidden"
      style={{ background: 'var(--color-background)' }}
    >
      <ChatHeader
        onClear={() => setMessages([])}
        isConnected={true}
      />

      {/* Message area */}
      <div
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        <AnimatePresence mode="wait">
          {showSuggestions ? (
            <SuggestionChips
              key="suggestions"
              suggestions={SUGGESTIONS}
              onSelect={handleChip}
            />
          ) : (
            <MessageList
              key="messages"
              messages={messages}
              isLoading={isLoading}
              onBookingSubmit={handleBookingSubmit}
              onCancelConfirm={(bookingId) =>
                sendMessage({
                  role: 'user',
                  parts: [{ type: 'text', text: `Yes, cancel booking ${bookingId}` }],
                })
              }
            />
          )}
        </AnimatePresence>
      </div>

      {/* Input bar — only shown once conversation starts */}
      <AnimatePresence>
        {!showSuggestions && (
          <ChatInput
            key="chat-input"
            input={input}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            isLoading={isLoading}
            textareaRef={textareaRef}
          />
        )}
      </AnimatePresence>
    </div>
  )
}