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
    <div className="flex justify-between text-sm">
      <span className={dimmed ? 'text-text-tertiary' : 'text-text-secondary'}>{label}</span>
      <span
        className={cn(
          'font-medium tabular-nums',
          highlight ? 'text-accent font-semibold text-base' : dimmed ? 'text-text-tertiary' : 'text-text-primary'
        )}
      >
        {value}
      </span>
    </div>
  )
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
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">Booking details</span>
        <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium border border-success/20">
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
                      'flex items-center gap-3 p-3 rounded-xl border cursor-pointer',
                      'transition-all duration-200',
                      isSelected
                        ? 'border-accent/50 bg-accent-muted shadow-[0_0_12px_rgba(201,185,154,0.15)]'
                        : 'border-border hover:border-border/80 bg-surface/50'
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
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                        isSelected ? 'border-accent' : 'border-border'
                      )}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-accent" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{room.name}</p>
                      <p className="text-xs text-text-secondary">
                        {room.type} · Up to {room.capacity} guests
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-accent shrink-0">
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
                <div className="bg-surface-elevated/60 border border-border-subtle rounded-xl p-3.5 flex flex-col gap-2">
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
                  <div className="h-px bg-border my-0.5" aria-hidden="true" />
                  <PriceLine
                    label="Total"
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
