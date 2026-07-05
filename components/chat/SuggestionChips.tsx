'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, XCircle, Image as ImageIcon, Star, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ChatView = 'welcome' | 'booking' | 'cancellation' | 'photos'

interface SuggestionChipsProps {
  onSelectView: (view: 'booking' | 'cancellation' | 'photos') => void
}

type CardView = 'booking' | 'cancellation' | 'photos'

interface CardConfig {
  view: CardView
  icon: React.ReactNode
  title: string
  subtitle: string
  iconColor: string
  iconBg: string
  iconBorder: string
}

const CARDS: CardConfig[] = [
  {
    view: 'booking',
    icon: <Calendar className="w-5 h-5" />,
    title: 'Book Your Stay',
    subtitle: 'Check availability & reserve',
    iconColor: 'text-[#7C1A36]',
    iconBg: 'bg-[#7C1A36]/5',
    iconBorder: 'border-[#7C1A36]/15',
  },
  {
    view: 'cancellation',
    icon: <XCircle className="w-5 h-5" />,
    title: 'Cancel Booking',
    subtitle: 'Manage your reservation',
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-100',
    iconBorder: 'border-gray-200',
  },
  {
    view: 'photos',
    icon: <ImageIcon className="w-5 h-5" />,
    title: 'View Gallery',
    subtitle: 'Explore our resort',
    iconColor: 'text-[#D4A574]',
    iconBg: 'bg-[#D4A574]/10',
    iconBorder: 'border-[#D4A574]/20',
  },
]

// Custom SVG Icons for the bottom stats card
const DoubleDoorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8 text-[#7C1A36]"
    {...props}
  >
    <path d="M5 3h14a2 2 0 0 1 2 2v16H3V5a2 2 0 0 1 2-2z" />
    <path d="M12 3v18" />
    <circle cx="9" cy="12" r="0.75" fill="currentColor" />
    <circle cx="15" cy="12" r="0.75" fill="currentColor" />
  </svg>
)

const Clock24Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8 text-[#7C1A36]"
    {...props}
  >
    <path d="M21.5 2v6h-6" />
    <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l.73-.73" />
    <text x="12" y="15" fontSize="7.5" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">24</text>
  </svg>
)

const ClocheIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8 text-[#7C1A36]"
    {...props}
  >
    <path d="M3 18h18" />
    <path d="M12 5a2 2 0 0 1 2 2h-4a2 2 0 0 1 2-2z" />
    <path d="M5 14a7 7 0 0 1 14 0v2H5v-2z" />
  </svg>
)

export default function SuggestionChips({ onSelectView }: SuggestionChipsProps) {
  return (
    <div className="w-full space-y-8 py-4">
      {/* Hero Section */}
      <div className="text-center space-y-4 px-4">
        {/* Location Tag */}
        <div className="inline-flex items-center gap-1.5 justify-center text-xs font-semibold tracking-wider text-[#A12444] uppercase">
          <MapPin className="w-3.5 h-3.5 text-[#A12444]" />
          <span>Dorshi Holiday Resort</span>
        </div>

        {/* Main Heading */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-serif text-gray-900 leading-tight">
            Your Dream
            <br />
            <span className="text-[#7C1A36]">Stay Awaits</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto leading-relaxed">
            Premium rooms, fine dining, and memorable experiences crafted for discerning travelers.
          </p>
        </div>

        {/* Rating Block */}
        <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
          <div className="flex gap-0.5 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <div className="relative w-4 h-4 shrink-0">
              <Star className="absolute top-0 left-0 w-4 h-4 text-amber-500" />
              <div className="absolute top-0 left-0 w-2 h-4 overflow-hidden">
                <Star className="w-4 h-4 fill-current text-amber-500" />
              </div>
            </div>
          </div>
          <span className="font-semibold ml-1">4.5</span>
          <span className="text-gray-400 font-normal ml-0.5">•</span>
          <span className="text-gray-400">100+ reviews</span>
        </div>
      </div>

      {/* Action Cards List */}
      <div className="space-y-5 max-w-xl mx-auto px-4">
        {CARDS.map((card) => (
          <button
            key={card.view}
            onClick={() => onSelectView(card.view)}
            className="w-full flex items-center bg-white rounded-3xl py-5 px-6 sm:py-6 sm:px-8 border border-gray-200 shadow-xs hover:shadow-md active:scale-[0.99] transition-all duration-200 text-left cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              {/* Icon Container */}
              <div className={cn(
                "w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105",
                card.iconBg,
                card.iconBorder,
                card.iconColor
              )}>
                {card.icon}
              </div>

              {/* Text */}
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight font-sans">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mt-0.5">
                  {card.subtitle}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Stats Card */}
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs divide-x divide-gray-100 grid grid-cols-3 p-5 text-center">
          {/* Column 1 */}
          <div className="flex flex-col items-center justify-center space-y-1 py-1">
            <DoubleDoorIcon />
            <span className="text-sm font-bold text-gray-900 font-sans">9 Rooms</span>
            <span className="text-[10px] text-gray-400 font-medium">All categories</span>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col items-center justify-center space-y-1 py-1">
            <Clock24Icon />
            <span className="text-sm font-bold text-gray-900 font-sans">24/7</span>
            <span className="text-[10px] text-gray-400 font-medium">Front desk</span>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col items-center justify-center space-y-1 py-1">
            <ClocheIcon />
            <span className="text-sm font-bold text-gray-900 font-sans">In-house</span>
            <span className="text-[10px] text-gray-400 font-medium">Restaurant</span>
          </div>
        </div>
      </div>
    </div>
  )
}
