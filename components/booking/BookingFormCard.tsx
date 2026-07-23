import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { User, ChevronLeft, Loader2, BedDouble, Calendar, Check, Phone, AlertCircle, MessageCircle, Clock, Copy, ShieldAlert } from 'lucide-react'
import DatePicker from '@/components/ui/DatePicker'
import { CreateMultiBookingSchema } from '@/lib/validation'
import { checkmarkDraw, bounceIn } from '@/lib/animations'
import { cn } from '@/lib/utils'
import type { Room, BookingFormData, BookingPrefill, BookingResult } from '@/types/booking'
import type { z } from 'zod'

type FormValues = z.infer<typeof CreateMultiBookingSchema>

interface BookingFormCardProps {
  prefill?: BookingPrefill
  onSubmit: (data: BookingFormData) => Promise<BookingResult>
  onBack: () => void
  onFetchRooms?: (checkIn: string, checkOut: string) => Promise<Room[]>
}

/* ── Shared helper badges ────────────────────────── */
function RoomTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    suite: 'bg-amber-50 text-amber-700 border-amber-200',
    deluxe: 'bg-accent/5 text-accent border-accent/15',
    standard: 'bg-gray-100 text-gray-600 border-gray-200',
  }
  return (
    <span className={cn(
      'px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize',
      styles[type?.toLowerCase()] ?? styles.standard
    )}>
      {type}
    </span>
  )
}

