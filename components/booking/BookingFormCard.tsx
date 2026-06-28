'use client'

import { useMemo, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Phone, Calendar, Users } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { AnimatedInput } from '@/components/ui/AnimatedInput'
import { CreateBookingSchema } from '@/lib/validation'
import { bounceIn, checkmarkDraw } from '@/lib/animations'
import { cn } from '@/lib/utils'
import type { Room, BookingFormData, BookingPrefill } from '@/types/booking'
import type { z } from 'zod'

type FormValues = z.infer<typeof CreateBookingSchema>

interface BookingFormCardProps {
  availableRooms: Room[]
  prefill: BookingPrefill
  onSubmit: (data: BookingFormData) => Promise<void>
}

// ---------- Sub-components ----------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-wider text-[#B93C3C]/80 mb-2.5 flex items-center gap-1.5">
      <span className="w-1 h-3 rounded-full bg-[#B93C3C]" />
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
      <span className={dimmed ? 'text-[rgba(150,60,60,0.6)] font-medium' : 'text-[#2A1A1A]/80 font-medium'}>{label}</span>
      <span
        className={cn(
          'tabular-nums',
          highlight ? 'text-[#B93C3C] font-bold text-base tracking-wide' : dimmed ? 'text-[rgba(150,60,60,0.6)] font-normal' : 'text-[#2A1A1A] font-medium'
        )}
      >
        {value}
      </span>
    </div>
  )
}

function getRoomColorClass(roomType: string) {
  const type = roomType.toLowerCase()
  if (type.includes('suite')) return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25'
  if (type.includes('deluxe')) return 'bg-[#B93C3C]/10 text-[#B93C3C] border-[#B93C3C]/20'
  if (type.includes('penthouse') || type.includes('presidential')) return 'bg-purple-500/10 text-purple-700 border-purple-500/25'
  return 'bg-amber-500/10 text-amber-800 border-amber-500/25'
}

// ---------- Main component ----------

