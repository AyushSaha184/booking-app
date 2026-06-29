'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatHeader from './ChatHeader'
import SuggestionChips, { type ChatView } from './SuggestionChips'
import BookingFormCard from '@/components/booking/BookingFormCard'
import CancellationFormCard from '@/components/cancellation/CancellationFormCard'
import PhotoGallery from '@/components/photos/PhotoGallery'
import { transitions } from '@/lib/animations'
import type { Room, BookingFormData } from '@/types/booking'

/* ─────────────────────────────────────────────────
   Sub-views (simple fade transitions)
   ───────────────────────────────────────────────── */

function WelcomeView({ onSelectView }: { onSelectView: (view: ChatView) => void }) {
  return (
    <div className="w-full h-full flex flex-col">
      <SuggestionChips onSelectView={onSelectView} />
    </div>
  )
}

function BookingView({ onBack }: { onBack: () => void }) {
  const [rooms, setRooms] = useState<Room[]>([])

  const fetchRooms = useCallback(async (checkIn: string, checkOut: string): Promise<Room[]> => {
    const res = await fetch(`/api/rooms?checkIn=${checkIn}&checkOut=${checkOut}`)
    if (!res.ok) return []
    const data: Room[] = await res.json()
    setRooms(data)
    return data
  }, [])

  const handleSubmit = useCallback(async (data: BookingFormData) => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await res.json() as { success: boolean; booking?: { id: string }; error?: string }
    if (!res.ok || !result.success) {
      throw new Error(result.error ?? 'Booking failed.')
    }
    return result as { success: true; booking: { id: string } }
  }, [])

  return (
    <div className="w-full h-full overflow-y-auto py-6 px-4 sm:px-6 lg:px-8">
      <BookingFormCard
        onSubmit={handleSubmit}
        onBack={onBack}
        availableRooms={rooms}
        onFetchRooms={fetchRooms}
      />
    </div>
  )
}

function CancellationView({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full h-full overflow-y-auto py-6 px-4">
      <CancellationFormCard onBack={onBack} />
    </div>
  )
}

function PhotosView({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full h-full overflow-y-auto py-4">
      <div className="px-4 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#8B1538] transition-colors duration-200 cursor-pointer border-0 bg-transparent"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-4 h-4">
            <path d="M10 4L6 8l4 4" />
          </svg>
          Back to Menu
        </button>
      </div>
      <PhotoGallery />
    </div>
  )
}

/* ─────────────────────────────────────────────────
   Main ChatPage
   ───────────────────────────────────────────────── */

const WELCOME_TEXT = 'Welcome to Dorshi Holiday Resort cum Restaurant! How can I help you today?'

export default function ChatPage() {
  const [view, setView] = useState<ChatView>('welcome')

  const handleSelectView = useCallback((newView: ChatView) => {
    setView(newView)
  }, [])

  const handleBack = useCallback(() => {
    setView('welcome')
  }, [])

  const handleClose = useCallback(() => {
    setView('welcome')
  }, [])

  return (
    <div className="flex flex-col h-screen w-full bg-[#FAFAF8] overflow-hidden">
      <ChatHeader onClose={handleClose} />

      <div
        className="flex-1 w-full min-h-0 overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        <AnimatePresence mode="wait">
          {view === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={transitions.smooth}
              className="w-full h-full"
            >
              <WelcomeView onSelectView={handleSelectView} />
            </motion.div>
          )}

          {view === 'booking' && (
            <motion.div
              key="booking"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={transitions.smooth}
              className="w-full h-full"
            >
              <BookingView onBack={handleBack} />
            </motion.div>
          )}

          {view === 'cancellation' && (
            <motion.div
              key="cancellation"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={transitions.smooth}
              className="w-full h-full"
            >
              <CancellationView onBack={handleBack} />
            </motion.div>
          )}

          {view === 'photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full h-full"
            >
              <PhotosView onBack={handleBack} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}