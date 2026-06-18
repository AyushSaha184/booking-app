'use client'

import { useState } from 'react'

type Room = { id: string; name: string; type: string; capacity: number; pricePerNight: number }

export default function BookingFormCard({
  availableRooms,
  prefill,
  onSubmit,
}: {
  availableRooms: Room[]
  prefill: { checkIn?: string; checkOut?: string; guests?: number }
  onSubmit: (data: any) => Promise<void>
}) {
  const [form, setForm] = useState({
    guestName: '',
    phone: '',
    roomId: availableRooms[0]?.id ?? '',
    checkIn: prefill.checkIn ?? '',
    checkOut: prefill.checkOut ?? '',
    guests: prefill.guests ?? 1,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedRoom = availableRooms.find(r => r.id === form.roomId)
  const nights = form.checkIn && form.checkOut
    ? Math.max(0, Math.round((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / 86400000))
    : 0
  const total = selectedRoom ? nights * selectedRoom.pricePerNight : 0

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    if (!form.guestName || !form.phone || !form.checkIn || !form.checkOut || !form.roomId) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSubmit(form)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 13px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '16px',   /* iOS zoom prevention */
    fontFamily: 'inherit',
    outline: 'none',
    WebkitAppearance: 'none',
    appearance: 'none',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    display: 'block',
    fontWeight: 500,
    letterSpacing: '0.02em',
  }

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      marginBottom: '8px',
    }}>
      {/* Card header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
          Booking details
        </span>
        <span style={{
          fontSize: '11px',
          padding: '3px 8px',
          borderRadius: '20px',
          background: 'rgba(92, 168, 130, 0.12)',
          color: 'var(--success)',
          fontWeight: 500,
        }}>
          {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available
        </span>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Name + Phone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Full name</label>
            <input
              type="text"
              placeholder="Your name"
              value={form.guestName}
              onChange={e => set('guestName', e.target.value)}
              style={inputStyle}
              autoComplete="name"
            />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              style={inputStyle}
              autoComplete="tel"
              inputMode="tel"
            />
          </div>
        </div>

        {/* Room selector */}
        <div>
          <label style={labelStyle}>Room</label>
          <select
            value={form.roomId}
            onChange={e => set('roomId', e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {availableRooms.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} — ₹{r.pricePerNight.toLocaleString('en-IN')}/night
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Check-in</label>
            <input
              type="date"
              value={form.checkIn}
              onChange={e => set('checkIn', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Check-out</label>
            <input
              type="date"
              value={form.checkOut}
              onChange={e => set('checkOut', e.target.value)}
              min={form.checkIn || new Date().toISOString().split('T')[0]}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Guests stepper */}
        <div>
          <label style={labelStyle}>Guests</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => set('guests', Math.max(1, form.guests - 1))}
              style={{
                width: '36px', height: '36px', minWidth: '44px', minHeight: '44px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >−</button>
            <span style={{ fontSize: '16px', fontWeight: 500, minWidth: '24px', textAlign: 'center' }}>
              {form.guests}
            </span>
            <button
              onClick={() => set('guests', Math.min(selectedRoom?.capacity ?? 10, form.guests + 1))}
              style={{
                width: '36px', height: '36px', minWidth: '44px', minHeight: '44px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >+</button>
          </div>
        </div>

        {/* Price summary */}
        {nights > 0 && selectedRoom && (
          <div style={{
            padding: '12px 14px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {nights} night{nights !== 1 ? 's' : ''} × ₹{selectedRoom.pricePerNight.toLocaleString('en-IN')}
              </span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Taxes (12%)</span>
              <span style={{ color: 'var(--text-tertiary)' }}>
                ₹{Math.round(total * 0.12).toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{
              height: '1px', background: 'var(--border)', margin: '2px 0',
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Total</span>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                ₹{Math.round(total * 1.12).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p style={{ fontSize: '13px', color: 'var(--danger)' }}>{error}</p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex: 1,
              padding: '13px',
              background: loading ? 'var(--bg-elevated)' : 'var(--accent)',
              color: loading ? 'var(--text-tertiary)' : '#0f0f0f',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              fontFamily: 'inherit',
              minHeight: '48px',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Confirming…' : 'Confirm booking'}
          </button>
        </div>

      </div>
    </div>
  )
}
