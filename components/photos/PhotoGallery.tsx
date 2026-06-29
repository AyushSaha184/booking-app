'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { staggerContainer, staggerItem, transitions } from '@/lib/animations'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────
   Gallery data — placeholder gradient "photos"
   ───────────────────────────────────────────────── */

interface PhotoItem {
  id: string
  name: string
  type: string
  gradientClass: string
  accentColor: string
}

const PHOTOS: PhotoItem[] = [
  { id: '1', name: 'Lobby & Reception', type: 'Common Area', gradientClass: 'from-[#8B4513] to-[#D2691E]', accentColor: '#CD853F' },
  { id: '2', name: 'Garden Suite', type: 'Suite', gradientClass: 'from-[#2D5016] to-[#6B8E23]', accentColor: '#9ACD32' },
  { id: '3', name: 'Infinity Pool', type: 'Recreation', gradientClass: 'from-[#0077B6] to-[#00B4D8]', accentColor: '#48CAE4' },
  { id: '4', name: 'Ocean View Deluxe', type: 'Deluxe', gradientClass: 'from-[#023E8A] to-[#0077B6]', accentColor: '#00B4D8' },
  { id: '5', name: 'Beach Bungalow', type: 'Cottage', gradientClass: 'from-[#F77F00] to-[#EAE2B7]', accentColor: '#F4A261' },
  { id: '6', name: 'Mountain Villa', type: 'Premium Villa', gradientClass: 'from-[#3D405B] to-[#81B29A]', accentColor: '#81B29A' },
  { id: '7', name: 'Restaurant & Dining', type: 'Dining', gradientClass: 'from-[#6D2E46] to-[#A26769]', accentColor: '#D4A373' },
  { id: '8', name: 'Spa & Wellness', type: 'Wellness', gradientClass: 'from-[#606C38] to-[#BC6C25]', accentColor: '#DDA15E' },
  { id: '9', name: 'Fitness Center', type: 'Recreation', gradientClass: 'from-[#1D3557] to-[#457B9D]', accentColor: '#A8DADC' },
  { id: '10', name: 'Sunset Terrace', type: 'Common Area', gradientClass: 'from-[#9D4EDD] to-[#E07BE0]', accentColor: '#C77DFF' },
  { id: '11', name: 'Kids Play Zone', type: 'Family', gradientClass: 'from-[#FF6B6B] to-[#FFA07A]', accentColor: '#FF8C69' },
  { id: '12', name: 'Conference Hall', type: 'Events', gradientClass: 'from-[#2C3E50] to-[#4CA1AF]', accentColor: '#76B7B9' },
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
      {/* Background gradient "photo" */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br',
          photo.gradientClass,
          'transition-transform duration-500 group-hover:scale-105'
        )}
      />

      {/* Abstract overlay pattern */}
      <div
        className="absolute inset-0 opacity-20"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle at 70% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
        }}
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
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
        className="relative w-full max-w-3xl max-h-[85vh] mx-4 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo */}
        <div
          className={cn(
            'w-full max-h-[70vh] rounded-2xl bg-gradient-to-br overflow-hidden shadow-2xl',
            photo.gradientClass
          )}
          style={{
            minHeight: 300,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Large decorative abstract element */}
              <svg viewBox="0 0 200 200" className="w-48 h-48 opacity-20" aria-hidden="true">
                <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="1" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="0.5" />
                <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="0.5" />
                <path d="M40 100 Q100 40 160 100 Q100 160 40 100Z" fill="none" stroke="white" strokeWidth="0.5" />
              </svg>
              <div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.25) 0%, transparent 60%)',
                }}
              />
            </div>
          </div>
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