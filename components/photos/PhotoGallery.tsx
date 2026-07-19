'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface PhotoItem {
  id: string
  name: string
  type: string
  src: string
}

// Map of filename -> Uploadthing URL
const UPLOADTHING_MAP: Record<string, string> = {
  'IMG-20260622-WA0036.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6prKkHiYjKR7N4FJPQ2mGlYWvAruVq6MZIH8O',
  'IMG-20260622-WA0035.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP61IggExs6jWF2iHUkOYM7Jlpom93fnxTdwyhs',
  'IMG-20260622-WA0034.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6X3f2ambjYQR19CaySjfgwZDKWTOFVc40iMr8',
  'IMG-20260622-WA0033.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6gIRtNmb7wGoQbUMIBLFxnW2HP85cXvj0dkyr',
  'IMG-20260622-WA0032.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6U18hg96RCQ9vWSPXHxqt6BDVLY5cdoTjGAuN',
  'IMG-20260622-WA0031.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6o1SCE29M2VODXbtJ6sv7KpjdgQuwznfHEiLh',
  'IMG-20260622-WA0030.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP60BkUXPJ6b98IUOSWDKArR3weLisupzCZFamj',
  'IMG-20260622-WA0029.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP65oB00hEC4Y7NAMGmTPjtHEIpvibeg1n6OsJZ',
  'IMG-20260622-WA0028.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6X3n87oDjYQR19CaySjfgwZDKWTOFVc40iMr8',
  'IMG-20260622-WA0027.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6dQEvYtwxRU1nrCHIV3qL7jmuaMG2XcTy8tDb',
  'IMG-20260622-WA0026.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6JXBLl4ldcWb1mAxFR05i2EgIVfeHrG9BKtsS',
  'IMG-20260622-WA0025.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6WjfSb2CjclE9KRZqu73dmpwvTt2QW4rk5exV',
  'IMG-20260622-WA0024.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6BvlihMHFQghYPHaclWskNjZFCxnAfSdeGm9o',
  'IMG-20260622-WA0023.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6NddHHvv0duP673yf52v8aqLtGAnEHF1cxj4C',
  'IMG-20260622-WA0022.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6WX5NdD2CjclE9KRZqu73dmpwvTt2QW4rk5ex',
  'IMG-20260622-WA0021.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP63DEpFLu9vZlaqT8U1rVthuHwOoBPQpNRSfIC',
  'IMG-20260622-WA0020.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6IsW0NjQqpQEN0xgUWy5DYVO167LKCBZdR9SH',
  'IMG-20260622-WA0019.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6doYgLQwxRU1nrCHIV3qL7jmuaMG2XcTy8tDb',
  'IMG-20260622-WA0018.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6vSfWEWVEAa3UZgxVJ2QGqbFS6fmRjXLN1WDB',
  'IMG-20260622-WA0017.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6tUqTXcnZVASa0fLHuKlFrywE2gIpkomWhQN8',
  'IMG-20260622-WA0016.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6gZym6vib7wGoQbUMIBLFxnW2HP85cXvj0dky',
  'IMG-20260622-WA0015.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6o3PNng9M2VODXbtJ6sv7KpjdgQuwznfHEiLh',
  'IMG-20260622-WA0014.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6dpicSlwxRU1nrCHIV3qL7jmuaMG2XcTy8tDb',
  'IMG-20260622-WA0013.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6iym1XXzRN2GmseSVFMYPauDoUXT78QWHvzCn',
  'IMG-20260622-WA0012.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6X33cRACjYQR19CaySjfgwZDKWTOFVc40iMr8',
  'IMG-20260622-WA0011.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6G9456ZgFi21nlOsI3xgSDyVuv7ZJqNp5d8ke',
  'IMG-20260622-WA0010.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6rb3jhbqUTz38AaYidDxOsWGoy0vcbjQtFH6N',
  'IMG-20260622-WA0009.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6rLnBmpqUTz38AaYidDxOsWGoy0vcbjQtFH6N',
  'IMG-20260622-WA0008.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6VOLm4NfFjPBQHNYSLR7KMT6aoCdE0Iqpnr45',
  'IMG-20260622-WA0007.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP60PSjpWJ6b98IUOSWDKArR3weLisupzCZFamj',
  'IMG-20260622-WA0006.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP63tv70kBu9vZlaqT8U1rVthuHwOoBPQpNRSfI',
  'IMG-20260622-WA0005.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6lPnTK1ZyBi0Wq4z6apR5gH32wsJcxFuloNkt',
  'IMG-20260622-WA0004.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6S3ynbeRXHBusbWZrTOjCcLRMi9JIxoVhpg28',
  'IMG-20260622-WA0003.webp': 'https://3zbjdbdlp6.ufs.sh/f/NdY5yNM0duP6YhK4d4B3L89TA5NsS2gwKW4IGRlVmEHvoJnF',
}

