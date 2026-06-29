'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { staggerContainer, staggerItem, transitions } from '@/lib/animations'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────
   Gallery data — imported resort photos
   ───────────────────────────────────────────────── */

interface PhotoItem {
  id: string
  name: string
  type: string
  src: string
}

/* Import all resort images from app/assests */
const PHOTOS: PhotoItem[] = [
  { id: '1', name: 'Resort Exterior', type: 'Common Area', src: '/assests/IMG-20260622-WA0036.webp' },
  { id: '2', name: 'Swimming Pool', type: 'Recreation', src: '/assests/IMG-20260622-WA0035.webp' },
  { id: '3', name: 'Pool Area', type: 'Recreation', src: '/assests/IMG-20260622-WA0034.webp' },
  { id: '4', name: 'Resort View', type: 'Common Area', src: '/assests/IMG-20260622-WA0033.webp' },
  { id: '5', name: 'Garden Area', type: 'Common Area', src: '/assests/IMG-20260622-WA0032.webp' },
  { id: '6', name: 'Restaurant', type: 'Dining', src: '/assests/IMG-20260622-WA0031.webp' },
  { id: '7', name: 'Dining Area', type: 'Dining', src: '/assests/IMG-20260622-WA0030.webp' },
  { id: '8', name: 'Food Service', type: 'Dining', src: '/assests/IMG-20260622-WA0029.webp' },
  { id: '9', name: 'Resort Entrance', type: 'Common Area', src: '/assests/IMG-20260622-WA0028.webp' },
  { id: '10', name: 'Property View', type: 'Common Area', src: '/assests/IMG-20260622-WA0027.webp' },
  { id: '11', name: 'Room Interior', type: 'Accommodation', src: '/assests/IMG-20260622-WA0026.webp' },
  { id: '12', name: 'Guest Room', type: 'Accommodation', src: '/assests/IMG-20260622-WA0025.webp' },
  { id: '13', name: 'Bedroom Suite', type: 'Accommodation', src: '/assests/IMG-20260622-WA0024.webp' },
  { id: '14', name: 'Bathroom', type: 'Accommodation', src: '/assests/IMG-20260622-WA0023.webp' },
  { id: '15', name: 'Room Amenities', type: 'Accommodation', src: '/assests/IMG-20260622-WA0022.webp' },
  { id: '16', name: 'Balcony View', type: 'Accommodation', src: '/assests/IMG-20260622-WA0021.webp' },
  { id: '17', name: 'Evening View', type: 'Common Area', src: '/assests/IMG-20260622-WA0020.webp' },
  { id: '18', name: 'Landscaping', type: 'Common Area', src: '/assests/IMG-20260622-WA0019.webp' },
  { id: '19', name: 'Outdoor Seating', type: 'Common Area', src: '/assests/IMG-20260622-WA0018.webp' },
  { id: '20', name: 'Walkway', type: 'Common Area', src: '/assests/IMG-20260622-WA0017.webp' },
  { id: '21', name: 'Surroundings', type: 'Common Area', src: '/assests/IMG-20260622-WA0016.webp' },
  { id: '22', name: 'Resort Facade', type: 'Common Area', src: '/assests/IMG-20260622-WA0015.webp' },
  { id: '23', name: 'Another View', type: 'Common Area', src: '/assests/IMG-20260622-WA0014.webp' },
  { id: '24', name: 'Scenic Shot', type: 'Common Area', src: '/assests/IMG-20260622-WA0013.webp' },
  { id: '25', name: 'More Views', type: 'Common Area', src: '/assests/IMG-20260622-WA0012.webp' },
  { id: '26', name: 'Property Shot', type: 'Common Area', src: '/assests/IMG-20260622-WA0011.webp' },
  { id: '27', name: 'Resort Scene', type: 'Common Area', src: '/assests/IMG-20260622-WA0010.webp' },
  { id: '28', name: 'Corridor', type: 'Common Area', src: '/assests/IMG-20260622-WA0009.webp' },
  { id: '29', name: 'Interior', type: 'Common Area', src: '/assests/IMG-20260622-WA0008.webp' },
  { id: '30', name: 'Detail Shot', type: 'Common Area', src: '/assests/IMG-20260622-WA0007.webp' },
  { id: '31', name: 'Resort Area', type: 'Common Area', src: '/assests/IMG-20260622-WA0006.webp' },
  { id: '32', name: 'Final View', type: 'Common Area', src: '/assests/IMG-20260622-WA0005.webp' },
]

