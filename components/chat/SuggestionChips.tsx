'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, XCircle, Image as ImageIcon, ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ChatView = 'welcome' | 'booking' | 'cancellation' | 'photos'

interface SuggestionChipsProps {
  onSelectView: (view: 'booking' | 'cancellation' | 'photos') => void
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
}

export default function SuggestionChips({ onSelectView }: SuggestionChipsProps) {
  const cards = [
    {
      view: 'booking' as const,
      icon: <Calendar className="w-6 h-6" />,
      title: 'Book Your Stay',
      subtitle: 'Reserve your perfect room',
      gradient: 'from-[#8B1538] to-[#B93C3C]',
      iconBg: 'bg-[#8B1538]/10'
    },
    {
      view: 'cancellation' as const,
      icon: <XCircle className="w-6 h-6" />,
      title: 'Cancel Booking',
      subtitle: 'Manage your reservations',
      gradient: 'from-gray-700 to-gray-900',
      iconBg: 'bg-gray-100'
    },
    {
      view: 'photos' as const,
      icon: <ImageIcon className="w-6 h-6" />,
      title: 'View Gallery',
      subtitle: 'Explore our resort',
      gradient: 'from-[#D4A574] to-[#B8956A]',
      iconBg: 'bg-[#D4A574]/10'
    }
  ]

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="w-full max-w-4xl mx-auto space-y-12 py-8"
    >
      {/* Hero Section */}
      <motion.div variants={staggerItem} className="text-center space-y-6 px-4">
        {/* Brand Badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-[#D4A574]" />
          <span className="text-sm font-medium text-gray-700">Dorshi Resort</span>
        </motion.div>

        {/* Main Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-gray-900 leading-tight">
            Your Dream Stay
            <br />
            <span className="italic text-[#8B1538]">Awaits</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to Dorshi Holiday Resort cum Restaurant. Choose how you'd like to continue —
            we're here to make every moment memorable.
          </p>
        </div>
      </motion.div>

      {/* Action Cards */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 px-4"
      >
        {cards.map((card) => (
          <motion.button
            key={card.view}
            variants={staggerItem}
            onClick={() => onSelectView(card.view)}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="group relative bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 text-left overflow-hidden"
          >
            {/* Gradient Overlay on Hover */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
              card.gradient
            )} />

            {/* Icon */}
            <div className={cn(
              "w-14 h-14 rounded-2xl grid place-items-center mb-6 transition-all duration-300",
              card.iconBg,
              "group-hover:scale-110"
            )}>
              <div className={cn("text-transparent bg-clip-text bg-gradient-to-br", card.gradient)}>
                {card.icon}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2 relative z-10">
              <h3 className="text-xl sm:text-2xl font-serif text-gray-900 group-hover:text-[#8B1538] transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {card.subtitle}
              </p>
            </div>

            {/* Arrow */}
            <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-gray-100 grid place-items-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </div>

            {/* Decorative Element */}
            <div className={cn(
              "absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500",
              `bg-gradient-to-br ${card.gradient}`
            )} />
          </motion.button>
        ))}
      </motion.div>

      {/* Footer Note */}
      <motion.div
        variants={staggerItem}
        className="text-center pt-8 border-t border-gray-100 mx-4"
      >
        <p className="text-sm text-gray-400">
          ✨ Premium hospitality since 2024
        </p>
      </motion.div>
    </motion.div>
  )
}