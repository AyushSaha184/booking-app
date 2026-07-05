'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatHeader from './ChatHeader'
import SuggestionChips, { type ChatView } from './SuggestionChips'
import BookingFormCard from '@/components/booking/BookingFormCard'
import CancellationFormCard from '@/components/cancellation/CancellationFormCard'
import PhotoGallery from '@/components/photos/PhotoGallery'
import { transitions } from '@/lib/animations'
import { cn } from '@/lib/utils'
import type { Room, BookingFormData } from '@/types/booking'

/* ─────────────────────────────────────────────────
   Main ChatPage - Responsive Layout
   ───────────────────────────────────────────────── */

const WELCOME_TEXT = 'Welcome to Dorshi Holiday Resort cum Restaurant! How can I help you today?'

export default function ChatPage() {
  const [view, setView] = useState<ChatView>('welcome')
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

  const handleSelectView = useCallback((newView: ChatView) => {
    setView(newView)
  }, [])

  const handleBack = useCallback(() => {
    setView('welcome')
  }, [])

  const handleClose = useCallback(() => {
    setView('welcome')
  }, [])

  const containerMaxWidth = view === 'photos' ? 'max-w-6xl' : 'max-w-3xl'

  return (
    <div className="min-h-screen w-full bg-background flex flex-col overflow-x-hidden">
      {/* Header */}
      <ChatHeader onClose={handleClose} />

      {/* Content area */}
      <main className="flex-1 w-full py-8 px-4 sm:px-6 flex items-center justify-center">
        <div className={cn("w-full mx-auto transition-all duration-300 my-auto", containerMaxWidth)}>
          <AnimatePresence mode="wait">
            {view === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={transitions.smooth}
              >
                <SuggestionChips onSelectView={handleSelectView} />
              </motion.div>
            )}

            {view === 'booking' && (
              <motion.div
                key="booking"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={transitions.smooth}
              >
                <BookingFormCard
                  onSubmit={handleSubmit}
                  onBack={handleBack}
                  availableRooms={rooms}
                  onFetchRooms={fetchRooms}
                />
              </motion.div>
            )}

            {view === 'cancellation' && (
              <motion.div
                key="cancellation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={transitions.smooth}
              >
                <CancellationFormCard onBack={handleBack} />
              </motion.div>
            )}

            {view === 'photos' && (
              <motion.div
                key="photos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={transitions.smooth}
              >
                <PhotoGallery onBack={handleBack} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}