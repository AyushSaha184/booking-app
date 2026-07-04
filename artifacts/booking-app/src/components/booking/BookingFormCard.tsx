import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { User, Phone, ChevronLeft, Loader2, BedDouble, Users, Calendar, Check } from 'lucide-react';
import { AnimatedInput } from '@/components/ui/AnimatedInput';
import { CreateBookingSchema } from '@/lib/validation';
import { checkmarkDraw, bounceIn } from '@/lib/animations';
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

function RoomImagePlaceholder({ roomType }: { roomType: string }) {
  const colors: Record<string, string> = {
    suite: 'from-amber-600 to-orange-700',
    deluxe: 'from-[#8B1538] to-[#B93C3C]',
    standard: 'from-gray-200 to-gray-300',
  };
  const cls = colors[roomType?.toLowerCase()] ?? colors.standard;
  return (
    <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', cls)}>
      <BedDouble className="w-10 h-10 text-white/70" />
    </div>
  );
}

export default function BookingFormCard({ prefill, onSubmit, onBack, availableRooms: initialRooms, onFetchRooms }: BookingFormCardProps) {
  const [submitError, setSubmitError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [rooms, setRooms] = useState<Room[]>(initialRooms ?? []);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [today, setToday] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const timer = setTimeout(() => setToday(new Date().toISOString().split('T')[0]), msUntilMidnight);
    return () => clearTimeout(timer);
  }, []);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
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

  const checkIn = watch('checkIn');
  const checkOut = watch('checkOut');
  const roomId = watch('roomId');
  const guests = watch('guests');

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
    }, 400);
    return () => clearTimeout(timer);
  }, [checkIn, checkOut, onFetchRooms, initialRooms, setValue]);

  const selectedRoom = rooms.find(r => r.id === roomId);
  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const subtotal = selectedRoom ? selectedRoom.pricePerNight * nights : 0;
  const tax = Math.round(subtotal * 0.12);
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
          <p className="text-sm text-gray-600">Your reservation is confirmed. We look forward to welcoming you.</p>
          {bookingRef && (
            <p className="mt-3 text-sm font-mono text-[#8B1538] font-semibold tracking-wider">Ref: {bookingRef}</p>
          )}
        </div>
        <button
          onClick={onBack}
          className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B1538] to-[#B93C3C] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Return Home
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 grid place-items-center hover:bg-gray-50 hover:border-[#8B1538]/40 transition-all shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-gray-900">Reserve Your Stay</h2>
          <p className="text-sm text-gray-500">Complete the details below to secure your room.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5 text-[#8B1538]" /> Guest Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatedInput
              label="Full Name"
              leftIcon={<User className="w-4 h-4" />}
              placeholder="John Doe"
              error={errors.guestName?.message}
              {...register('guestName')}
            />
            <AnimatedInput
              label="Phone Number"
              leftIcon={<Phone className="w-4 h-4" />}
              placeholder="+91 98765 43210"
              inputMode="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#8B1538]" /> Stay Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in</label>
              <input
                type="date"
                {...register('checkIn')}
                min={today}
                className="w-full bg-transparent border-none text-base font-medium text-gray-900 outline-none cursor-pointer"
              />
            </div>
            <div className="space-y-1.5 sm:border-l sm:border-gray-200 sm:pl-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-out</label>
              <input
                type="date"
                {...register('checkOut')}
                min={checkIn || today}
                className="w-full bg-transparent border-none text-base font-medium text-gray-900 outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Guests</p>
                <p className="text-xs text-gray-500">Max {selectedRoom?.capacity || 4} guests</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setValue('guests', Math.max(1, (guests || 1) - 1))}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 grid place-items-center text-gray-600 hover:border-[#8B1538] hover:text-[#8B1538] transition-all shadow-sm disabled:opacity-50"
                disabled={(guests || 1) <= 1}
              >−</button>
              <span className="text-xl font-bold text-gray-900 w-6 text-center">{guests || 1}</span>
              <button
                type="button"
                onClick={() => setValue('guests', Math.min(selectedRoom?.capacity || 4, (guests || 1) + 1))}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 grid place-items-center text-gray-600 hover:border-[#8B1538] hover:text-[#8B1538] transition-all shadow-sm disabled:opacity-50"
                disabled={(guests || 1) >= (selectedRoom?.capacity || 4)}
              >+</button>
            </div>
          </div>
        </div>

        {rooms.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-[#8B1538]" /> Select Your Room
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {rooms.map((room) => {
                const isSelected = roomId === room.id;
                return (
                  <motion.button
                    key={room.id}
                    type="button"
                    onClick={() => setValue('roomId', room.id)}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      "relative flex flex-col sm:flex-row bg-white rounded-2xl border-2 overflow-hidden transition-all text-left shadow-sm",
                      isSelected ? "border-[#8B1538] ring-4 ring-[#8B1538]/5 shadow-md" : "border-gray-200 hover:border-gray-200 hover:shadow-md"
                    )}
                  >
                    <div className="sm:w-48 h-40 sm:h-auto bg-gray-100 relative overflow-hidden">
                      <RoomImagePlaceholder roomType={room.type} />
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-7 h-7 bg-[#8B1538] rounded-full grid place-items-center shadow-lg">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-xl text-gray-900 mb-1">{room.name}</h4>
                        <p className="text-sm text-gray-500 mb-3">{room.type} • {room.capacity} Guests</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Free WiFi</span>
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Breakfast</span>
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">AC</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-2xl font-bold text-[#8B1538]">₹{room.pricePerNight.toLocaleString('en-IN')}</span>
                          <span className="text-sm text-gray-400 ml-1">/ night</span>
                        </div>
                        <span className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                          isSelected ? "bg-[#8B1538] text-white" : "bg-gray-100 text-gray-600"
                        )}>
                          {isSelected ? 'Selected' : 'Select'}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {nights > 0 && selectedRoom && (
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Price Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>₹{selectedRoom.pricePerNight.toLocaleString('en-IN')} × {nights} Night{nights > 1 ? 's' : ''}</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxes & Fees (12%)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total</span>
                <span className="text-[#8B1538]">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        {submitError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <span className="text-red-600">⚠</span>
            <p className="text-sm text-red-800">{submitError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || loadingRooms}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-[#8B1538] to-[#B93C3C] text-white text-lg font-semibold shadow-lg shadow-[#8B1538]/20 hover:shadow-xl hover:shadow-[#8B1538]/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" />Processing...</>
          ) : (
            'Confirm Booking'
          )}
        </button>
      </form>
    </motion.div>
  );
}
