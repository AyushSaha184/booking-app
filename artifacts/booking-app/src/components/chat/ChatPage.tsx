import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatHeader from './ChatHeader';
import SuggestionChips, { type ChatView } from './SuggestionChips';
import BookingFormCard from '@/components/booking/BookingFormCard';
import CancellationFormCard from '@/components/cancellation/CancellationFormCard';
import PhotoGallery from '@/components/photos/PhotoGallery';
import type { Room, BookingFormData } from '@/types/booking';

const pageVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export default function ChatPage() {
  const [view, setView] = useState<ChatView>('welcome');
  const [rooms, setRooms] = useState<Room[]>([]);

  const fetchRooms = useCallback(async (checkIn: string, checkOut: string): Promise<Room[]> => {
    const res = await fetch(`/api/rooms?checkIn=${checkIn}&checkOut=${checkOut}`);
    if (!res.ok) return [];
    const data: Room[] = await res.json();
    setRooms(data);
    return data;
  }, []);

  const handleSubmit = useCallback(async (data: BookingFormData) => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json() as { success: boolean; booking?: { id: string }; error?: string };
    if (!res.ok || !result.success) throw new Error(result.error ?? 'Booking failed.');
    return result as { success: true; booking: { id: string } };
  }, []);

  const handleSelectView = useCallback((v: ChatView) => setView(v), []);
  const handleBack = useCallback(() => setView('welcome'), []);

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#F5F0E8] overflow-hidden">
      <ChatHeader onClose={handleBack} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex justify-center">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait" initial={false}>
          {view === 'welcome' && (
            <motion.div key="welcome" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>
              <SuggestionChips onSelectView={handleSelectView} />
            </motion.div>
          )}
          {view === 'booking' && (
            <motion.div key="booking" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>
              <BookingFormCard
                onSubmit={handleSubmit}
                onBack={handleBack}
                availableRooms={rooms}
                onFetchRooms={fetchRooms}
              />
            </motion.div>
          )}
          {view === 'cancellation' && (
            <motion.div key="cancellation" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>
              <CancellationFormCard onBack={handleBack} />
            </motion.div>
          )}
          {view === 'photos' && (
            <motion.div key="photos" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>
              <PhotoGallery onBack={handleBack} />
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