export default function BookingFormCard({
  availableRooms,
  prefill,
  onSubmit,
}: BookingFormCardProps) {
  const [submitError, setSubmitError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
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
      roomId: availableRooms[0]?.id ?? '',
      checkIn: prefill.checkIn ?? '',
      checkOut: prefill.checkOut ?? '',
      guests: prefill.guests ?? 1,
    },
    mode: 'onBlur',
  })

  const watchedValues = watch()

  // Price summary (real-time, memoized)
  const priceSummary = useMemo(() => {
    const room = availableRooms.find((r) => r.id === watchedValues.roomId)
    const nights =
      watchedValues.checkIn && watchedValues.checkOut
        ? Math.max(
            0,
            Math.round(
              (new Date(watchedValues.checkOut).getTime() -
                new Date(watchedValues.checkIn).getTime()) /
                86_400_000
            )
          )
        : 0
    const subtotal = room && nights > 0 ? nights * room.pricePerNight : 0
    const tax = Math.round(subtotal * 0.12)
    const total = subtotal + tax
    return { room, nights, subtotal, tax, total }
  }, [watchedValues.roomId, watchedValues.checkIn, watchedValues.checkOut, availableRooms])

  const onFormSubmit = async (data: FormValues) => {
    setSubmitError('')
    let success = false
    try {
      await onSubmit(data)
      success = true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setSubmitError(message)
    }
    if (success) {
      setConfirmed(true)
    }
  }

  // ── Success state ──
  if (confirmed) {
    return (
      <motion.div
        variants={bounceIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-4 py-8 px-4 bg-[rgba(255,255,255,0.75)] backdrop-blur-md border border-[rgba(185,60,60,0.2)] rounded-2xl max-w-[540px] mx-auto"
      >
        <div className="relative w-16 h-16">
          <motion.div
            variants={bounceIn}
            initial="hidden"
            animate="visible"
            className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center"
          >
            <svg viewBox="0 0 40 40" className="w-8 h-8" aria-hidden="true">
              <motion.path
                variants={checkmarkDraw}
                initial="hidden"
                animate="visible"
                d="M8 20 L16 28 L32 12"
                stroke="#059669"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </motion.div>
        </div>
        <div className="text-center">
          <p className="text-[#2A1A1A] font-semibold text-base">Booking confirmed!</p>
          <p className="text-[rgba(80,40,40,0.65)] text-sm mt-1">
            We look forward to hosting your luxurious stay.
          </p>
        </div>
      </motion.div>
    )
  }

  // ── Form ──
  return (
    <GlassCard
      variant="elevated"
      topHighlight
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="overflow-hidden mb-4 max-w-[540px] mx-auto border-[rgba(185,60,60,0.2)] bg-[rgba(255,255,255,0.85)]"
    >
      {/* Header with crimson line */}
      <div className="relative px-4 py-3.5 bg-[rgba(185,60,60,0.04)] border-b border-[rgba(185,60,60,0.15)] flex items-center justify-between">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#B93C3C] to-transparent" />
        <span className="text-sm font-semibold text-[#2A1A1A] tracking-wide">Reservation Details</span>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#B93C3C]/10 text-[#B93C3C] font-medium border border-[#B93C3C]/20">
          {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available
        </span>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
        <div className="p-4 flex flex-col gap-4">

          {/* ── Guest Details ── */}
          <div>
            <SectionLabel>Guest details</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AnimatedInput
                label="Full name"
                placeholder="Your name"
                autoComplete="name"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.guestName?.message}
                {...register('guestName')}
              />
              <AnimatedInput
                label="Phone"
                type="tel"
                inputMode="tel"
                placeholder="+91 XXXXX XXXXX"
                autoComplete="tel"
                leftIcon={<Phone className="w-4 h-4" />}
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
          </div>

          {/* ── Room Selection ── */}
          <div>
            <SectionLabel>Room Selection</SectionLabel>
            <div className="flex flex-col gap-2">
              {availableRooms.map((room) => {
                const isSelected = watchedValues.roomId === room.id
                return (
                  <label
                    key={room.id}
                    className={cn(
                      'flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer',
                      'transition-all duration-200',
                      isSelected
                        ? 'border-[#B93C3C] bg-[#B93C3C]/5 shadow-xs ring-1 ring-[#B93C3C]/20'
                        : 'border-[rgba(185,60,60,0.15)] hover:border-[rgba(185,60,60,0.3)] bg-white/60 hover:bg-white/90'
                    )}
                  >
                    <input
                      type="radio"
                      value={room.id}
                      className="sr-only"
                      {...register('roomId')}
                    />
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border grid place-items-center shrink-0 mt-0.5 transition-all duration-200',
                        isSelected ? 'border-[#B93C3C]' : 'border-[rgba(185,60,60,0.3)]'
                      )}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-[#B93C3C]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#2A1A1A] truncate leading-snug">{room.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={cn('text-[9px] px-1.5 py-0.5 rounded-md border font-semibold uppercase tracking-wider inline-flex items-center leading-none', getRoomColorClass(room.type))}>
                          {room.type}
                        </span>
                        <span className="text-xs text-[#2A1A1A]/60 font-medium inline-flex items-center leading-none">
                          · Max {room.capacity} guests
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right self-start pl-2">
                      <p className="text-sm sm:text-base font-bold text-[#B93C3C] tabular-nums leading-snug">
                        ₹{room.pricePerNight.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] font-medium text-[#2A1A1A]/50 leading-none mt-0.5">/night</p>
                    </div>
                  </label>
                )
              })}
              {errors.roomId && (
                <p className="text-xs text-[#B93C3C]">{errors.roomId.message}</p>
              )}
            </div>
          </div>

          {/* ── Stay Details ── */}
          <div>
            <SectionLabel>Stay details</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <AnimatedInput
                label="Check-in"
                type="date"
                min={today}
                leftIcon={<Calendar className="w-4 h-4" />}
                error={errors.checkIn?.message}
                {...register('checkIn')}
              />
              <AnimatedInput
                label="Check-out"
                type="date"
                min={watchedValues.checkIn || today}
                leftIcon={<Calendar className="w-4 h-4" />}
                error={errors.checkOut?.message}
                {...register('checkOut')}
              />
            </div>

            {/* Guests stepper */}
            <div className="flex flex-col gap-1.5">
              <input type="hidden" {...register('guests', { valueAsNumber: true })} />
              <p className="text-[11px] font-medium text-[rgba(80,40,40,0.65)] tracking-wide uppercase">Guests</p>
              <div className="flex items-center gap-3">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const curr = watchedValues.guests ?? 1
                    if (curr > 1) setValue('guests', curr - 1)
                  }}
                  aria-label="Decrease guests"
                  className="w-9 h-9 rounded-lg bg-white border border-[rgba(185,60,60,0.2)] grid place-items-center text-[#2A1A1A] hover:border-[#B93C3C] transition-colors cursor-pointer"
                >
                  <span className="block leading-none text-base">−</span>
                </motion.button>
                <span className="text-sm font-semibold text-[#2A1A1A] min-w-[2ch] text-center grid place-items-center">
                  {watchedValues.guests}
                </span>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const curr = watchedValues.guests ?? 1
                    const max = priceSummary.room?.capacity ?? 10
                    if (curr < max) setValue('guests', curr + 1)
                  }}
                  aria-label="Increase guests"
                  className="w-9 h-9 rounded-lg bg-white border border-[rgba(185,60,60,0.2)] grid place-items-center text-[#2A1A1A] hover:border-[#B93C3C] transition-colors cursor-pointer"
                >
                  <span className="block leading-none text-base">+</span>
                </motion.button>
                <span className="text-xs text-[rgba(150,60,60,0.6)] ml-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" aria-hidden="true" />
                  Max {priceSummary.room?.capacity ?? 10}
                </span>
                {errors.guests && (
                  <p className="text-xs text-[#B93C3C]">{errors.guests.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Price Summary ── */}
          <AnimatePresence>
            {priceSummary.nights > 0 && priceSummary.room && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="relative overflow-hidden bg-white/80 backdrop-blur-md border border-[#B93C3C]/20 rounded-xl p-4 flex flex-col gap-2.5 shadow-xs">
                  <SectionLabel>Price summary</SectionLabel>
                  <PriceLine
                    label={`${priceSummary.nights} night${priceSummary.nights !== 1 ? 's' : ''} × ₹${priceSummary.room.pricePerNight.toLocaleString('en-IN')}`}
                    value={`₹${priceSummary.subtotal.toLocaleString('en-IN')}`}
                  />
                  <PriceLine
                    label="Taxes (12%)"
                    value={`₹${priceSummary.tax.toLocaleString('en-IN')}`}
                    dimmed
                  />
                  <div className="h-px border-b border-dashed border-[#B93C3C]/25 my-1" aria-hidden="true" />
                  <PriceLine
                    label="Total Amount"
                    value={`₹${priceSummary.total.toLocaleString('en-IN')}`}
                    highlight
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Error ── */}
          {submitError && (
            <p role="alert" className="text-xs text-[#B93C3C]">
              {submitError}
            </p>
          )}

          {/* ── Pricing Note ── */}
          <p className="text-xs text-[#2A1A1A]/60 italic text-center">
            To negociate pricing, please contact owner: +91 98765 43210
          </p>

          {/* ── Submit ── */}
          <PremiumButton
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full mt-1"
          >
            {isSubmitting ? 'Confirming…' : 'Confirm booking'}
          </PremiumButton>
        </div>
      </form>
    </GlassCard>
  )
}
