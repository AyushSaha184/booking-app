'use client'

import { useMemo, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Phone, Calendar, Users, ChevronLeft, Loader2 } from 'lucide-react'
import { CreateBookingSchema } from '@/lib/validation'
import { checkmarkDraw, bounceIn, staggerContainer, staggerItem, transitions } from '@/lib/animations'
import { cn } from '@/lib/utils'
import type { Room, BookingFormData, BookingPrefill } from '@/types/booking'
import type { z } from 'zod'

type FormValues = z.infer<typeof CreateBookingSchema>

interface BookingFormCardProps {
  prefill?: BookingPrefill
  onSubmit: (data: BookingFormData) => Promise<{ success: boolean; booking?: { id: string } }>
  onBack: () => void
  availableRooms?: Room[]
  onFetchRooms?: (checkIn: string, checkOut: string) => Promise<Room[]>
}

/* ─────────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8B1538]/80 mb-2 flex items-center gap-1.5">
      <span className="w-1 h-3 rounded-full bg-[#8B1538]" />
      {children}
    </p>
  )
}

function PriceLine({
  label,
  value,
  highlight = false,
  dimmed = false,
}: {
  label: string
  value: string
  highlight?: boolean
  dimmed?: boolean
}) {
  return (
    <div className="flex justify-between items-center text-xs sm:text-sm">
      <span className={dimmed ? 'text-[#6B7280] font-medium' : 'text-[#1F1F1F]/80 font-medium'}>
        {label}
      </span>
      <span
        className={cn(
          'tabular-nums',
          highlight ? 'text-[#8B1538] font-bold text-base tracking-wide' : dimmed ? 'text-[#6B7280] font-normal' : 'text-[#1F1F1F] font-medium'
        )}
      >
        {value}
      </span>
    </div>
  )
}

/* Room card SVG placeholder — gradient tile matching room type */
function RoomImagePlaceholder({ roomType }: { roomType: string }) {
  const colors: Record<string, string> = {
    suite: 'from-amber-600 to-orange-700',
    deluxe: 'from-[#8B1538] to-[#B93C3C]',
    standard: 'from-slate-500 to-slate-700',
  }
  const cls = colors[roomType?.toLowerCase()] ?? colors.standard

  return (
    <div
      className={cn('w-20 h-14 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0', cls)}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-7 h-7 opacity-70">
        <path d="M3 21V11l9-7 9 7v10M9 21v-6h6v6" />
      </svg>
    </div>
  )
}

/* ─────────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────────── */

