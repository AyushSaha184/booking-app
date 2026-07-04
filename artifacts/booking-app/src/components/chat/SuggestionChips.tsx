import { motion } from 'framer-motion';
import { Calendar, XCircle, Image as ImageIcon, ChevronRight } from 'lucide-react';
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
    sub: 'Reserve a room for your dates',
    iconBg: 'bg-[#8B1538]/10',
    iconColor: 'text-[#8B1538]',
    accent: '#8B1538',
  },
  {
    view: 'cancellation' as const,
    icon: XCircle,
    label: 'Cancel Booking',
    sub: 'Manage an existing reservation',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    accent: '#374151',
  },
  {
    view: 'photos' as const,
    icon: ImageIcon,
    label: 'View Gallery',
    sub: 'Explore our resort & dining',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    accent: '#D97706',
  },
];

export default function SuggestionChips({ onSelectView }: SuggestionChipsProps) {
  return (
    <div className="px-4 pt-8 pb-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8 text-center"
      >
        <p className="text-xs font-semibold tracking-[0.18em] text-[#8B1538]/70 uppercase mb-3">
          Dorshi Holiday Resort
        </p>
        <h1 className="font-serif text-[2.4rem] leading-[1.15] text-gray-900">
          Your Dream Stay
          <br />
          <em className="text-[#8B1538] not-italic font-serif italic">Awaits</em>
        </h1>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
          Premium rooms, fine dining, and memorable experiences — all in one place.
        </p>
      </motion.div>

      {/* Action cards */}
      <div className="space-y-3">
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.view}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.07 }}
              onClick={() => onSelectView(card.view)}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-4 bg-white rounded-2xl px-4 py-4 border border-gray-100 shadow-sm active:bg-gray-50 text-left"
            >
              <div className={cn('w-11 h-11 rounded-xl grid place-items-center shrink-0', card.iconBg)}>
                <Icon className={cn('w-5 h-5', card.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{card.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </motion.button>
          );
        })}
      </div>

    </div>
  );
}
