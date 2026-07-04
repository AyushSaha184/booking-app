import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Search, Loader2, CheckCircle2,
  AlertCircle, Calendar, User, Phone, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { onBack: () => void }

interface FormData { guestName: string; phone: string }

interface BookingInfo {
  id: string; guestName: string; roomId: string;
  checkIn: string; checkOut: string; guests: number; status: string;
}

function fmt(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Field({ label, value, icon: Icon }: { label: string; value: string; icon: typeof User }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-gray-300 shrink-0" />
        <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

export default function CancellationFormCard({ onBack }: Props) {
  const [step, setStep] = useState<'form' | 'loading' | 'found' | 'success'>('form');
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>();

  const onSearch = async (data: FormData) => {
    setError('');
    setStep('loading');
    try {
      const res = await fetch('/api/cancellations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lookup', guestName: data.guestName, phone: data.phone }),
      });
      const json = await res.json();
      if (!res.ok || !json.found) {
        setError(json.message ?? 'No booking found. Please check your name and phone number.');
        setStep('form');
        return;
      }
      setBooking(json.booking);
      setStep('found');
    } catch {
      setError('Could not reach the server. Please try again.');
      setStep('form');
    }
  };

  const onCancel = async () => {
    if (!booking) return;
    setError('');
    setStep('loading');
    const { guestName, phone } = watch();
    try {
      const res = await fetch('/api/cancellations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', bookingId: booking.id, guestName, phone }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Cancellation failed. Please try again.');
        setStep('found');
        return;
      }
      setStep('success');
    } catch {
      setError('Could not process your cancellation. Please try again.');
      setStep('found');
    }
  };

  return (
    <div className="px-4 py-5">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-serif text-xl text-gray-900 leading-tight">Cancel Booking</h2>
        <p className="text-xs text-gray-400 mt-0.5">Enter your details to find your reservation</p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── Search form ── */}
        {step === 'form' && (
          <motion.form
            key="form"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit(onSearch)}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name</label>
                <input
                  {...register('guestName', { required: 'Name is required', minLength: { value: 2, message: 'Too short' } })}
                  placeholder="John Doe"
                  className={cn(
                    'w-full h-11 px-3 rounded-xl border bg-gray-50 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:bg-white focus:border-[#8B1538] transition-colors',
                    errors.guestName ? 'border-red-300' : 'border-gray-200',
                  )}
                />
                {errors.guestName && <p className="text-xs text-red-500 mt-1">{errors.guestName.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Phone Number</label>
                <input
                  {...register('phone', { required: 'Phone is required', minLength: { value: 10, message: 'Invalid phone number' } })}
                  placeholder="+91 98765 43210"
                  inputMode="tel"
                  className={cn(
                    'w-full h-11 px-3 rounded-xl border bg-gray-50 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:bg-white focus:border-[#8B1538] transition-colors',
                    errors.phone ? 'border-red-300' : 'border-gray-200',
                  )}
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-gray-900 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching…</>
                : <><Search className="w-4 h-4" /> Find My Booking</>}
            </button>
          </motion.form>
        )}

        {/* ── Loading ── */}
        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-3 py-20"
          >
            <Loader2 className="w-10 h-10 text-[#8B1538] animate-spin" />
            <p className="text-sm text-gray-500">
              {booking ? 'Processing cancellation…' : 'Finding your booking…'}
            </p>
          </motion.div>
        )}

        {/* ── Booking found ── */}
        {step === 'found' && booking && (
          <motion.div
            key="found"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Booking card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 grid place-items-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Booking Found</p>
                  <p className="text-xs text-gray-400 font-mono">{booking.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <Field label="Guest" value={booking.guestName} icon={User} />
                <Field label="Room" value={booking.roomId} icon={Phone} />
                <Field label="Check-in" value={fmt(booking.checkIn)} icon={Calendar} />
                <Field label="Check-out" value={fmt(booking.checkOut)} icon={Calendar} />
              </div>
            </div>

            {/* Policy notice */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-0.5">Cancellation Policy</p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Cancellations within 48 hours of check-in are non-refundable. A 20% fee may apply. This cannot be undone.
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep('form')}
                className="h-12 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium text-sm active:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={onCancel}
                className="h-12 rounded-xl bg-red-600 text-white font-semibold text-sm shadow-md shadow-red-600/25"
              >
                Cancel Booking
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Success ── */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-5 py-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-emerald-100 grid place-items-center"
            >
              <Check className="w-10 h-10 text-emerald-600" strokeWidth={2.5} />
            </motion.div>
            <div>
              <p className="font-serif text-2xl text-gray-900 mb-1">Cancelled</p>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                Your booking has been successfully cancelled.
              </p>
            </div>
            <button
              onClick={onBack}
              className="w-full max-w-xs h-12 rounded-xl bg-[#8B1538] text-white font-semibold shadow-md"
            >
              Return Home
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
