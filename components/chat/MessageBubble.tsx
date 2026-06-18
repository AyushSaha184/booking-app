import type { UIMessage } from 'ai'
import BookingFormCard from '../booking/BookingFormCard'

export default function MessageBubble({
  message,
  onBookingSubmit,
  onCancelConfirm,
}: {
  message: UIMessage
  onBookingSubmit: (data: any) => Promise<void>
  onCancelConfirm: (bookingId: string) => void
}) {
  const isUser = message.role === 'user'

  const parts = message.parts || []

  // Find tool invocation part for showBookingForm
  let bookingFormArgs: any = null
  for (const part of parts) {
    if (part.type === 'tool-invocation' && (part as any).toolName === 'showBookingForm' && (part as any).state === 'call') {
      bookingFormArgs = (part as any).args
      break
    }
  }

  if (bookingFormArgs) {
    return (
      <BookingFormCard
        availableRooms={bookingFormArgs.availableRooms}
        prefill={{
          checkIn: bookingFormArgs.checkIn,
          checkOut: bookingFormArgs.checkOut,
          guests: bookingFormArgs.guests,
        }}
        onSubmit={onBookingSubmit}
      />
    )
  }

  const textPart = parts.find((part): part is { type: 'text'; text: string } => part.type === 'text')
  const content = textPart?.text ?? ''

  if (!content) return null

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '2px',
    }}>
      <div style={{
        maxWidth: '82%',
        padding: isUser ? '10px 14px' : '12px 16px',
        borderRadius: isUser
          ? 'var(--radius-md) var(--radius-md) 4px var(--radius-md)'
          : 'var(--radius-md) var(--radius-md) var(--radius-md) 4px',
        background: isUser ? 'var(--accent-muted)' : 'var(--bg-surface)',
        border: `1px solid ${isUser ? 'var(--accent)' : 'var(--border)'}`,
        fontSize: '15px',
        lineHeight: '1.55',
        color: 'var(--text-primary)',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
      }}>
        {content}
      </div>
    </div>
  )
}