'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Phone, Calendar, Users } from 'lucide-react'
import { GlassCard } from '@/app/components/ui/GlassCard'
import { PremiumButton } from '@/app/components/ui/PremiumButton'
import { AnimatedInput } from '@/app/components/ui/AnimatedInput'
import { CreateBookingSchema } from '@/lib/validation'
import { bounceIn, checkmarkDraw } from '@/lib/animations'
import { cn } from '@/lib/utils'
import type { Room, BookingFormData, BookingPrefill } from '@/app/types/booking'
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
    <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary mb-3">
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
    <div className="flex justify-between items-center text-sm">
      <span className={dimmed ? 'text-text-tertiary font-medium' : 'text-text-secondary font-medium'}>{label}</span>
      <span
        className={cn(
          'tabular-nums',
          highlight ? 'text-[#c9b99a] font-bold text-lg tracking-wide' : dimmed ? 'text-text-tertiary font-normal' : 'text-text-primary font-medium'
        )}
      >
        {value}
      </span>
    </div>
  )
}

function getRoomColorClass(roomType: string) {
  const type = roomType.toLowerCase()
  if (type.includes('suite')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
  if (type.includes('deluxe')) return 'bg-[#c9b99a]/15 text-[#c9b99a] border-[#c9b99a]/20'
  if (type.includes('penthouse') || type.includes('presidential')) return 'bg-purple-500/10 text-purple-400 border-purple-500/25'
  return 'bg-blue-500/10 text-blue-400 border-blue-500/25'
}

// ---------- Main component ----------

export default function BookingFormCard({
  availableRooms,
  prefill,
  onSubmit,
}: BookingFormCardProps) {
  const [submitError, setSubmitError] = useState('')
  const [confirmed, setConfirmed] = useState(false)

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
    try {
      await onSubmit(data)
      setConfirmed(true)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    }
  }

  // ── Success state ──
  if (confirmed) {
    return (
      <motion.div
        variants={bounceIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-4 py-8 px-4"
      >
        <div className="relative w-16 h-16">
          <motion.div
            variants={bounceIn}
            initial="hidden"
            animate="visible"
            className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center"
          >
            <svg viewBox="0 0 40 40" className="w-8 h-8" aria-hidden="true">
              <motion.path
                variants={checkmarkDraw}
                initial="hidden"
                animate="visible"
                d="M8 20 L16 28 L32 12"
                stroke="#5ca882"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </motion.div>
        </div>
        <div className="text-center">
          <p className="text-text-primary font-semibold text-base">Booking confirmed!</p>
          <p className="text-text-secondary text-sm mt-1">
            You'll receive confirmation details shortly.
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
      className="overflow-hidden mb-2"
    >
      {/* Header with premium gradient & gold stripe */}
      <div className="relative px-4 py-3.5 bg-gradient-to-r from-[#c9b99a]/10 via-[#c9b99a]/5 to-transparent border-b border-border/60 flex items-center justify-between">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#a8956e] via-[#c9b99a] to-[#d6c7ab]" />
        <span className="text-sm font-bold text-text-primary tracking-wide">Booking details</span>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-success/10 text-success font-semibold border border-success/20">
          {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available
        </span>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
        <div className="p-4 flex flex-col gap-5">

          {/* ── Guest Details ── */}
          <div>
            <SectionLabel>Guest details</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
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
            <SectionLabel>Room</SectionLabel>
            <div className="flex flex-col gap-2">
              {availableRooms.map((room) => {
                const isSelected = watchedValues.roomId === room.id
                return (
                  <label
                    key={room.id}
                    className={cn(
                      'flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer',
                      'transition-all duration-300',
                      isSelected
                        ? 'border-[#c9b99a]/50 bg-[#c9b99a]/10 shadow-[0_4px_20px_rgba(201,185,154,0.12)]'
                        : 'border-border/80 hover:border-[#c9b99a]/30 bg-surface/40 hover:bg-surface/60'
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
                        'w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200',
                        isSelected ? 'border-[#c9b99a]' : 'border-border'
                      )}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#c9b99a]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-primary truncate leading-snug">{room.name}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className={cn('text-[9px] px-1.5 py-0.5 rounded-md border font-semibold uppercase tracking-wider', getRoomColorClass(room.type))}>
                          {room.type}
                        </span>
                        <span className="text-xs text-text-secondary font-medium">
                          · Up to {room.capacity} guests
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-extrabold text-[#c9b99a] shrink-0 tabular-nums">
                      ₹{room.pricePerNight.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-text-tertiary">/night</span>
                    </p>
                  </label>
                )
              })}
              {errors.roomId && (
                <p className="text-xs text-danger">{errors.roomId.message}</p>
              )}
            </div>
          </div>

          {/* ── Stay Details ── */}
          <div>
            <SectionLabel>Stay details</SectionLabel>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <AnimatedInput
                label="Check-in"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                leftIcon={<Calendar className="w-4 h-4" />}
                error={errors.checkIn?.message}
                {...register('checkIn')}
              />
              <AnimatedInput
                label="Check-out"
                type="date"
                min={watchedValues.checkIn || new Date().toISOString().split('T')[0]}
                leftIcon={<Calendar className="w-4 h-4" />}
                error={errors.checkOut?.message}
                {...register('checkOut')}
              />
            </div>

            {/* Guests stepper — controlled via setValue, field registered separately */}
            <div className="flex flex-col gap-1.5">
              {/* Register guests field so RHF tracks it */}
              <input type="hidden" {...register('guests', { valueAsNumber: true })} />
              <p className="text-xs font-medium text-text-secondary tracking-wide uppercase">Guests</p>
              <div className="flex items-center gap-3">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const curr = watchedValues.guests ?? 1
                    if (curr > 1) setValue('guests', curr - 1)
                  }}
                  aria-label="Decrease guests"
                  className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl bg-surface-elevated border border-border text-text-primary text-lg flex items-center justify-center hover:border-accent/40 transition-colors"
                >
                  −
                </motion.button>
                <span className="text-base font-semibold text-text-primary min-w-[2ch] text-center">
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
                  className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl bg-surface-elevated border border-border text-text-primary text-lg flex items-center justify-center hover:border-accent/40 transition-colors"
                >
                  +
                </motion.button>
                <span className="text-xs text-text-tertiary ml-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" aria-hidden="true" />
                  Max {priceSummary.room?.capacity ?? 10}
                </span>
                {errors.guests && (
                  <p className="text-xs text-danger">{errors.guests.message}</p>
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
                <div className="relative overflow-hidden bg-surface/50 backdrop-blur-md border border-[#c9b99a]/20 rounded-xl p-4 flex flex-col gap-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#c9b99a]/5 to-transparent pointer-events-none" />
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
                  <div className="h-px bg-border/60 my-1" aria-hidden="true" />
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
            <p role="alert" className="text-sm text-danger">
              {submitError}
            </p>
          )}

          {/* ── Submit ── */}
          <PremiumButton
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Confirming…' : 'Confirm booking'}
          </PremiumButton>
        </div>
      </form>
    </GlassCard>
  )
}
