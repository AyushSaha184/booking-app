'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Search, Loader2, CheckCircle2, AlertCircle, Calendar, User } from 'lucide-react'

interface CancellationFormCardProps {
  onBack: () => void
}

interface CancellationFormData {
  guestName: string
  phone: string
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
        body: JSON.stringify({
          action: 'lookup',
          guestName: data.guestName,
          phone: data.phone,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.found) {
        setError(result.message || 'Booking not found. Please check your name and phone number.')
        setStep('form')
        return
      }

      setBookingDetails(result.booking)
      setStep('found')
    } catch (err) {
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
        body: JSON.stringify({
          action: 'cancel',
          bookingId: bookingDetails.id,
          guestName: data.guestName,
          phone: data.phone,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        setError(result.error || 'Cancellation failed. Please try again.')
        setStep('found')
        return
      }

      setStep('success')
    } catch (err) {
      setError('Unable to process cancellation. Please try again later.')
      setStep('found')
    }
  }

  const handleDismissError = () => {
    setError('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Title block */}
      <div className="text-left px-1 space-y-1">
        <h2 className="font-serif text-3xl font-semibold text-gray-900 leading-tight">
          Cancel Booking
        </h2>
        <p className="text-sm text-gray-400">Enter your details to find your reservation</p>
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
            className="space-y-5"
          >
            {/* White card container for inputs */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-5">
              <div className="flex flex-col gap-4">
                <div className="space-y-2 text-left">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    {...register('guestName', {
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name is too short' }
                    })}
                    className="w-full bg-[#FAFAF9] border border-gray-200 rounded-xl py-3.5 px-4 text-base text-gray-900 outline-none transition-all duration-200 focus:bg-white focus:border-[#7C1A36] focus:ring-4 focus:ring-[#7C1A36]/5 placeholder:text-[#C37A8C]/50"
                  />
                  {errors.guestName && (
                    <p className="text-xs text-red-600 mt-1 pl-1">⚠ {errors.guestName.message}</p>
                  )}
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    inputMode="tel"
                    {...register('phone', {
                      required: 'Phone number is required',
                      minLength: { value: 10, message: 'Invalid phone number' }
                    })}
                    className="w-full bg-[#FAFAF9] border border-gray-200 rounded-xl py-3.5 px-4 text-base text-gray-900 outline-none transition-all duration-200 focus:bg-white focus:border-[#7C1A36] focus:ring-4 focus:ring-[#7C1A36]/5 placeholder:text-[#C37A8C]/50"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1 pl-1">⚠ {errors.phone.message}</p>
                  )}
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-left"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                  <button
                    type="button"
                    onClick={handleDismissError}
                    className="ml-auto text-xs text-red-600 hover:text-red-800 underline shrink-0 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}
            </div>

            {/* Find Booking Button outside and below the card */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-[#181E29] text-[#C37A8C] text-base font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-[#1E2530] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#C37A8C]" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-[#C37A8C]" />
                  Find My Booking
                </>
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
            className="bg-white p-12 rounded-3xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col items-center justify-center space-y-4"
          >
            <Loader2 className="w-10 h-10 text-[#7C1A36] animate-spin" />
            <p className="text-gray-600 font-medium">
              {bookingDetails ? 'Processing cancellation...' : 'Finding your booking...'}
            </p>
          </motion.div>
        )}

        {/* STEP 3: Booking Found - Confirmation */}
        {step === 'found' && bookingDetails && (
          <motion.div
            key="found"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-5"
          >
            {/* Booking Details Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-[#7C1A36]/5 border border-[#7C1A36]/10 grid place-items-center">
                  <CheckCircle2 className="w-6 h-6 text-[#7C1A36]" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">Booking Found</h3>
                  <p className="text-xs text-gray-400 mt-0.5">ID: {bookingDetails.id}</p>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest</p>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-gray-400" />
                      {bookingDetails.guestName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Room ID</p>
                    <p className="text-sm font-bold text-gray-900">{bookingDetails.roomId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in</p>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(bookingDetails.checkIn)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-out</p>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(bookingDetails.checkOut)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Card */}
            <div className="bg-amber-50/50 p-5 rounded-3xl border border-amber-200/80 space-y-2 text-left">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-amber-900">Cancellation Policy</p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Cancellations made within 48 hours of check-in are non-refundable.
                    A cancellation fee of 20% may apply. Are you sure you want to proceed?
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setStep('form')}
                className="flex-1 h-13 rounded-2xl bg-white border border-gray-250 text-gray-700 font-semibold hover:bg-gray-50 transition-all cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 h-13 rounded-2xl bg-[#7C1A36] text-white font-semibold shadow-[0_4px_12px_rgba(124,26,54,0.12)] hover:bg-[#651227] transition-all flex items-center justify-center gap-2 cursor-pointer"
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
            className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-center space-y-6"
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
              <p className="text-sm text-gray-505 max-w-md mx-auto leading-relaxed">
                Your booking has been cancelled successfully. A confirmation email has been sent to your registered email address.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onBack}
                className="w-full h-13 rounded-2xl bg-[#7C1A36] text-white font-semibold shadow-[0_4px_12px_rgba(124,26,54,0.12)] hover:bg-[#651227] transition-all cursor-pointer"
              >
                Return to Home
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
