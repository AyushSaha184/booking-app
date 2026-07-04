import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Loader2, BedDouble, Users, Calendar, Check, Minus, Plus, Sparkles } from 'lucide-react';
import { CreateBookingSchema } from '@/lib/validation';
import { cn } from '@/lib/utils';
import type { Room, BookingFormData, BookingPrefill } from '@/types/booking';
import type { z } from 'zod';

type FormValues = z.infer<typeof CreateBookingSchema>;

interface BookingFormCardProps {
  prefill?: BookingPrefill;
  onSubmit: (data: BookingFormData) => Promise<{ success: boolean; booking?: { id: string } }>;
  onBack: () => void;
  availableRooms?: Room[];
  onFetchRooms?: (checkIn: string, checkOut: string) => Promise<Room[]>;
}

const ROOM_TYPE_BADGE: Record<string, string> = {
  standard: 'bg-gray-100 text-gray-600',
  deluxe:   'bg-rose-50 text-rose-700',
  suite:    'bg-amber-50 text-amber-700',
};

function SectionHeader({ icon: Icon, label }: { icon: typeof User; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-[#8B1538]" />
      <p className="text-xs font-bold tracking-[0.16em] text-[#8B1538] uppercase">{label}</p>
    </div>
  );
}

function IconInput({
  icon: Icon,
  error,
  ...props
}: { icon: typeof User; error?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn(
      'flex items-center gap-3 h-12 px-4 rounded-xl border bg-white transition-colors',
      error ? 'border-red-300' : 'border-gray-200 focus-within:border-[#8B1538]',
    )}>
      <Icon className="w-4 h-4 text-[#8B1538] shrink-0" />
      <input
        {...props}
        className="flex-1 text-sm text-gray-900 placeholder:text-gray-300 outline-none bg-transparent"
      />
    </div>
  );
}

