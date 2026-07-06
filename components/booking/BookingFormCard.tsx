'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { User, ChevronLeft, Loader2, BedDouble, Users, Calendar, Check, Phone } from 'lucide-react'
import { CreateBookingSchema } from '@/lib/validation'
import { checkmarkDraw, bounceIn } from '@/lib/animations'
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

function RoomImagePlaceholder({ roomType }: { roomType: string }) {
  const colors: Record<string, string> = {
    suite: 'from-amber-600 to-orange-700',
    deluxe: 'from-[#7C1A36] to-[#B93C3C]',
    standard: 'from-gray-200 to-gray-300',
  }
  const cls = colors[roomType?.toLowerCase()] ?? colors.standard

  return (
    <div className={cn('w-full h-full bg-linear-to-br flex items-center justify-center', cls)}>
      <BedDouble className="w-10 h-10 text-white/70" />
    </div>
  )
}

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
      checkIn: prefill?.checkIn || new Date().toISOString().split('T')[0],
      checkOut: prefill?.checkOut || (() => {
        const d = new Date()
        d.setDate(d.getDate() + 1)
        return d.toISOString().split('T')[0]
      })(),
      guests: prefill?.guests ?? 1,
    },
    mode: 'onBlur',
  })

  const checkIn = watch('checkIn')
  const checkOut = watch('checkOut')
  const roomId = watch('roomId')
  const guests = watch('guests')

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
    }, 400)
    return () => clearTimeout(timer)
  }, [checkIn, checkOut, onFetchRooms, initialRooms, setValue])

  const selectedRoom = rooms.find(r => r.id === roomId)
  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0
  const subtotal = selectedRoom ? selectedRoom.pricePerNight * nights : 0
  const tax = Math.round(subtotal * 0.12)
  const total = subtotal + tax

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

  if (confirmed) {
    return (
      <motion.div
        variants={bounceIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-6 py-12 px-8 bg-white rounded-3xl border border-gray-200 shadow-lg w-full max-w-lg mx-auto text-center"
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
            Your reservation is confirmed. We look forward to welcoming you.
          </p>
          {bookingRef && (
            <p className="mt-3 text-sm font-mono text-[#7C1A36] font-semibold tracking-wider">
              Ref: {bookingRef}
            </p>
          )}
        </div>

        <button
          onClick={onBack}
          className="mt-4 flex items-center gap-2 px-6 py-3 bg-[#7C1A36] text-white rounded-xl font-medium shadow-md hover:bg-[#651227] transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Return Home
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-8"
    >
      {/* Title block — left-aligned, "Your Stay" in maroon */}
      <div className="text-left px-1 space-y-1">
        <h2 className="font-serif text-3xl font-semibold text-gray-900 leading-tight">
          Reserve <span className="text-[#7C1A36]">Your Stay</span>
        </h2>
        <p className="text-sm text-gray-400">Fill in your details to secure a room</p>
      </div>

      {/* Single continuous form card */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-8">

          {/* ─── GUEST DETAILS SECTION ─── */}
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-[#7C1A36] uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-[#7C1A36]" />
              Guest Details
            </h3>

            {/* Full Name */}
            <div className="space-y-2 text-left">
              <label className="block text-sm font-semibold text-gray-800">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C1A36]">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('guestName', { required: 'Name is required' })}
                  className="w-full bg-[#FAFAF9] border border-gray-200 rounded-xl py-4 pl-12 pr-5 text-base text-gray-900 outline-none transition-all duration-200 focus:bg-white focus:border-[#7C1A36] focus:ring-4 focus:ring-[#7C1A36]/5 placeholder:text-[#C37A8C]/50"
                />
              </div>
              {errors.guestName && (
                <p className="text-xs text-red-600 mt-1 pl-1">⚠ {errors.guestName.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2 text-left">
              <label className="block text-sm font-semibold text-gray-800">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C1A36]">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  {...register('phone', { required: 'Phone is required' })}
                  className="w-full bg-[#FAFAF9] border border-gray-200 rounded-xl py-4 pl-12 pr-5 text-base text-gray-900 outline-none transition-all duration-200 focus:bg-white focus:border-[#7C1A36] focus:ring-4 focus:ring-[#7C1A36]/5 placeholder:text-[#C37A8C]/50"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-600 mt-1 pl-1">⚠ {errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* ─── STAY DETAILS SECTION ─── */}
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-[#7C1A36] uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#7C1A36]" />
              Stay Details
            </h3>

            {/* Side-by-Side Date Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <label className="block text-sm font-semibold text-gray-800">Check-in</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C1A36] pointer-events-none">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <input
                    type="date"
                    min={today}
                    {...register('checkIn')}
                    className="w-full bg-[#FAFAF9] border border-gray-200 rounded-xl py-4 pl-12 pr-5 text-base text-gray-900 outline-none transition-all duration-200 focus:bg-white focus:border-[#7C1A36] focus:ring-4 focus:ring-[#7C1A36]/5 cursor-pointer text-left"
                  />
                </div>
                {errors.checkIn && (
                  <p className="text-xs text-red-600 mt-1 pl-1">⚠ {errors.checkIn.message}</p>
                )}
              </div>

              <div className="space-y-2 text-left">
                <label className="block text-sm font-semibold text-gray-800">Check-out</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C1A36] pointer-events-none">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <input
                    type="date"
                    min={checkIn || today}
                    {...register('checkOut')}
                    className="w-full bg-[#FAFAF9] border border-gray-200 rounded-xl py-4 pl-12 pr-5 text-base text-gray-900 outline-none transition-all duration-200 focus:bg-white focus:border-[#7C1A36] focus:ring-4 focus:ring-[#7C1A36]/5 cursor-pointer text-left"
                  />
                </div>
                {errors.checkOut && (
                  <p className="text-xs text-red-600 mt-1 pl-1">⚠ {errors.checkOut.message}</p>
                )}
              </div>
            </div>

            {/* Stepper block */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#7C1A36]" strokeWidth={2} />
                <div className="text-left">
                  <p className="text-base font-semibold text-gray-900 leading-tight">Guests</p>
                  <p className="text-xs text-gray-400 mt-0.5">Max {selectedRoom?.capacity || 4}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setValue('guests', Math.max(1, (guests || 1) - 1))}
                  className="w-11 h-11 rounded-full border border-gray-250 flex items-center justify-center text-[#7C1A36] bg-white hover:border-[#7C1A36]/30 hover:bg-[#7C1A36]/5 transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer text-lg font-medium"
                  disabled={(guests || 1) <= 1}
                >
                  −
                </button>
                <span className="text-base font-bold text-gray-900 w-4 text-center">{guests || 1}</span>
                <button
                  type="button"
                  onClick={() => setValue('guests', Math.min(selectedRoom?.capacity || 4, (guests || 1) + 1))}
                  className="w-11 h-11 rounded-full border border-gray-250 flex items-center justify-center text-[#7C1A36] bg-white hover:border-[#7C1A36]/30 hover:bg-[#7C1A36]/5 transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer text-lg font-medium"
                  disabled={(guests || 1) >= (selectedRoom?.capacity || 4)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* ─── CHOOSE YOUR ROOM SECTION ─── */}
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-[#7C1A36] uppercase tracking-wider flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-[#7C1A36]" />
              Choose Your Room
              {rooms.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 bg-[#7C1A36]/10 text-[#7C1A36] text-[10px] rounded-full normal-case font-semibold">
                  {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available
                </span>
              )}
            </h3>

            {/* Dashed placeholder when no dates chosen or no rooms found */}
            {rooms.length === 0 && !loadingRooms && (
              <div className="border border-dashed border-gray-200 bg-[#FAFAF9]/40 rounded-2xl py-10 px-6 text-center flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-400 font-medium">
                  {checkIn && checkOut
                    ? "No rooms available for the selected dates"
                    : "Pick your dates above to see available rooms"}
                </span>
              </div>
            )}

            {loadingRooms && (
              <div className="flex flex-col items-center justify-center p-8 space-y-2 border border-dashed border-gray-200 rounded-2xl">
                <Loader2 className="w-6 h-6 text-[#7C1A36] animate-spin" />
                <p className="text-xs text-gray-500">Searching for available rooms...</p>
              </div>
            )}

            {/* Available Rooms list */}
            {rooms.length > 0 && !loadingRooms && (
              <div className="grid grid-cols-1 gap-4">
                {rooms.map((room) => {
                  const isSelected = roomId === room.id
                  return (
                    <motion.button
                      key={room.id}
                      type="button"
                      onClick={() => setValue('roomId', room.id)}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        "relative flex flex-col sm:flex-row bg-white rounded-2xl border-2 overflow-hidden transition-all text-left shadow-xs cursor-pointer",
                        isSelected
                          ? "border-[#7C1A36] ring-4 ring-[#7C1A36]/5 shadow-sm"
                          : "border-gray-200 hover:border-gray-200 hover:shadow-sm"
                      )}
                    >
                      {/* Room Image */}
                      <div className="sm:w-44 h-36 sm:h-auto bg-gray-100 relative overflow-hidden shrink-0">
                        <RoomImagePlaceholder roomType={room.type} />
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-6 h-6 bg-[#7C1A36] rounded-full grid place-items-center shadow-md">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Room Details */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif text-lg text-gray-900 mb-0.5">{room.name}</h4>
                          <p className="text-xs text-gray-500 mb-2.5">
                            {room.type} • {room.capacity} Guests
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full font-medium">Free WiFi</span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full font-medium">Breakfast</span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full font-medium">AC</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-100">
                          <div>
                            <span className="text-xl font-bold text-[#7C1A36]">₹{room.pricePerNight.toLocaleString('en-IN')}</span>
                            <span className="text-xs text-gray-400 ml-0.5">/ night</span>
                          </div>
                          <span className={cn(
                            "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                            isSelected
                              ? "bg-[#7C1A36] text-white"
                              : "bg-gray-100 text-gray-600"
                          )}>
                            {isSelected ? 'Selected' : 'Select'}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Price Summary (shown conditionally as its own card) */}
        {nights > 0 && selectedRoom && !loadingRooms && (
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
            <h3 className="text-sm font-bold text-gray-850 text-left">Price Summary</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>₹{selectedRoom.pricePerNight.toLocaleString('en-IN')} × {nights} Night{nights > 1 ? 's' : ''}</span>
                <span className="font-semibold text-gray-700">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Taxes & Fees (12%)</span>
                <span className="font-semibold text-gray-700">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-100">
                <span>Total</span>
                <span className="text-[#7C1A36]">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {submitError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <span className="text-red-600">⚠</span>
            <p className="text-sm text-red-800 text-left">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-0">
          <button
            type="submit"
            disabled={isSubmitting || loadingRooms}
            className="w-full h-16 rounded-2xl bg-[#7C1A36] text-white text-base font-semibold shadow-[0_4px_12px_rgba(124,26,54,0.12)] hover:bg-[#651227] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}