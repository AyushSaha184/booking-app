export default function SuggestionChips({
  suggestions,
  onSelect,
}: {
  suggestions: { label: string; prompt: string }[]
  onSelect: (prompt: string) => void
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100%',
      padding: '40px 24px',
      gap: '32px',
    }}>
      {/* Resort logo / greeting */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--accent-muted)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '22px',
        }}>
          🏨
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
          Welcome
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '260px', lineHeight: 1.6 }}>
          I can help you book a room, check availability, or manage an existing booking.
        </p>
      </div>

      {/* Chips grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        width: '100%',
        maxWidth: '400px',
      }}>
        {suggestions.map((s) => (
          <button
            key={s.prompt}
            onClick={() => onSelect(s.prompt)}
            style={{
              padding: '14px 16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 400,
              textAlign: 'left',
              cursor: 'pointer',
              lineHeight: 1.4,
              minHeight: '52px',
              /* touch target */
              WebkitAppearance: 'none',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.background = 'var(--bg-elevated)'
              e.currentTarget.style.borderColor = 'var(--accent)'
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.background = 'var(--bg-surface)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
