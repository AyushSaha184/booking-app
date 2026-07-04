'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Hotel, Waves, Binoculars, Leaf, Utensils, MapPin, BedDouble } from 'lucide-react'

interface PhotoItem {
  id: string
  name: string
  type: string
  src: string
}

const PHOTOS: PhotoItem[] = [
  { id: '1', name: 'Resort Exterior', type: 'Common Area', src: '/assets/IMG-20260622-WA0036.webp' },
  { id: '2', name: 'Swimming Pool', type: 'Recreation', src: '/assets/IMG-20260622-WA0035.webp' },
  { id: '3', name: 'Pool Area', type: 'Recreation', src: '/assets/IMG-20260622-WA0034.webp' },
  { id: '4', name: 'Resort View', type: 'Common Area', src: '/assets/IMG-20260622-WA0033.webp' },
  { id: '5', name: 'Garden', type: 'Common Area', src: '/assets/IMG-20260622-WA0032.webp' },
  { id: '6', name: 'Restaurant', type: 'Dining', src: '/assets/IMG-20260622-WA0031.webp' },
  { id: '7', name: 'Dining Hall', type: 'Dining', src: '/assets/IMG-20260622-WA0030.webp' },
  { id: '8', name: 'Food & Service', type: 'Dining', src: '/assets/IMG-20260622-WA0029.webp' },
  { id: '9', name: 'Entrance', type: 'Common Area', src: '/assets/IMG-20260622-WA0028.webp' },
  { id: '10', name: 'Property View', type: 'Common Area', src: '/assets/IMG-20260622-WA0027.webp' },
  { id: '11', name: 'Room Interior', type: 'Accommodation', src: '/assets/IMG-20260622-WA0026.webp' },
  { id: '12', name: 'Guest Room', type: 'Accommodation', src: '/assets/IMG-20260622-WA0025.webp' },
]

interface PhotoGalleryProps {
  onBack?: () => void
}

// Custom SVGs for photo cards
const ClocheIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 18h18" />
    <path d="M12 5a2 2 0 0 1 2 2h-4a2 2 0 0 1 2-2z" />
    <path d="M5 14a7 7 0 0 1 14 0v2H5v-2z" />
  </svg>
)

const DoubleDoorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 3h14a2 2 0 0 1 2 2v16H3V5a2 2 0 0 1 2-2z" />
    <path d="M12 3v18" />
  </svg>
)

function getPhotoIcon(name: string) {
  switch (name) {
    case 'Resort Exterior':
      return <Hotel className="w-4 h-4 text-[#7C1A36]" />
    case 'Swimming Pool':
    case 'Pool Area':
      return <Waves className="w-4 h-4 text-[#7C1A36]" />
    case 'Resort View':
      return <Binoculars className="w-4 h-4 text-[#7C1A36]" />
    case 'Garden':
      return <Leaf className="w-4 h-4 text-[#7C1A36]" />
    case 'Restaurant':
      return <Utensils className="w-4 h-4 text-[#7C1A36]" />
    case 'Dining Hall':
    case 'Food & Service':
      return <ClocheIcon className="w-4 h-4 text-[#7C1A36]" />
    case 'Entrance':
      return <DoubleDoorIcon className="w-4 h-4 text-[#7C1A36]" />
    case 'Property View':
      return <MapPin className="w-4 h-4 text-[#7C1A36]" />
    case 'Room Interior':
    case 'Guest Room':
      return <BedDouble className="w-4 h-4 text-[#7C1A36]" />
    default:
      return <Hotel className="w-4 h-4 text-[#7C1A36]" />
  }
}

export default function PhotoGallery({ onBack }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const goNext = () => setLightboxIndex(prev => prev !== null && prev < PHOTOS.length - 1 ? prev + 1 : prev)
  const goPrev = () => setLightboxIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev)

  return (
    <div className="w-full space-y-6">
      {/* Title block */}
      <div className="text-left px-1 space-y-1">
        <h1 className="font-serif text-3xl font-bold text-gray-900 leading-tight">
          Photo <span className="text-[#7C1A36]">Gallery</span>
        </h1>
        <p className="text-xs text-gray-500">Explore the beauty of Dorshi Resort</p>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {PHOTOS.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            onClick={() => openLightbox(index)}
            className="group flex flex-col bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all duration-350 overflow-hidden cursor-pointer"
          >
            {/* Image container - completely clean, no text/labels overlay */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50 shrink-0">
              <Image
                src={photo.src}
                alt={photo.name}
                fill
                loading="lazy"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>

            {/* Bottom Card Strip */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-t border-gray-100 text-left">
              {/* Left Circular Badge */}
              <div className="w-8 h-8 rounded-full bg-[#7C1A36]/5 border border-[#7C1A36]/15 flex items-center justify-center shrink-0">
                {getPhotoIcon(photo.name)}
              </div>
              {/* Right Text Label */}
              <span className="text-xs sm:text-[13px] font-bold text-gray-900 leading-none truncate font-sans">
                {photo.name}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xs grid place-items-center hover:bg-white/20 transition-colors z-10 cursor-pointer"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation Buttons */}
            {lightboxIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xs grid place-items-center hover:bg-white/20 transition-colors z-10 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {lightboxIndex < PHOTOS.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xs grid place-items-center hover:bg-white/20 transition-colors z-10 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={PHOTOS[lightboxIndex].src}
                  alt={PHOTOS[lightboxIndex].name}
                  fill
                  loading="eager"
                  className="object-contain"
                  sizes="90vw"
                />
              </div>

              {/* Caption */}
              <div className="mt-4 text-center">
                <p className="text-white font-semibold text-lg">{PHOTOS[lightboxIndex].name}</p>
                <p className="text-white/60 text-sm">{PHOTOS[lightboxIndex].type}</p>
              </div>
            </motion.div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xs text-white text-sm font-medium">
              {lightboxIndex + 1} / {PHOTOS.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}