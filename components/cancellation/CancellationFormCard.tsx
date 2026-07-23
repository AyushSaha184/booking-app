'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, MessageCircle, AlertTriangle, CheckCircle2, Copy, Check, ChevronLeft, ShieldAlert } from 'lucide-react'

interface CancellationFormCardProps {
  onBack: () => void
}

export default function CancellationFormCard({ onBack }: CancellationFormCardProps) {
  const OWNER_PHONE = '+917679081423'
  const OWNER_PHONE_DISPLAY = '+91 76790 81423'

  const [copiedPhone, setCopiedPhone] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText(OWNER_PHONE_DISPLAY)
    setCopiedPhone(true)
    setTimeout(() => setCopiedPhone(false), 2000)
  }

  const waText = encodeURIComponent(
    'Hi! I would like to request a cancellation for my booking reservation. Please let me know the cancellation process and charges applicable.'
  )
  const waUrl = `https://wa.me/${OWNER_PHONE.replace('+', '')}?text=${waText}`

  /* ── CANCELLED CONFIRMATION VIEW ────────────────── */
  if (isCancelled) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.07)] text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-red-50 grid place-items-center mx-auto"
        >
          <CheckCircle2 className="w-10 h-10 text-red-600" />
        </motion.div>

        <div className="space-y-2">
          <h3 className="text-2xl font-serif font-bold text-gray-900">Booking Cancelled</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Your booking has been cancelled as per your request. If you have any further queries or refund questions, please contact the hotel owner directly.
          </p>
        </div>

        <button
          onClick={onBack}
          className="w-full h-12 rounded-xl bg-accent text-white font-semibold text-sm shadow-[0_4px_12px_rgba(124,26,54,0.18)] hover:bg-brand-red-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Return to Home
        </button>
      </motion.div>
    )
  }

  /* ── MAIN CANCELLATION INFO VIEW ────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto space-y-5"
    >
      {/* Title block */}
      <div className="text-left px-1 space-y-0.5">
        <h2 className="font-serif text-2xl font-semibold text-gray-900 leading-tight">
          Cancel <span className="text-accent">Your Stay</span>
        </h2>
        <p className="text-xs text-gray-400">Contact the hotel owner directly to request a cancellation</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-5 sm:p-8 flex flex-col gap-6">

        {/* ─── TERMS AND CONDITIONS NOTICE ─── */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3.5 text-left">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Terms & Conditions
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Cancellation charges will apply according to hotel policies. Please call or WhatsApp the hotel owner directly below to initiate and confirm your cancellation request.
            </p>
          </div>
        </div>

        {/* ─── HOTEL OWNER CONTACT CARD ─── */}
        <div className="w-full bg-[#FAFAF9] border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-accent/10 grid place-items-center shrink-0">
              <Phone className="w-5 h-5 text-accent" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Hotel Owner Contact
              </span>
              <span className="text-lg font-bold font-mono text-gray-900">
                {OWNER_PHONE_DISPLAY}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={copyPhoneNumber}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0 cursor-pointer"
          >
            {copiedPhone ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-gray-500" />
            )}
            {copiedPhone ? 'Copied' : 'Copy Number'}
          </button>
        </div>

        {/* ─── DIRECT ACTION BUTTONS ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={`tel:${OWNER_PHONE}`}
            className="h-12 rounded-xl bg-accent text-white text-sm font-semibold shadow-md hover:bg-brand-red-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            Call Owner to Cancel
          </a>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            Message on WhatsApp
          </a>
        </div>

        {/* ─── INFO NOTE ─── */}
        <div className="pt-2 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400">
            Once the owner updates your status to cancelled in Google Sheets, your booking status will reflect as cancelled automatically.
          </p>
        </div>

      </div>

      <button
        type="button"
        onClick={onBack}
        className="w-full h-11 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        Return to Home
      </button>
    </motion.div>
  )
}