export default function BookingFormCard({
  prefill,
  onSubmit,
  onBack,
  onFetchRooms,
}: BookingFormCardProps) {
  /* ── Fast Refresh (HMR) local style classes mapped to theme colors ── */
  const inputWrapCls =
    'flex items-center bg-[#FAFAF9] border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 focus-within:bg-white focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/5'

  const iconCls = 'w-11 h-11 flex items-center justify-center border-r border-gray-200 shrink-0 text-accent transition-colors focus-within:border-accent'

  const inputCls =
    'flex-1 h-11 px-3 bg-transparent text-base text-gray-900 outline-none placeholder:text-[#C37A8C]/50'

  const OWNER_PHONE = '+917679081423'
  const OWNER_PHONE_DISPLAY = '+91 76790 81423'

  const [submitError, setSubmitError] = useState('')
  const [bookingStatus, setBookingStatus] = useState<'form' | 'pending_payment' | 'confirmed' | 'declined'>('form')
  const [bookingRef, setBookingRef] = useState('')
  const [bookingCount, setBookingCount] = useState(0)
  const [copiedPhone, setCopiedPhone] = useState(false)
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [roomsError, setRoomsError] = useState('')
  const [today] = useState(() => new Date().toISOString().split('T')[0])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(CreateMultiBookingSchema),
    defaultValues: {
      guestName: '',
      phone: '',
      roomIds: [],
      checkIn: prefill?.checkIn || new Date().toISOString().split('T')[0],
      checkOut: prefill?.checkOut || (() => {
        const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]
      })(),
    },
    mode: 'onBlur',
  })

  const checkIn = watch('checkIn')
  const checkOut = watch('checkOut')
  const roomIds = watch('roomIds') ?? []

  /* ── Fetch available rooms whenever dates change ── */
  useEffect(() => {
    if (!checkIn || !checkOut) return
    const inDate = new Date(checkIn)
    const outDate = new Date(checkOut)
    if (outDate <= inDate) return

    const timer = setTimeout(async () => {
      setLoadingRooms(true)
      setRoomsError('')
      setValue('roomIds', [])   // clear stale selection
      try {
        let fetched: Room[]
        if (onFetchRooms) {
          fetched = await onFetchRooms(checkIn, checkOut)
        } else {
          const res = await fetch(`/api/rooms?checkIn=${checkIn}&checkOut=${checkOut}`)
          if (!res.ok) throw new Error('Failed to load rooms')
          fetched = await res.json()
        }
        setRooms(fetched)
        if (fetched.length === 0) setRoomsError('No rooms are available for the selected dates.')
      } catch {
        setRoomsError('Could not load available rooms. Please try again.')
        setRooms([])
      } finally {
        setLoadingRooms(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [checkIn, checkOut, onFetchRooms, setValue])

  /* ── Status Polling Effect ──────────────────────── */
  useEffect(() => {
    if (bookingStatus !== 'pending_payment' || !bookingRef) return

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/bookings/status?id=${bookingRef}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.success && data.booking) {
          if (data.booking.status === 'confirmed') {
            setBookingStatus('confirmed')
          } else if (data.booking.status === 'cancelled') {
            setBookingStatus('declined')
          }
        }
      } catch (err) {
        console.error('Status poll error:', err)
      }
    }, 3000)

    return () => clearInterval(pollInterval)
  }, [bookingStatus, bookingRef])

  /* ── Toggle room selection ──────────────────────── */
  const toggleRoom = (id: string) => {
    const current = roomIds ?? []
    if (current.includes(id)) {
      setValue('roomIds', current.filter(r => r !== id), { shouldValidate: true })
    } else {
      setValue('roomIds', [...current, id], { shouldValidate: true })
    }
  }

  /* ── Price calculation ──────────────────────────── */
  const selectedRooms = rooms.filter(r => roomIds.includes(r.id))
  const total = selectedRooms.length * 5000

  /* ── Submit ─────────────────────────────────────── */
  const onFormSubmit = async (data: FormValues) => {
    if (data.roomIds.length === 0) {
      setSubmitError('Please select at least one room before confirming.')
      return
    }
    setSubmitError('')
    try {
      const result = await onSubmit({ ...data } as unknown as BookingFormData)
      if (result.success && result.booking) {
        setBookingRef(result.booking.id)
        setBookingCount(data.roomIds.length)
        setSubmittedData(data)
        setBookingStatus('pending_payment')
      } else {
        throw new Error('Booking could not be created. Please try again.')
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText(OWNER_PHONE_DISPLAY)
    setCopiedPhone(true)
    setTimeout(() => setCopiedPhone(false), 2000)
  }

  /* ── PENDING PAYMENT SCREEN ─────────────────────── */
  if (bookingStatus === 'pending_payment') {
    const waText = encodeURIComponent(
      `Hi! I have placed a booking request (Booking ID: ${bookingRef}) for ${submittedData?.guestName || 'Guest'} (${bookingCount} room${bookingCount > 1 ? 's' : ''}, ${submittedData?.checkIn} to ${submittedData?.checkOut}). I would like to complete the payment to confirm my reservation.`
    )
    const waUrl = `https://wa.me/${OWNER_PHONE.replace('+', '')}?text=${waText}`

    return (
      <motion.div
        variants={bounceIn}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl mx-auto space-y-6"
      >
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6 sm:p-8 flex flex-col items-center text-center space-y-6">
          
          {/* Header Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Pending Payment Verification
          </div>

          {/* Title block */}
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-gray-900 leading-snug">
              Call Owner to Complete Booking
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md leading-relaxed">
              Your booking request is received! Please call or message the hotel owner at the number below to complete your payment.
            </p>
          </div>

          {/* Owner Phone Card */}
          <div className="w-full bg-[#FAFAF9] border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-accent/10 grid place-items-center shrink-0">
                <Phone className="w-5 h-5 text-accent" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Hotel Owner Contact</span>
                <span className="text-lg font-bold font-mono text-gray-900">{OWNER_PHONE_DISPLAY}</span>
              </div>
            </div>

            <button
              onClick={copyPhoneNumber}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
            >
              {copiedPhone ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
              {copiedPhone ? 'Copied' : 'Copy Number'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <a
              href={`tel:${OWNER_PHONE}`}
              className="h-12 rounded-xl bg-accent text-white text-sm font-semibold shadow-md hover:bg-brand-red-hover transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call Owner Now
            </a>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Message on WhatsApp
            </a>
          </div>

          {/* Live Status Poller Radar Bar */}
          <div className="w-full pt-4 border-t border-gray-100 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="w-4 h-4 text-accent animate-spin" />
              <span>Waiting for owner to confirm payment in Google Sheet...</span>
            </div>

            {/* Booking Details Summary */}
            <div className="w-full bg-gray-50 rounded-xl p-3.5 border border-gray-100 flex flex-wrap items-center justify-between gap-2 text-left">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Booking ID</span>
                <span className="text-xs font-mono font-bold text-accent">{bookingRef}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Reserved Rooms</span>
                <span className="text-xs font-semibold text-gray-800">{bookingCount} Room{bookingCount > 1 ? 's' : ''}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Guest</span>
                <span className="text-xs font-semibold text-gray-800">{submittedData?.guestName}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onBack}
            className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors pt-2"
          >
            Cancel & Return Home
          </button>
        </div>
      </motion.div>
    )
  }

  /* ── DECLINED SCREEN ───────────────────────────── */
  if (bookingStatus === 'declined') {
    return (
      <motion.div
        variants={bounceIn}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md mx-auto bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center space-y-6"
      >
        <div className="w-20 h-20 rounded-full bg-red-50 grid place-items-center mx-auto">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif text-gray-900 font-bold">Booking Declined</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            The booking request was not confirmed by the hotel owner. Please try selecting different dates or contact support.
          </p>
        </div>
        <button
          onClick={onBack}
          className="w-full h-12 rounded-xl bg-accent text-white text-sm font-semibold shadow-md hover:bg-brand-red-hover transition-all"
        >
          Return Home
        </button>
      </motion.div>
    )
  }

  /* ── CONFIRMED SCREEN ──────────────────────────── */
  if (bookingStatus === 'confirmed') {
    return (
      <motion.div
        variants={bounceIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-6 py-12 px-8 bg-white rounded-2xl border border-gray-200 shadow-lg w-full max-w-lg mx-auto text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-green-100 grid place-items-center"
        >
          <svg viewBox="0 0 40 40" className="w-12 h-12">
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
        <div className="space-y-2">
          <p className="text-2xl font-serif text-gray-900">Booking Confirmed!</p>
          <p className="text-sm text-gray-600">
            {bookingCount > 1
              ? `${bookingCount} rooms have been reserved. We look forward to welcoming you.`
              : 'Your reservation is confirmed. We look forward to welcoming you.'}
          </p>
          {bookingRef ? (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center gap-2 max-w-sm mx-auto">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Booking ID
              </span>
              <span className="px-3 py-1 bg-accent/5 border border-accent/15 rounded-lg text-sm font-mono text-accent font-semibold tracking-wider">
                {bookingRef}
              </span>
            </div>
          ) : null}
        </div>
        <button
          onClick={onBack}
          className="mt-4 flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium shadow-md hover:bg-brand-red-hover transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Return Home
        </button>
      </motion.div>
    )
  }

  /* ── Main form ─────────────────────────────────── */
  /* ── Main form ─────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto max-w-[56rem] px-1"
    >
      {/* Title block */}
      <div className="text-left px-1 space-y-0.5 mb-4">
        <h2 className="font-serif text-2xl font-semibold text-gray-900 leading-tight">
          Reserve <span className="text-accent">Your Stay</span>
        </h2>
        <p className="text-xs text-gray-400">Fill in your details to secure a room</p>
      </div>

      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-5 sm:p-8 flex flex-col gap-6"
      >
        {/* ─── GUEST DETAILS ─── */}
        <section className="flex flex-col gap-4">
          <h3 className="flex items-center gap-2 text-[11px] font-bold text-accent uppercase tracking-wider">
            <User className="w-3.5 h-3.5" />
            Guest Details
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="block text-[13px] font-semibold text-gray-800">Full Name</label>
            <div className={inputWrapCls}>
              <span className={iconCls}><User className="w-4 h-4" /></span>
              <input
                type="text"
                placeholder="John Doe"
                {...register('guestName')}
                className={inputCls}
              />
            </div>
            {errors.guestName && <p className="text-xs text-red-600 pl-1">⚠ {errors.guestName.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="block text-[13px] font-semibold text-gray-800">Phone Number</label>
            <div className={inputWrapCls}>
              <span className={iconCls}><Phone className="w-4 h-4" /></span>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                {...register('phone')}
                className={inputCls}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-600 pl-1">⚠ {errors.phone.message}</p>}
          </div>
        </section>

        <div className="border-t border-gray-100" />

        {/* ─── STAY DETAILS ─── */}
        <section className="flex flex-col gap-4">
          <h3 className="flex items-center gap-2 text-[11px] font-bold text-accent uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            Stay Details
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="block text-[13px] font-semibold text-gray-800">Check-in</label>
              <DatePicker
                value={checkIn}
                onChange={(val) => setValue('checkIn', val, { shouldValidate: true })}
                min={today}
                placeholder="dd/mm/yyyy"
                align="left"
              />
              {errors.checkIn && <p className="text-xs text-red-600 pl-1">⚠ {errors.checkIn.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="block text-[13px] font-semibold text-gray-800">Check-out</label>
              <DatePicker
                value={checkOut}
                onChange={(val) => setValue('checkOut', val, { shouldValidate: true })}
                min={checkIn || today}
                placeholder="dd/mm/yyyy"
                align="right"
              />
              {errors.checkOut && <p className="text-xs text-red-600 pl-1">⚠ {errors.checkOut.message}</p>}
            </div>
          </div>
        </section>

        <div className="border-t border-gray-100" />

        {/* ─── CHOOSE YOUR ROOMS ─── */}
        <section className="flex flex-col gap-4">
          <h3 className="flex items-center gap-2 text-[11px] font-bold text-accent uppercase tracking-wider">
            <BedDouble className="w-3.5 h-3.5" />
            Choose Your Room{roomIds.length > 1 ? 's' : ''}
            {rooms.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-accent/10 text-accent text-[10px] rounded-full normal-case font-semibold">
                {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available
              </span>
            )}
            {roomIds.length > 0 && (
              <span className="ml-auto px-2 py-0.5 bg-green-50 text-green-700 text-[10px] rounded-full font-semibold border border-green-200">
                {roomIds.length} selected
              </span>
            )}
          </h3>

          {!checkIn || !checkOut || new Date(checkOut) <= new Date(checkIn) ? (
            <div className="border border-dashed border-gray-200 bg-[#FAFAF9]/60 rounded-xl py-6 px-4 flex items-center justify-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-400 font-medium">Pick your dates above to see available rooms</span>
            </div>
          ) : null}

          {loadingRooms && (
            <div className="border border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 text-accent animate-spin" />
              <p className="text-xs text-gray-500">Searching available rooms...</p>
            </div>
          )}

          {roomsError && !loadingRooms && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800">{roomsError}</p>
            </div>
          )}

          {errors.roomIds && (
            <p className="text-xs text-red-600 pl-1">⚠ {errors.roomIds.message}</p>
          )}

          {rooms.length > 0 && !loadingRooms && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3">
                {rooms.map((room) => {
                  const isSelected = roomIds.includes(room.id)
                  return (
                    <motion.button
                      key={room.id}
                      type="button"
                      onClick={() => toggleRoom(room.id)}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        'relative flex items-center gap-4 bg-white rounded-xl border-2 p-3.5 transition-all text-left cursor-pointer',
                        isSelected
                          ? 'border-accent ring-4 ring-accent/5 shadow-sm bg-accent/[0.02]'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                        isSelected ? 'bg-accent border-accent' : 'border-gray-300 bg-white'
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-semibold text-[13px] text-gray-900 truncate">{room.name}</h4>
                          <RoomTypeBadge type={room.type} />
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Capacity: {room.capacity} {room.capacity === 1 ? 'guest' : 'guests'}
                          {room.description ? ` · ${room.description}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-bold text-accent">
                          ₹{room.pricePerNight.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-gray-400">/ night</p>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {selectedRooms.length > 0 && (
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Price Summary</h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>{selectedRooms.length} Room{selectedRooms.length > 1 ? 's' : ''} × ₹5,000 / night</span>
                      <span className="font-semibold text-gray-700">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
                      <span>Total (per night)</span>
                      <span className="text-accent">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {submitError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-800">{submitError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || loadingRooms || roomIds.length === 0}
          className="w-full h-12 rounded-xl bg-accent text-white text-sm font-semibold shadow-[0_4px_12px_rgba(124,26,54,0.18)] hover:bg-brand-red-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
          ) : roomIds.length > 1
            ? `Confirm ${roomIds.length} Rooms`
            : 'Confirm Booking'}
        </button>
        {roomIds.length === 0 && rooms.length > 0 && !loadingRooms && (
          <p className="text-center text-[11px] text-gray-400 -mt-3">Select at least one room to continue</p>
        )}
      </form>
    </motion.div>
  )
}