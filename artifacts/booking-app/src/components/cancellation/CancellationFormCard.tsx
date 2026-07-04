import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, Loader2, CheckCircle2, AlertCircle, Calendar, User, Phone } from 'lucide-react';
import { AnimatedInput } from '@/components/ui/AnimatedInput';
import { cn } from '@/lib/utils';

interface CancellationFormCardProps {
  onBack: () => void;
}

interface CancellationFormData {
  guestName: string;
  phone: string;
}

interface LookupResult {
  id: string;
  guestName: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CancellationFormCard({ onBack }: CancellationFormCardProps) {
  const [step, setStep] = useState<'form' | 'searching' | 'found' | 'success'>('form');
  const [bookingDetails, setBookingDetails] = useState<LookupResult | null>(null);
  const [error, setError] = useState<string>('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<CancellationFormData>();

  const handleSearch = async (data: CancellationFormData) => {
    setStep('searching');
    setError('');
    try {
      const res = await fetch('/api/cancellations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lookup', guestName: data.guestName, phone: data.phone }),
      });
      const result = await res.json();
      if (!res.ok || !result.found) {
        setError(result.message || 'Booking not found. Please check your name and phone number.');
        setStep('form');
        return;
      }
      setBookingDetails(result.booking);
      setStep('found');
    } catch {
      setError('Unable to connect to the server. Please try again later.');
      setStep('form');
    }
  };

  const handleCancel = async () => {
    if (!bookingDetails) return;
    setStep('searching');
    const data = watch();
    try {
      const res = await fetch('/api/cancellations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', bookingId: bookingDetails.id, guestName: data.guestName, phone: data.phone }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        setError(result.error || 'Cancellation failed. Please try again.');
        setStep('found');
        return;
      }
      setStep('success');
    } catch {
      setError('Unable to process cancellation. Please try again later.');
      setStep('found');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 grid place-items-center hover:bg-gray-50 hover:border-[#8B1538]/40 transition-all shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-gray-900">Cancel Booking</h2>
          <p className="text-sm text-gray-500">We're sorry to see you go</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.form
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleSubmit(handleSearch)}
            className="space-y-6"
          >
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">Find Your Booking</h3>
                <p className="text-sm text-gray-500">Enter your details to proceed with cancellation</p>
              </div>
              <div className="space-y-4">
                <AnimatedInput
                  label="Full Name"
                  leftIcon={<User className="w-4 h-4" />}
                  placeholder="John Doe"
                  error={errors.guestName?.message}
                  {...register('guestName', { required: 'Name is required', minLength: { value: 2, message: 'Name is too short' } })}
                />
                <AnimatedInput
                  label="Phone Number"
                  leftIcon={<Phone className="w-4 h-4" />}
                  placeholder="+91 98765 43210"
                  inputMode="tel"
                  error={errors.phone?.message}
                  {...register('phone', { required: 'Phone number is required', minLength: { value: 10, message: 'Invalid phone number' } })}
                />
              </div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                  <button type="button" onClick={() => setError('')} className="ml-auto text-xs text-red-600 hover:text-red-800 underline shrink-0">Dismiss</button>
                </motion.div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 text-white font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Searching...</> : <><Search className="w-4 h-4" />Find Booking</>}
              </button>
            </div>
          </motion.form>
        )}

        {step === 'searching' && (
          <motion.div
            key="searching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center space-y-4"
          >
            <Loader2 className="w-12 h-12 text-[#8B1538] animate-spin" />
            <p className="text-gray-600 font-medium">
              {bookingDetails ? 'Processing cancellation...' : 'Finding your booking...'}
            </p>
          </motion.div>
        )}

        {step === 'found' && bookingDetails && (
          <motion.div
            key="found"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-[#8B1538]/10 grid place-items-center">
                  <CheckCircle2 className="w-6 h-6 text-[#8B1538]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Booking Found</h3>
                  <p className="text-sm text-gray-500">ID: {bookingDetails.id}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2"><User className="w-4 h-4 text-gray-400" />{bookingDetails.guestName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Room ID</p>
                    <p className="text-sm font-semibold text-gray-900">{bookingDetails.roomId}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" />{formatDate(bookingDetails.checkIn)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" />{formatDate(bookingDetails.checkOut)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-900">Cancellation Policy</p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Cancellations made within 48 hours of check-in are non-refundable. A cancellation fee of 20% may apply. Are you sure you want to proceed?
                  </p>
                </div>
              </div>
            </div>
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="flex-1 h-12 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all">Go Back</button>
              <button
                onClick={handleCancel}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                Confirm Cancellation
              </button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white p-8 sm:p-12 rounded-2xl border border-gray-200 shadow-sm text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-green-100 grid place-items-center mx-auto"
            >
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif text-gray-900">Cancellation Successful</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Your booking has been cancelled successfully.
              </p>
            </div>
            <button
              onClick={onBack}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#8B1538] to-[#B93C3C] text-white font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Return to Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
