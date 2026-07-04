import { motion } from 'framer-motion';
import { Calendar, XCircle, Image as ImageIcon, ArrowRight, Star, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    iconBg: 'bg-[#8B1538]/8',
    iconColor: 'text-[#8B1538]',
    borderHover: 'hover:border-[#8B1538]/20',
    bgHover: 'hover:bg-[#8B1538]/[0.02]',
  },
  {
    view: 'cancellation' as const,
    icon: XCircle,
    label: 'Cancel Booking',
    sub: 'Manage your reservation',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    borderHover: 'hover:border-gray-300',
    bgHover: 'hover:bg-gray-50/50',
  },
  {
    view: 'photos' as const,
    icon: ImageIcon,
    label: 'View Gallery',
    sub: 'Explore our resort',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    borderHover: 'hover:border-amber-200',
    bgHover: 'hover:bg-amber-50/30',
  },
];

export default function SuggestionChips({ onSelectView }: SuggestionChipsProps) {
  return (
    <div className="px-5 pt-10 pb-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-3.5 h-3.5 text-[#8B1538]/60" />
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#8B1538]/60 uppercase">
            Dorshi Holiday Resort
          </p>
        </div>
        <h1 className="font-serif text-[2.8rem] leading-[1.1] text-gray-900 mb-4">
          Your Dream
          <br />
          <span className="text-[#8B1538]">Stay Awaits</span>
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
          Premium rooms, fine dining, and memorable experiences crafted for discerning travelers.
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs text-gray-400 font-medium">4.9 · 200+ reviews</span>
        </div>
      </motion.div>

      {/* Action cards */}
      <div className="space-y-3">
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + i * 0.08 }}
              onClick={() => onSelectView(card.view)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full flex items-center gap-4 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm transition-all duration-200 active:scale-[0.98] text-left',
                card.borderHover,
                card.bgHover,
              )}
            >
              <div className={cn('w-12 h-12 rounded-xl grid place-items-center shrink-0', card.iconBg)}>
                <Icon className={cn('w-5 h-5', card.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-[15px]">{card.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-50 grid place-items-center shrink-0">
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Quick info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mt-8 grid grid-cols-3 gap-3"
      >
        {[
          { label: '6 Rooms', sub: 'All categories' },
          { label: '24/7', sub: 'Front desk' },
          { label: 'In-house', sub: 'Restaurant' },
        ].map((item) => (
          <div key={item.label} className="bg-white/60 rounded-xl px-3 py-3 border border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-900">{item.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
