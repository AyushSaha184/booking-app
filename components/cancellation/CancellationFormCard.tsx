'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, CheckCircle2, AlertCircle, Calendar, User, Phone, Hash, DoorOpen } from 'lucide-react'

interface CancellationFormCardProps {
  onBack: () => void
}

interface CancellationFormData {
  phone: string
  bookingId: string
}

interface LookupResult {
  id: string
  guestName: string
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
  status: string
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}



export default function CancellationFormCard({ onBack }: CancellationFormCardProps) {
  /* ── Fast Refresh (HMR) local style classes mapped to theme colors ── */
  const inputWrapCls =
    'flex items-center bg-[#FAFAF9] border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 focus-within:bg-white focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/5'

  const iconCls = 'w-11 h-11 flex items-center justify-center border-r border-gray-200 shrink-0 text-accent transition-colors focus-within:border-accent'

  const inputCls =
    'flex-1 h-11 px-3 bg-transparent text-base text-gray-900 outline-none placeholder:text-[#C37A8C]/50'

  const [step, setStep] = useState<'form' | 'searching' | 'found' | 'success' | 'error'>('form')
  const [bookingDetails, setBookingDetails] = useState<LookupResult | null>(null)
  const [error, setError] = useState<string>('')

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<CancellationFormData>()

  const handleSearch = async (data: CancellationFormData) => {
    setStep('searching')
    setError('')
    try {
      const res = await fetch('/api/cancellations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lookup', phone: data.phone, bookingId: data.bookingId }),
      })
      const result = await res.json()
      if (!res.ok || !result.found) {
        setError(result.message || 'Booking not found. Please check your Booking ID and phone number.')
        setStep('form')
        return
      }
      setBookingDetails(result.booking)
      setStep('found')
    } catch {
      setError('Unable to connect to the server. Please try again later.')
      setStep('form')
    }
  }

  const handleCancel = async () => {
    if (!bookingDetails) return
    setStep('searching')
    const data = watch()
    try {
      const res = await fetch('/api/cancellations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', bookingId: bookingDetails.id, phone: data.phone }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        setError(result.error || 'Cancellation failed. Please try again.')
        setStep('found')
        return
      }
      setStep('success')
    } catch {
      setError('Unable to process cancellation. Please try again later.')
      setStep('found')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto space-y-4"
    >
      {/* Title block — left-aligned */}
      <div className="text-left px-1 space-y-0.5">
        <h2 className="font-serif text-2xl font-semibold text-gray-900 leading-tight">
          Cancel <span className="text-accent">Booking</span>
        </h2>
        <p className="text-xs text-gray-400">Enter your details to find your reservation</p>
      </div>

      <AnimatePresence mode="wait">

        {/* STEP 1: Search Form */}
        {step === 'form' && (
          <motion.form
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleSubmit(handleSearch)}
            className="space-y-4"
          >
            {/* Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-5 sm:p-8 space-y-4">

              {/* Booking ID */}
              <div className="space-y-1">
                <label className="block text-[13px] font-semibold text-gray-800">Booking ID</label>
                <div className={inputWrapCls}>
                  <span className={iconCls}><Hash className="w-4 h-4" /></span>
                  <input
                    type="text"
                    placeholder="BK-XXXXXX"
                    {...register('bookingId', {
                      required: 'Booking ID is required',
                      pattern: { value: /^BK-/, message: 'Must start with BK-' }
                    })}
                    className={inputCls}
                  />
                </div>
                {errors.bookingId && <p className="text-xs text-red-600 pl-1">⚠ {errors.bookingId.message}</p>}
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="block text-[13px] font-semibold text-gray-800">Phone Number</label>
                <div className={inputWrapCls}>
                  <span className={iconCls}><Phone className="w-4 h-4" /></span>
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="+91 98765 43210"
                    {...register('phone', {
                      required: 'Phone number is required',
                      minLength: { value: 10, message: 'Invalid phone number' }
                    })}
                    className={inputCls}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-600 pl-1">⚠ {errors.phone.message}</p>}
              </div>

              {/* Inline error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-left"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 flex-1">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError('')}
                    className="text-xs text-red-600 hover:text-red-800 underline shrink-0 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}
            </div>

            {/* Button below the card */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-accent text-white text-sm font-semibold shadow-[0_4px_12px_rgba(124,26,54,0.18)] hover:bg-brand-red-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" />Searching...</>
              ) : (
                <><Search className="w-4 h-4" />Find My Booking</>
              )}
            </button>
          </motion.form>
        )}

        {/* STEP 2: Loading */}
        {step === 'searching' && (
          <motion.div
            key="searching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white p-12 rounded-3xl border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.07)] flex flex-col items-center justify-center space-y-4"
          >
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
            <p className="text-gray-600 font-medium">
              {bookingDetails ? 'Processing cancellation...' : 'Finding your booking...'}
            </p>
          </motion.div>
        )}

        {/* STEP 3: Booking Found */}
        {step === 'found' && bookingDetails && (
          <motion.div
            key="found"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-5"
          >
            <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.07)] space-y-5">
              <div className="flex items-center justify-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-accent/5 border border-accent/10 grid place-items-center">
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">Booking Found</h3>
                  <p className="text-xs text-gray-400 mt-0.5">ID: {bookingDetails.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Guest</span>
                    <span className="text-sm font-bold text-gray-900">{bookingDetails.guestName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center shrink-0">
                    <DoorOpen className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Room ID</span>
                    <span className="text-sm font-bold text-gray-900">{bookingDetails.roomId}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 my-2" />

              <div className="grid grid-cols-2 gap-6 pb-2">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Check-in</span>
                    <span className="text-sm font-bold text-gray-900">{formatDate(bookingDetails.checkIn)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Check-out</span>
                    <span className="text-sm font-bold text-gray-900">{formatDate(bookingDetails.checkOut)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('form')}
                className="flex-1 h-12 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 h-12 rounded-xl bg-accent text-white font-semibold shadow-[0_4px_12px_rgba(124,26,54,0.18)] hover:bg-brand-red-hover transition-all cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Success */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.07)] text-center space-y-5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-green-50 grid place-items-center mx-auto"
            >
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif text-gray-900">Cancellation Successful</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                Your booking has been cancelled successfully. A confirmation has been sent to your registered number.
              </p>
            </div>
            <button
              onClick={onBack}
              className="w-full h-12 rounded-xl bg-accent text-white font-semibold shadow-[0_4px_12px_rgba(124,26,54,0.18)] hover:bg-brand-red-hover transition-all cursor-pointer"
            >
              Return to Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
