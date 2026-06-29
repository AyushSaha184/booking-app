'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Phone, Search, ChevronLeft, Loader2, Calendar } from 'lucide-react'
import { checkmarkDraw, bounceIn, staggerContainer, staggerItem, transitions } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface LookupResult {
  id: string
  guestName: string
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
  status: string
}

interface CancellationFormCardProps {
  onBack: () => void
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function CancellationFormCard({ onBack }: CancellationFormCardProps) {
  const [guestName, setGuestName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'lookup' | 'confirm' | 'success'>('lookup')
  const [booking, setBooking] = useState<LookupResult | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [shake, setShake] = useState(false)

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestName.trim() || !phone.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/cancellations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lookup', guestName: guestName.trim(), phone: phone.trim() }),
      })

      const data = await res.json()

      if (!res.ok || !data.found) {
        setError(data.error ?? 'No booking found with those details.')
        triggerShake()
        return
      }

      setBooking(data.booking)
      setStep('confirm')
    } catch {
      setError('Unable to look up booking. Please try again.')
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking) return

    setCancelling(true)
    setCancelError('')

    try {
      const res = await fetch('/api/cancellations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          bookingId: booking.id,
          guestName: booking.guestName,
          phone: phone.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setCancelError(data.error ?? 'Cancellation could not be completed.')
        triggerShake()
        return
      }

      setStep('success')
    } catch {
      setCancelError('Something went wrong. Please try again.')
      triggerShake()
    } finally {
      setCancelling(false)
    }
  }

  /* ── Success state ── */
  if (step === 'success') {
    return (
      <motion.div
        variants={bounceIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-5 py-10 px-6 bg-white rounded-2xl shadow-lg border border-[#E5E7EB] max-w-[480px] mx-auto"
      >
        <div className="relative w-20 h-20">
          <motion.div
            variants={bounceIn}
            initial="hidden"
            animate="visible"
            className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center"
          >
            <svg viewBox="0 0 40 40" className="w-10 h-10" aria-hidden="true">
              <motion.path
                variants={checkmarkDraw}
                initial="hidden"
                animate="visible"
                d="M8 20 L16 28 L32 12"
                stroke="#059669"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </motion.div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-[#1F1F1F] font-bold text-xl tracking-tight">Cancellation Confirmed</p>
          <p className="text-[#6B7280] text-sm">
            Your booking has been cancelled successfully.
          </p>
          {booking && (
            <p className="mt-2 text-sm font-mono text-[#8B1538] font-semibold tracking-wider">
              Ref: {booking.id}
            </p>
          )}
        </div>

        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={transitions.spring}
          className="mt-2 flex items-center gap-2 px-6 py-3 bg-[#8B1538] text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg hover:bg-[#6E0F2A] cursor-pointer border-0 transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Menu
        </motion.button>
      </motion.div>
    )
  }

  /* ── Confirm cancellation view ── */
  if (step === 'confirm' && booking) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitions.smooth}
        className="max-w-[480px] mx-auto w-full"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] overflow-hidden">
          <div className="relative px-5 py-4 border-b border-[#F3F4F6] flex items-center gap-3">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#8B1538]/30 to-transparent" />
            <Calendar className="w-5 h-5 text-[#8B1538]" />
            <div>
              <p className="text-sm font-semibold text-[#1F1F1F]">Booking Details</p>
              <p className="text-xs text-[#6B7280]">Review before confirming cancellation</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="bg-[#FAFAF8] rounded-xl p-4 border border-[#E5E7EB] space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280] font-medium">Guest</span>
                <span className="text-[#1F1F1F] font-semibold">{booking.guestName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280] font-medium">Booking ID</span>
                <span className="text-[#8B1538] font-mono font-semibold">{booking.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280] font-medium">Room ID</span>
                <span className="text-[#1F1F1F] font-medium">{booking.roomId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280] font-medium">Check-in</span>
                <span className="text-[#1F1F1F]">{formatDate(booking.checkIn)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280] font-medium">Check-out</span>
                <span className="text-[#1F1F1F]">{formatDate(booking.checkOut)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280] font-medium">Guests</span>
                <span className="text-[#1F1F1F]">{booking.guests}</span>
              </div>
            </div>

            <p className="text-xs text-[#6B7280] text-center">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>

            {cancelError && (
              <p role="alert" className="text-xs text-[#E11D48] bg-red-50 border border-[#E11D48]/20 rounded-lg px-3 py-2">
                {cancelError}
              </p>
            )}

            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={() => { setStep('lookup'); setBooking(null) }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-[#E5E7EB] text-[#6B7280] rounded-xl font-medium text-sm hover:border-[#8B1538]/40 hover:text-[#8B1538] cursor-pointer transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                Go Back
              </motion.button>

              <motion.button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                whileHover={!cancelling ? { scale: 1.02, filter: 'brightness(0.95)' } : {}}
                whileTap={!cancelling ? { scale: 0.98 } : {}}
                transition={transitions.spring}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#E11D48] text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-0 transition-all duration-200"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling…
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  /* ── Default: lookup form ── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.smooth}
      className={cn('max-w-[480px] mx-auto w-full', shake && 'animate-shake')}
    >
      <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] overflow-hidden">
        <div className="relative px-5 py-4 border-b border-[#F3F4F6]">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#8B1538]/30 to-transparent" />
          <span className="text-sm font-semibold text-[#1F1F1F] tracking-wide">Cancel Booking</span>
        </div>

        <form onSubmit={handleLookup} className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#8B1538]/80 mb-2 flex items-center gap-1.5">
              <span className="w-1 h-3 rounded-full bg-[#8B1538]" />
              Your details
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-[#6B7280] tracking-wide uppercase">Full name</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B1538]/50 pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    autoComplete="name"
                    placeholder="As on booking"
                    className="w-full bg-[#FAFAF8] border border-[#E5E7EB] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#1F1F1F] placeholder:text-[#9CA3AF] outline-none focus:border-[#8B1538] focus:ring-2 focus:ring-[#8B1538]/10 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-[#6B7280] tracking-wide uppercase">Phone</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B1538]/50 pointer-events-none">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-[#FAFAF8] border border-[#E5E7EB] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#1F1F1F] placeholder:text-[#9CA3AF] outline-none focus:border-[#8B1538] focus:ring-2 focus:ring-[#8B1538]/10 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                role="alert"
                className="text-xs text-[#E11D48] bg-red-50 border border-[#E11D48]/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading || !guestName.trim() || !phone.trim()}
            whileHover={!loading && guestName.trim() && phone.trim() ? { scale: 1.01 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            transition={transitions.spring}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#8B1538] to-[#6E0F2A] text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-0 transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Looking up booking…
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Look Up Booking
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  )
}