const getPhotoSrc = (filename: string) => {
  return UPLOADTHING_MAP[filename] || `/assets/${filename}`
}

const PHOTOS: PhotoItem[] = [
  { id: '1', name: 'Resort Exterior', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0036.webp') },
  { id: '2', name: 'Swimming Pool', type: 'Recreation', src: getPhotoSrc('IMG-20260622-WA0035.webp') },
  { id: '3', name: 'Pool Area', type: 'Recreation', src: getPhotoSrc('IMG-20260622-WA0034.webp') },
  { id: '4', name: 'Resort View', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0033.webp') },
  { id: '5', name: 'Garden', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0032.webp') },
  { id: '6', name: 'Restaurant', type: 'Dining', src: getPhotoSrc('IMG-20260622-WA0031.webp') },
  { id: '7', name: 'Dining Hall', type: 'Dining', src: getPhotoSrc('IMG-20260622-WA0030.webp') },
  { id: '8', name: 'Food & Service', type: 'Dining', src: getPhotoSrc('IMG-20260622-WA0029.webp') },
  { id: '9', name: 'Entrance', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0028.webp') },
  { id: '10', name: 'Property View', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0027.webp') },
  { id: '11', name: 'Room Interior', type: 'Accommodation', src: getPhotoSrc('IMG-20260622-WA0026.webp') },
  { id: '12', name: 'Guest Room', type: 'Accommodation', src: getPhotoSrc('IMG-20260622-WA0025.webp') },
  { id: '13', name: 'Bedroom Suite', type: 'Accommodation', src: getPhotoSrc('IMG-20260622-WA0024.webp') },
  { id: '14', name: 'Bathroom', type: 'Accommodation', src: getPhotoSrc('IMG-20260622-WA0023.webp') },
  { id: '15', name: 'Room Amenities', type: 'Accommodation', src: getPhotoSrc('IMG-20260622-WA0022.webp') },
  { id: '16', name: 'Balcony View', type: 'Accommodation', src: getPhotoSrc('IMG-20260622-WA0021.webp') },
  { id: '17', name: 'Evening View', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0020.webp') },
  { id: '18', name: 'Landscaping', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0019.webp') },
  { id: '19', name: 'Outdoor Seating', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0018.webp') },
  { id: '20', name: 'Walkway', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0017.webp') },
  { id: '21', name: 'Surroundings', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0016.webp') },
  { id: '22', name: 'Resort Facade', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0015.webp') },
  { id: '23', name: 'Another View', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0014.webp') },
  { id: '24', name: 'Scenic Shot', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0013.webp') },
  { id: '25', name: 'More Views', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0012.webp') },
  { id: '26', name: 'Property Shot', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0011.webp') },
  { id: '27', name: 'Resort Scene', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0010.webp') },
  { id: '28', name: 'Corridor', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0009.webp') },
  { id: '29', name: 'Interior', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0008.webp') },
  { id: '30', name: 'Detail Shot', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0007.webp') },
  { id: '31', name: 'Resort Area', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0006.webp') },
  { id: '32', name: 'Final View', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0005.webp') },
  { id: '33', name: 'Overview', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0004.webp') },
  { id: '34', name: 'Resort Grounds', type: 'Common Area', src: getPhotoSrc('IMG-20260622-WA0003.webp') },
]

export default function PhotoGallery({ onBack }: { onBack?: () => void }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const goNext = () => setLightboxIndex(prev => prev !== null && prev < PHOTOS.length - 1 ? prev + 1 : prev)
  const goPrev = () => setLightboxIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev)

  return (
    <div className="w-full space-y-6">
      {/* Title block */}
      <div className="text-center px-1 space-y-1">
        <h1 className="font-serif text-3xl font-bold text-gray-900 leading-tight">
          Photo Gallery
        </h1>
        <p className="text-sm text-gray-400">Explore the beauty of Dorshi Resort</p>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {PHOTOS.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
            onClick={() => openLightbox(index)}
            className="group relative aspect-[4/3] w-full bg-gray-50 rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all duration-350 overflow-hidden cursor-pointer shrink-0"
          >
            <Image
              src={photo.src}
              alt={photo.name}
              fill
              loading="lazy"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
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