import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Home, Waves, Leaf, UtensilsCrossed, BedDouble, Building2 } from 'lucide-react';

interface Photo { id: string; name: string; type: string; src: string }

const PHOTOS: Photo[] = [
  { id: '1',  name: 'Resort Exterior',  type: 'Resort',     src: '/assets/IMG-20260622-WA0036.webp' },
  { id: '2',  name: 'Swimming Pool',    type: 'Recreation', src: '/assets/IMG-20260622-WA0035.webp' },
  { id: '3',  name: 'Pool Area',        type: 'Recreation', src: '/assets/IMG-20260622-WA0034.webp' },
  { id: '4',  name: 'Resort View',      type: 'Resort',     src: '/assets/IMG-20260622-WA0033.webp' },
  { id: '5',  name: 'Garden',           type: 'Resort',     src: '/assets/IMG-20260622-WA0032.webp' },
  { id: '6',  name: 'Restaurant',       type: 'Dining',     src: '/assets/IMG-20260622-WA0031.webp' },
  { id: '7',  name: 'Dining Hall',      type: 'Dining',     src: '/assets/IMG-20260622-WA0030.webp' },
  { id: '8',  name: 'Food & Service',   type: 'Dining',     src: '/assets/IMG-20260622-WA0029.webp' },
  { id: '9',  name: 'Entrance',         type: 'Resort',     src: '/assets/IMG-20260622-WA0028.webp' },
  { id: '10', name: 'Property View',    type: 'Resort',     src: '/assets/IMG-20260622-WA0027.webp' },
  { id: '11', name: 'Room Interior',    type: 'Rooms',      src: '/assets/IMG-20260622-WA0026.webp' },
  { id: '12', name: 'Guest Room',       type: 'Rooms',      src: '/assets/IMG-20260622-WA0025.webp' },
  { id: '13', name: 'Bedroom Suite',    type: 'Rooms',      src: '/assets/IMG-20260622-WA0024.webp' },
  { id: '14', name: 'Bathroom',         type: 'Rooms',      src: '/assets/IMG-20260622-WA0023.webp' },
  { id: '15', name: 'Room Amenities',   type: 'Rooms',      src: '/assets/IMG-20260622-WA0022.webp' },
  { id: '16', name: 'Balcony View',     type: 'Resort',     src: '/assets/IMG-20260622-WA0021.webp' },
  { id: '17', name: 'Evening View',     type: 'Resort',     src: '/assets/IMG-20260622-WA0020.webp' },
  { id: '18', name: 'Landscaping',      type: 'Resort',     src: '/assets/IMG-20260622-WA0019.webp' },
  { id: '19', name: 'Outdoor Seating',  type: 'Dining',     src: '/assets/IMG-20260622-WA0018.webp' },
  { id: '20', name: 'Walkway',          type: 'Resort',     src: '/assets/IMG-20260622-WA0017.webp' },
  { id: '21', name: 'Surroundings',     type: 'Resort',     src: '/assets/IMG-20260622-WA0016.webp' },
  { id: '22', name: 'Resort Facade',    type: 'Resort',     src: '/assets/IMG-20260622-WA0015.webp' },
  { id: '23', name: 'Scenic Shot',      type: 'Resort',     src: '/assets/IMG-20260622-WA0014.webp' },
  { id: '24', name: 'View',             type: 'Resort',     src: '/assets/IMG-20260622-WA0013.webp' },
  { id: '25', name: 'Property',         type: 'Resort',     src: '/assets/IMG-20260622-WA0012.webp' },
  { id: '26', name: 'Resort Scene',     type: 'Resort',     src: '/assets/IMG-20260622-WA0011.webp' },
  { id: '27', name: 'Corridor',         type: 'Resort',     src: '/assets/IMG-20260622-WA0010.webp' },
  { id: '28', name: 'Interior',         type: 'Resort',     src: '/assets/IMG-20260622-WA0009.webp' },
  { id: '29', name: 'Detail',           type: 'Resort',     src: '/assets/IMG-20260622-WA0008.webp' },
  { id: '30', name: 'Garden Path',      type: 'Resort',     src: '/assets/IMG-20260622-WA0007.webp' },
  { id: '31', name: 'Resort Area',      type: 'Resort',     src: '/assets/IMG-20260622-WA0006.webp' },
  { id: '32', name: 'Final View',       type: 'Resort',     src: '/assets/IMG-20260622-WA0005.webp' },
];

const TYPE_ICON: Record<string, typeof Home> = {
  Resort:     Building2,
  Recreation: Waves,
  Dining:     UtensilsCrossed,
  Rooms:      BedDouble,
};

interface Props { onBack?: () => void }

export default function PhotoGallery({ onBack }: Props) {
  const [lbIdx, setLbIdx] = useState<number | null>(null);

  const open  = (i: number) => setLbIdx(i);
  const close = useCallback(() => setLbIdx(null), []);
  const prev  = useCallback(() => setLbIdx(i => (i !== null && i > 0 ? i - 1 : i)), []);
  const next  = useCallback(() => setLbIdx(i => (i !== null && i < PHOTOS.length - 1 ? i + 1 : i)), []);

  useEffect(() => {
    if (lbIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape')     close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lbIdx, prev, next, close]);

  return (
    <div className="pb-10">
      {/* ── Header ── */}
      <div className="px-5 pt-8 pb-6">
        <h2 className="font-serif leading-tight">
          <span className="text-3xl text-gray-900">Photo </span>
          <span className="text-3xl text-[#8B1538]">Gallery</span>
        </h2>
        <p className="text-sm text-gray-400 mt-1.5">Explore the beauty of Dorshi Resort</p>
      </div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-5">
        {PHOTOS.map((photo, idx) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: idx * 0.01 }}
            onClick={() => open(idx)}
            className="cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={photo.src}
                alt={photo.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lbIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
            onClick={close}
          >
            <div className="flex items-center justify-between px-5 py-4 shrink-0" onClick={e => e.stopPropagation()}>
              <p className="text-white/50 text-sm">{lbIdx + 1} / {PHOTOS.length}</p>
              <p className="text-white text-sm font-semibold">{PHOTOS[lbIdx].name}</p>
              <button
                onClick={close}
                className="w-10 h-10 rounded-full bg-white/10 grid place-items-center hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={lbIdx}
                  src={PHOTOS[lbIdx].src}
                  alt={PHOTOS[lbIdx].name}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="max-w-full max-h-full object-contain select-none"
                  draggable={false}
                />
              </AnimatePresence>

              {lbIdx > 0 && (
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 grid place-items-center hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
              )}
              {lbIdx < PHOTOS.length - 1 && (
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 grid place-items-center hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              )}
            </div>
            <div className="shrink-0 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
