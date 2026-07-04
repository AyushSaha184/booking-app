import { motion } from 'framer-motion';
import { Calendar, XCircle, Image as ImageIcon, ArrowRight, Star, MapPin, DoorOpen, Clock, UtensilsCrossed } from 'lucide-react';

export type ChatView = 'welcome' | 'booking' | 'cancellation' | 'photos';

interface SuggestionChipsProps {
  onSelectView: (view: 'booking' | 'cancellation' | 'photos') => void;
}

const CARDS = [
  {
    view: 'booking' as const,
    icon: Calendar,
    label: 'Book Your Stay',
    sub: 'Check availability & reserve',
    iconBg: 'bg-[#8B1538]/10',
    iconColor: 'text-[#8B1538]',
  },
  {
    view: 'cancellation' as const,
    icon: XCircle,
    label: 'Cancel Booking',
    sub: 'Manage your reservation',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-500',
  },
  {
    view: 'photos' as const,
    icon: ImageIcon,
    label: 'View Gallery',
    sub: 'Explore our resort',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

const INFO = [
  { icon: DoorOpen, label: '6 Rooms', sub: 'All categories' },
  { icon: Clock,    label: '24/7',    sub: 'Front desk'     },
  { icon: UtensilsCrossed, label: 'In-house', sub: 'Restaurant' },
];

export default function SuggestionChips({ onSelectView }: SuggestionChipsProps) {
  return (
    <div className="px-5 pt-8 pb-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-8"
      >
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin className="w-3 h-3 text-[#8B1538]" />
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#8B1538] uppercase">
            Dorshi Holiday Resort
          </p>
        </div>
        <h1 className="font-serif leading-[1.12] text-gray-900 mb-3">
          <span className="text-4xl sm:text-5xl block">Your Dream</span>
          <span className="text-4xl sm:text-5xl text-[#8B1538] block">Stay Awaits</span>
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
          Premium rooms, fine dining, and memorable experiences crafted for discerning travelers.
        </p>
        <div className="flex items-center gap-2 mt-4">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-sm text-gray-500 font-medium">4.9</span>
          <span className="text-sm text-gray-400">· 200+ reviews</span>
        </div>
      </motion.div>

      {/* Action cards */}
      <div className="space-y-3 mb-6">
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.view}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.07 }}
              onClick={() => onSelectView(card.view)}
              whileTap={{ scale: 0.985 }}
              className="w-full flex items-center gap-4 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 text-left"
            >
              <div className={`w-14 h-14 rounded-xl grid place-items-center shrink-0 ${card.iconBg}`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-[15px]">{card.label}</p>
                <p className="text-sm text-gray-400 mt-0.5">{card.sub}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gray-50 grid place-items-center shrink-0 border border-gray-100">
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Quick info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {INFO.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex flex-col items-center py-5 px-3 gap-2">
                <Icon className="w-5 h-5 text-[#8B1538]" strokeWidth={1.5} />
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{item.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