/* ─────────────────────────────────────────────────
   Single photo tile
   ───────────────────────────────────────────────── */

function PhotoTile({
  photo,
  index,
  onClick,
}: {
  photo: PhotoItem
  index: number
  onClick: () => void
}) {
  return (
    <motion.button
      variants={staggerItem}
      initial="hidden"
      animate="show"
      transition={{ ...transitions.smooth, delay: index * 0.05 }}
      onClick={onClick}
      className="group relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border-0 p-0 bg-transparent"
      aria-label={`View ${photo.name}`}
    >
      {/* Real image */}
      <Image
        src={photo.src}
        alt={photo.name}
        fill
        loading="lazy"
        className={cn(
          'object-cover transition-transform duration-500 group-hover:scale-105',
        )}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />

      {/* Room name overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
        <span className="text-white font-semibold text-sm tracking-wide text-center px-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          {photo.name}
        </span>
        <span className="text-white/70 text-xs mt-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
          {photo.type}
        </span>
      </div>

      {/* Room name badge (always visible) */}
      <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium opacity-0 group-hover:opacity-0 transition-opacity duration-300">
        {photo.name}
      </div>
    </motion.button>
  )
}

/* ─────────────────────────────────────────────────
   Lightbox modal
   ───────────────────────────────────────────────── */

function Lightbox({
  photo,
  photos,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  photo: PhotoItem
  photos: PhotoItem[]
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo: ${photo.name}`}
    >
      {/* Close */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer transition-all duration-200"
        aria-label="Close lightbox"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Prev button */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer transition-all duration-200"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext() }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer transition-all duration-200"
          aria-label="Next photo"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Image container */}
      <motion.div
        key={photo.id}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="relative w-full max-w-4xl max-h-[85vh] mx-4 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo */}
        <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={photo.src}
            alt={photo.name}
            fill
            loading="eager"
            className="object-contain"
            sizes="90vw"
          />
        </div>

        {/* Caption */}
        <div className="mt-4 text-center">
          <p className="text-white font-semibold text-base tracking-wide">{photo.name}</p>
          <p className="text-white/60 text-sm mt-0.5">{photo.type}</p>
        </div>

        {/* Counter */}
        <div className="mt-2 text-white/40 text-xs">
          {photos.findIndex((p) => p.id === photo.id) + 1} / {photos.length}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────
   Main gallery component
   ───────────────────────────────────────────────── */

export default function PhotoGallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const goPrev = useCallback(() => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i)), [])
  const goNext = useCallback(() => setLightboxIndex((i) => (i !== null && i < PHOTOS.length - 1 ? i + 1 : i)), [])

  const currentPhoto = lightboxIndex !== null ? PHOTOS[lightboxIndex] : null

  return (
    <>
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitions.smooth}
            className="font-serif text-3xl font-medium text-[#1F1F1F] tracking-tight mb-2"
          >
            Resort <em className="italic text-[#8B1538]">Gallery</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...transitions.smooth, delay: 0.1 }}
            className="text-sm text-[#6B7280]"
          >
            Explore Dorshi Holiday Resort cum Restaurant
          </motion.p>
        </div>

        {/* Photo grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          {PHOTOS.map((photo, index) => (
            <PhotoTile
              key={photo.id}
              photo={photo}
              index={index}
              onClick={() => openLightbox(index)}
            />
          ))}
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {currentPhoto !== null && (
          <Lightbox
            photo={currentPhoto}
            photos={PHOTOS}
            onClose={closeLightbox}
            onPrev={goPrev}
            onNext={goNext}
            hasPrev={lightboxIndex !== null && lightboxIndex > 0}
            hasNext={lightboxIndex !== null && lightboxIndex < PHOTOS.length - 1}
          />
        )}
      </AnimatePresence>
    </>
  )
}