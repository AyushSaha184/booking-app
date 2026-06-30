'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ZoomIn, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoItem {
  id: string
  name: string
  type: string
  src: string
}

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

const categories = ['All', ...Array.from(new Set(PHOTOS.map(p => p.type)))]

export default function PhotoGallery() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filteredPhotos = selectedCategory === 'All'
    ? PHOTOS
    : PHOTOS.filter(p => p.category === selectedCategory)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const goNext = () => setLightboxIndex(prev => prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : prev)
  const goPrev = () => setLightboxIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev)

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 px-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
          <Camera className="w-4 h-4 text-[#D4A574]" />
          <span className="text-sm font-medium text-gray-700">Resort Gallery</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-serif text-gray-900">
          Explore Our <span className="italic text-[#8B1538]">Paradise</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Take a visual journey through Dorshi Holiday Resort cum Restaurant
        </p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap justify-center gap-2 sm:gap-3 px-4"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all",
              selectedCategory === category
                ? "bg-[#8B1538] text-white shadow-lg shadow-[#8B1538]/20"
                : "bg-white text-gray-600 border border-gray-200 hover:border-[#8B1538]/40 hover:text-[#8B1538]"
            )}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* Photo Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 px-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => openLightbox(index)}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300"
            >
              {/* Image */}
              <Image
                src={photo.src}
                alt={photo.name}
                fill
                loading="lazy"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Zoom Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm grid place-items-center shadow-lg">
                  <ZoomIn className="w-6 h-6 text-gray-900" />
                </div>
              </div>

              {/* Category Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 shadow-sm">
                {photo.type}
              </div>

              {/* Title on Hover */}
              <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white font-semibold text-sm sm:text-base">{photo.name}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm grid place-items-center hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation Buttons */}
            {lightboxIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm grid place-items-center hover:bg-white/20 transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {lightboxIndex < filteredPhotos.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm grid place-items-center hover:bg-white/20 transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={filteredPhotos[lightboxIndex].src}
                  alt={filteredPhotos[lightboxIndex].name}
                  fill
                  loading="eager"
                  className="object-contain"
                  sizes="90vw"
                />
              </div>

              {/* Caption */}
              <div className="mt-4 text-center">
                <p className="text-white font-semibold text-lg">{filteredPhotos[lightboxIndex].name}</p>
                <p className="text-white/70 text-sm">{filteredPhotos[lightboxIndex].type}</p>
              </div>
            </motion.div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
              {lightboxIndex + 1} / {filteredPhotos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}