export default function BookingFormCard({
  prefill,
  onSubmit,
  onBack,
  availableRooms: initialRooms,
  onFetchRooms,
}: BookingFormCardProps) {
  const [submitError, setSubmitError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [bookingRef, setBookingRef] = useState('')
  const [rooms, setRooms] = useState<Room[]>(initialRooms ?? [])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [today, setToday] = useState(() => new Date().toISOString().split('T')[0])

  useEffect(() => {
    const now = new Date()
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()
    const timer = setTimeout(() => {
      setToday(new Date().toISOString().split('T')[0])
    }, msUntilMidnight)
    return () => clearTimeout(timer)
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(CreateBookingSchema),
    defaultValues: {
      guestName: '',
      phone: '',
      roomId: initialRooms?.[0]?.id ?? '',
      checkIn: prefill?.checkIn ?? '',
      checkOut: prefill?.checkOut ?? '',
      guests: prefill?.guests ?? 1,
    },
    mode: 'onBlur',
  })

  const watchedValues = watch()
  const checkIn = watchedValues.checkIn
  const checkOut = watchedValues.checkOut

  // Auto-fetch rooms when dates change (if parent provides a fetcher and no initial rooms)
  useEffect(() => {
    if (!onFetchRooms || initialRooms || !checkIn || !checkOut) return
    const timer = setTimeout(async () => {
      setLoadingRooms(true)
      try {
        const fetched = await onFetchRooms(checkIn, checkOut)
        setRooms(fetched)
        if (fetched.length > 0) setValue('roomId', fetched[0].id)
      } finally {
        setLoadingRooms(false)
      }
    }, 400) // debounce
    return () => clearTimeout(timer)
  }, [checkIn, checkOut, onFetchRooms, initialRooms, setValue])

  const priceSummary = useMemo(() => {
    const room = rooms.find((r) => r.id === watchedValues.roomId)
    const nights =
      watchedValues.checkIn && watchedValues.checkOut
        ? Math.max(0, Math.round((new Date(watchedValues.checkOut).getTime() - new Date(watchedValues.checkIn).getTime()) / 86_400_000))
        : 0
    const subtotal = room && nights > 0 ? nights * room.pricePerNight : 0
    const tax = Math.round(subtotal * 0.12)
    const total = subtotal + tax
    return { room, nights, subtotal, tax, total }
  }, [watchedValues.roomId, watchedValues.checkIn, watchedValues.checkOut, rooms])

  const onFormSubmit = async (data: FormValues) => {
    setSubmitError('')
    try {
      const result = await onSubmit(data)
      if (result.success && result.booking) {
        setBookingRef(result.booking.id)
        setConfirmed(true)
      } else {
        throw new Error('Booking could not be confirmed. Please try again.')
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  /* ── Success state ── */
  if (confirmed) {
    return (
      <motion.div
        variants={bounceIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-5 py-10 px-6 bg-white rounded-2xl shadow-lg border border-[#E5E7EB] max-w-[540px] mx-auto"
      >
        {/* Animated checkmark */}
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

        {/* Text */}
        <div className="text-center space-y-1">
          <p className="text-[#1F1F1F] font-bold text-xl tracking-tight">Booking Confirmed!</p>
          <p className="text-[#6B7280] text-sm">
            Your reservation is confirmed. We look forward to welcoming you.
          </p>
          {bookingRef && (
            <p className="mt-3 text-sm font-mono text-[#8B1538] font-semibold tracking-wider">
              Ref: {bookingRef}
            </p>
          )}
        </div>

        {/* Back button */}
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

  /* ── Form ── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.smooth}
      className="overflow-hidden max-w-[540px] mx-auto w-full"
    >
      <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB]">
        {/* Header */}
        <div className="relative px-5 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#8B1538]/30 to-transparent" />
          <span className="text-sm font-semibold text-[#1F1F1F] tracking-wide">Reserve Your Stay</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#8B1538]/8 text-[#8B1538] font-medium border border-[#8B1538]/20">
            {loadingRooms ? 'Loading...' : `${rooms.length} room${rooms.length !== 1 ? 's' : ''} available`}
          </span>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
          <div className="p-5 flex flex-col gap-5">

            {/* ── Guest Details ── */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <SectionLabel>Guest details</SectionLabel>
              <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-[#6B7280] tracking-wide uppercase">Full name</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B1538]/50 pointer-events-none">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      {...register('guestName')}
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      className={cn(
                        'w-full bg-[#FAFAF8] border rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#1F1F1F] placeholder:text-[#9CA3AF] outline-none transition-all duration-200',
                        errors.guestName
                          ? 'border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/20'
                          : 'border-[#E5E7EB] focus:border-[#8B1538] focus:ring-2 focus:ring-[#8B1538]/10'
                      )}
                    />
                  </div>
                  {errors.guestName && <p className="text-xs text-[#E11D48]">{errors.guestName.message}</p>}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-[#6B7280] tracking-wide uppercase">Phone</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B1538]/50 pointer-events-none">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      {...register('phone')}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+91 XXXXX XXXXX"
                      className={cn(
                        'w-full bg-[#FAFAF8] border rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#1F1F1F] placeholder:text-[#9CA3AF] outline-none transition-all duration-200',
                        errors.phone
                          ? 'border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/20'
                          : 'border-[#E5E7EB] focus:border-[#8B1538] focus:ring-2 focus:ring-[#8B1538]/10'
                      )}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-[#E11D48]">{errors.phone.message}</p>}
                </div>
              </motion.div>
            </motion.div>

            {/* ── Stay Dates ── */}
            <motion.div variants={staggerItem} initial="hidden" animate="show">
              <SectionLabel>Stay details</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-[#6B7280] tracking-wide uppercase">Check-in</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B1538]/50 pointer-events-none">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      {...register('checkIn')}
                      type="date"
                      min={today}
                      className={cn(
                        'w-full bg-[#FAFAF8] border rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#1F1F1F] outline-none transition-all duration-200 appearance-none',
                        errors.checkIn
                          ? 'border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/20'
                          : 'border-[#E5E7EB] focus:border-[#8B1538] focus:ring-2 focus:ring-[#8B1538]/10'
                      )}
                    />
                  </div>
                  {errors.checkIn && <p className="text-xs text-[#E11D48]">{errors.checkIn.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-[#6B7280] tracking-wide uppercase">Check-out</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B1538]/50 pointer-events-none">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      {...register('checkOut')}
                      type="date"
                      min={watchedValues.checkIn || today}
                      className={cn(
                        'w-full bg-[#FAFAF8] border rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#1F1F1F] outline-none transition-all duration-200 appearance-none',
                        errors.checkOut
                          ? 'border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/20'
                          : 'border-[#E5E7EB] focus:border-[#8B1538] focus:ring-2 focus:ring-[#8B1538]/10'
                      )}
                    />
                  </div>
                  {errors.checkOut && <p className="text-xs text-[#E11D48]">{errors.checkOut.message}</p>}
                </div>
              </div>

              {/* Guests stepper */}
              <div className="flex items-center gap-3 mt-3">
                <input type="hidden" {...register('guests', { valueAsNumber: true })} />
                <span className="text-[11px] font-medium text-[#6B7280] tracking-wide uppercase w-14">Guests</span>
                <button
                  type="button"
                  onClick={() => { const curr = watchedValues.guests ?? 1; if (curr > 1) setValue('guests', curr - 1) }}
                  className="w-9 h-9 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] grid place-items-center text-[#1F1F1F] hover:border-[#8B1538] transition-colors cursor-pointer text-base font-medium"
                >
                  −
                </button>
                <span className="text-sm font-semibold text-[#1F1F1F] min-w-[2ch] text-center">
                  {watchedValues.guests}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const curr = watchedValues.guests ?? 1
                    const max = priceSummary.room?.capacity ?? 10
                    if (curr < max) setValue('guests', curr + 1)
                  }}
                  className="w-9 h-9 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] grid place-items-center text-[#1F1F1F] hover:border-[#8B1538] transition-colors cursor-pointer text-base font-medium"
                >
                  +
                </button>
                <span className="text-xs text-[#6B7280] ml-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Max {priceSummary.room?.capacity ?? 10}
                </span>
                {errors.guests && <p className="text-xs text-[#E11D48]">{errors.guests.message}</p>}
              </div>
            </motion.div>

            {/* ── Room Selection ── */}
            {rooms.length > 0 && (
              <motion.div variants={staggerItem} initial="hidden" animate="show">
                <SectionLabel>Select a room</SectionLabel>
                <div className="flex flex-col gap-2.5">
                  {rooms.map((room) => {
                    const isSelected = watchedValues.roomId === room.id
                    return (
                      <label
                        key={room.id}
                        className={cn(
                          'flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all duration-200',
                          isSelected
                            ? 'border-[#8B1538] bg-[#8B1538]/4 shadow-sm ring-1 ring-[#8B1538]/20'
                            : 'border-[#E5E7EB] hover:border-[#8B1538]/40 bg-[#FAFAF8] hover:bg-white'
                        )}
                      >
                        <input type="radio" value={room.id} className="sr-only" {...register('roomId')} />
                        <RoomImagePlaceholder roomType={room.type} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1F1F1F] truncate leading-snug">{room.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md border font-semibold uppercase tracking-wider bg-[#8B1538]/8 text-[#8B1538] border-[#8B1538]/20">
                              {room.type}
                            </span>
                            <span className="text-xs text-[#6B7280]">· Max {room.capacity} guests</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right self-start pl-2">
                          <p className="text-sm font-bold text-[#8B1538] tabular-nums leading-snug">
                            ₹{room.pricePerNight.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-[#6B7280] font-medium leading-none mt-0.5">/night</p>
                        </div>
                      </label>
                    )
                  })}
                  {errors.roomId && <p className="text-xs text-[#E11D48]">{errors.roomId.message}</p>}
                </div>
              </motion.div>
            )}

            {/* ── Price Summary ── */}
            <AnimatePresence>
              {priceSummary.nights > 0 && priceSummary.room && (
                <motion.div
                  key="price-summary"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="bg-[#FAFAF8] border border-[#E5E7EB] rounded-xl p-4 flex flex-col gap-2.5">
                    <SectionLabel>Price summary</SectionLabel>
                    <PriceLine
                      label={`${priceSummary.nights} night${priceSummary.nights !== 1 ? 's' : ''} × ₹${priceSummary.room.pricePerNight.toLocaleString('en-IN')}`}
                      value={`₹${priceSummary.subtotal.toLocaleString('en-IN')}`}
                    />
                    <PriceLine label="Taxes (12%)" value={`₹${priceSummary.tax.toLocaleString('en-IN')}`} dimmed />
                    <div className="h-px border-b border-dashed border-[#8B1538]/20 my-1" aria-hidden="true" />
                    <PriceLine label="Total Amount" value={`₹${priceSummary.total.toLocaleString('en-IN')}`} highlight />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Error ── */}
            {submitError && (
              <p role="alert" className="text-xs text-[#E11D48] bg-red-50 border border-[#E11D48]/20 rounded-lg px-3 py-2">
                {submitError}
              </p>
            )}

            {/* ── Submit ── */}
            <motion.button
              type="submit"
              disabled={isSubmitting || loadingRooms}
              whileHover={!isSubmitting && !loadingRooms ? { scale: 1.01, filter: 'brightness(1.05)' } : {}}
              whileTap={!isSubmitting && !loadingRooms ? { scale: 0.98 } : {}}
              transition={transitions.spring}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#8B1538] to-[#6E0F2A] text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-0 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Confirming…
                </>
              ) : (
                'Confirm booking'
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}