export default function BookingFormCard({
  prefill,
  onSubmit,
  onBack,
  availableRooms: initialRooms,
  onFetchRooms,
}: BookingFormCardProps) {
  const [submitError, setSubmitError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [rooms, setRooms] = useState<Room[]>(initialRooms ?? []);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const today = new Date().toISOString().split('T')[0];

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
  });

  const checkIn  = watch('checkIn');
  const checkOut = watch('checkOut');
  const roomId   = watch('roomId');
  const guests   = watch('guests');

  useEffect(() => {
    if (!onFetchRooms || initialRooms || !checkIn || !checkOut) return;
    const timer = setTimeout(async () => {
      setLoadingRooms(true);
      try {
        const fetched = await onFetchRooms(checkIn, checkOut);
        setRooms(fetched);
        if (fetched.length > 0) setValue('roomId', fetched[0].id);
      } finally {
        setLoadingRooms(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [checkIn, checkOut, onFetchRooms, initialRooms, setValue]);

  const selectedRoom = rooms.find(r => r.id === roomId);
  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;
  const subtotal = selectedRoom && nights > 0 ? selectedRoom.pricePerNight * nights : 0;
  const tax   = Math.round(subtotal * 0.12);
  const total = subtotal + tax;

  const onFormSubmit = async (data: FormValues) => {
    setSubmitError('');
    try {
      const result = await onSubmit(data);
      if (result.success && result.booking) {
        setBookingRef(result.booking.id);
        setConfirmed(true);
      } else {
        throw new Error('Booking could not be confirmed. Please try again.');
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  /* ─── Success ─── */
  if (confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="px-5 py-14 flex flex-col items-center text-center gap-5"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
          className="w-20 h-20 rounded-full bg-[#8B1538]/10 grid place-items-center"
        >
          <Sparkles className="w-10 h-10 text-[#8B1538]" strokeWidth={1.5} />
        </motion.div>
        <div>
          <p className="font-serif text-3xl text-gray-900 mb-2">
            Booking <span className="text-[#8B1538]">Confirmed</span>
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            We look forward to welcoming you to Dorshi Resort.
          </p>
          {bookingRef && (
            <p className="mt-4 inline-block bg-[#8B1538]/8 text-[#8B1538] text-xs font-mono font-bold tracking-widest px-4 py-2 rounded-lg">
              REF: {bookingRef}
            </p>
          )}
        </div>
        <button
          onClick={onBack}
          className="w-full max-w-xs h-14 rounded-2xl bg-[#8B1538] text-white font-semibold text-sm shadow-lg shadow-[#8B1538]/25 hover:bg-[#6E0F2A] transition-colors"
        >
          Return Home
        </button>
      </motion.div>
    );
  }

  /* ─── Form ─── */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-5 py-8"
    >
      {/* Page header */}
      <div className="mb-6">
        <h2 className="font-serif leading-tight">
          <span className="text-3xl text-gray-900">Reserve </span>
          <span className="text-3xl text-[#8B1538]">Your Stay</span>
        </h2>
        <p className="text-sm text-gray-400 mt-1.5">Fill in your details to secure a room</p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-0">
        {/* ─── One unified card ─── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-6">

          {/* Guest Details */}
          <div>
            <SectionHeader icon={User} label="Guest Details" />
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Full Name</label>
                <div className={cn(
                  'flex items-center gap-3 h-12 px-4 rounded-xl border bg-white transition-colors',
                  errors.guestName ? 'border-red-300' : 'border-gray-200 focus-within:border-[#8B1538]',
                )}>
                  <User className="w-4 h-4 text-[#8B1538] shrink-0" />
                  <input
                    {...register('guestName')}
                    placeholder="John Doe"
                    className="flex-1 text-sm text-gray-900 placeholder:text-gray-300 outline-none bg-transparent"
                  />
                </div>
                {errors.guestName && <p className="text-xs text-red-500 mt-1">{errors.guestName.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</label>
                <div className={cn(
                  'flex items-center gap-3 h-12 px-4 rounded-xl border bg-white transition-colors',
                  errors.phone ? 'border-red-300' : 'border-gray-200 focus-within:border-[#8B1538]',
                )}>
                  <Phone className="w-4 h-4 text-[#8B1538] shrink-0" />
                  <input
                    {...register('phone')}
                    placeholder="+91 98765 43210"
                    inputMode="tel"
                    className="flex-1 text-sm text-gray-900 placeholder:text-gray-300 outline-none bg-transparent"
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Stay Details */}
          <div>
            <SectionHeader icon={Calendar} label="Stay Details" />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Check-in</label>
                  <div className={cn(
                    'flex items-center gap-3 h-12 px-3 rounded-xl border bg-white transition-colors',
                    errors.checkIn ? 'border-red-300' : 'border-gray-200 focus-within:border-[#8B1538]',
                  )}>
                    <Calendar className="w-4 h-4 text-[#8B1538] shrink-0" />
                    <input
                      type="date"
                      {...register('checkIn')}
                      min={today}
                      className="flex-1 text-sm text-gray-900 outline-none bg-transparent min-w-0"
                    />
                  </div>
                  {errors.checkIn && <p className="text-xs text-red-500 mt-1">{errors.checkIn.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Check-out</label>
                  <div className={cn(
                    'flex items-center gap-3 h-12 px-3 rounded-xl border bg-white transition-colors',
                    errors.checkOut ? 'border-red-300' : 'border-gray-200 focus-within:border-[#8B1538]',
                  )}>
                    <Calendar className="w-4 h-4 text-[#8B1538] shrink-0" />
                    <input
                      type="date"
                      {...register('checkOut')}
                      min={checkIn || today}
                      className="flex-1 text-sm text-gray-900 outline-none bg-transparent min-w-0"
                    />
                  </div>
                  {errors.checkOut && <p className="text-xs text-red-500 mt-1">{errors.checkOut.message}</p>}
                </div>
              </div>

              {/* Guests stepper */}
              <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#8B1538]" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Guests</p>
                    <p className="text-xs text-gray-400">Max {selectedRoom?.capacity ?? 4}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setValue('guests', Math.max(1, (guests || 1) - 1))}
                    disabled={(guests || 1) <= 1}
                    className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 grid place-items-center text-gray-600 disabled:opacity-30 active:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm font-bold text-gray-900">{guests || 1}</span>
                  <button
                    type="button"
                    onClick={() => setValue('guests', Math.min(selectedRoom?.capacity ?? 4, (guests || 1) + 1))}
                    disabled={(guests || 1) >= (selectedRoom?.capacity ?? 4)}
                    className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 grid place-items-center text-gray-600 disabled:opacity-30 active:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Room selection */}
          <div>
            <SectionHeader icon={BedDouble} label="Choose Your Room" />

            <AnimatePresence>
              {loadingRooms && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking availability…
                </motion.div>
              )}
            </AnimatePresence>

            {!loadingRooms && rooms.length === 0 && (
              <div className="flex items-center justify-center gap-2 py-5 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
                <Calendar className="w-4 h-4 text-[#8B1538]/50" />
                Pick your dates above to see available rooms
              </div>
            )}

            {!loadingRooms && rooms.length > 0 && (
              <div className="space-y-2">
                {rooms.map((room) => {
                  const isSelected = roomId === room.id;
                  const typeKey = room.type.toLowerCase();
                  const badge = ROOM_TYPE_BADGE[typeKey] ?? ROOM_TYPE_BADGE.standard;
                  return (
                    <motion.button
                      key={room.id}
                      type="button"
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setValue('roomId', room.id)}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        'w-full text-left rounded-xl border p-4 transition-all duration-200',
                        isSelected
                          ? 'border-[#8B1538] bg-[#8B1538]/3 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-lg grid place-items-center shrink-0', isSelected ? 'bg-[#8B1538]' : 'bg-gray-100')}>
                          <BedDouble className={cn('w-5 h-5', isSelected ? 'text-white' : 'text-gray-400')} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{room.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', badge)}>{room.type}</span>
                            <span className="text-xs text-gray-400">{room.capacity} guests</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-[#8B1538] text-sm">₹{room.pricePerNight.toLocaleString('en-IN')}</p>
                          <p className="text-xs text-gray-400">/night</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#8B1538] grid place-items-center shrink-0">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Price summary */}
          <AnimatePresence>
            {nights > 0 && selectedRoom && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-100 pt-5 space-y-2">
                  <p className="text-xs font-bold tracking-[0.16em] text-gray-400 uppercase mb-3">Price Summary</p>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{selectedRoom.pricePerNight.toLocaleString('en-IN')} × {nights} night{nights !== 1 ? 's' : ''}</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Taxes & fees (12%)</span>
                    <span>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-[#8B1538]">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-2 p-4 mt-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"
            >
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{submitError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || loadingRooms}
          className="w-full mt-4 h-14 rounded-2xl bg-[#8B1538] text-white text-base font-semibold shadow-lg shadow-[#8B1538]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-[#6E0F2A] transition-colors"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
          ) : 'Confirm Booking'}
        </button>
      </form>
    </motion.div>
  );
}
