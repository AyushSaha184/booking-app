'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useEffect, useRef } from 'react'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import SuggestionChips from './SuggestionChips'

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

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [input])

  const handleBookingSubmit = async (formData: {
    guestName: string
    phone: string
    roomId: string
    checkIn: string
    checkOut: string
    guests: number
  }) => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    const data = await res.json()
    if (data.success) {
      const assistantMessage = {
        id: `booking-confirm-${Date.now()}`,
        role: 'assistant' as const,
        parts: [{ type: 'text' as const, text: `Your booking is confirmed! Reference: **${data.booking.id}**. We look forward to welcoming you on ${formData.checkIn}. To cancel, just come back here and say "cancel my booking" with your name and phone number.` }],
      }
      setMessages((prev: any) => [...prev, assistantMessage])
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      <header style={{
        padding: '16px 20px',
        paddingTop: 'calc(16px + env(safe-area-inset-top))',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
      }}>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>
          Resort assistant
        </p>
        <h1 style={{ fontSize: '17px', fontWeight: 500, color: 'var(--text-primary)' }}>
          How can I help you?
        </h1>
      </header>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {showSuggestions ? (
          <SuggestionChips suggestions={SUGGESTIONS} onSelect={handleChip} />
        ) : (
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onBookingSubmit={handleBookingSubmit}
            onCancelConfirm={(bookingId) => sendMessage({ role: 'user', parts: [{ type: 'text', text: `Yes, cancel booking ${bookingId}` }] })}
          />
        )}
      </div>

      {!showSuggestions && (
        <ChatInput
          input={input}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          isLoading={isLoading}
          textareaRef={textareaRef}
        />
      )}
    </div>
  )
}