import { useEffect, useRef } from 'react'
import type { UIMessage } from 'ai'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

export default function MessageList({
  messages,
  isLoading,
  onBookingSubmit,
  onCancelConfirm,
}: {
  messages: UIMessage[]
  isLoading: boolean
  onBookingSubmit: (data: any) => Promise<void>
  onCancelConfirm: (bookingId: string) => void
}) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div style={{
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      overscrollBehavior: 'none',
    }}>
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          onBookingSubmit={onBookingSubmit}
          onCancelConfirm={onCancelConfirm}
        />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} style={{ height: '1px' }} />
    </div>
  )
}