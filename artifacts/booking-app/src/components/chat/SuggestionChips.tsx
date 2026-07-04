import { motion } from 'framer-motion';
import { Calendar, XCircle, Image as ImageIcon, ArrowRight, DoorOpen, Clock, UtensilsCrossed } from 'lucide-react';

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
    iconColor: 'text-gray-400',
  },
  {
    view: 'photos' as const,
    icon: ImageIcon,
    label: 'View Gallery',
    sub: 'Explore our resort',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
];

const INFO = [
  { icon: DoorOpen,          label: '6 Rooms',  sub: 'All categories' },
  { icon: Clock,             label: '24/7',     sub: 'Front desk'     },
  { icon: UtensilsCrossed,   label: 'In-house', sub: 'Restaurant'     },
];

export default function SuggestionChips({ onSelectView }: SuggestionChipsProps) {
  return (
    <div className="px-5 pt-10 pb-10">
      {/* ── Hero heading ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-10"
      >
        {/* Two-tone serif heading */}
        <h1 className="font-serif leading-[1.08] mb-4" style={{ letterSpacing: '0.01em' }}>
          <span className="block text-[2.8rem] sm:text-[3.6rem] text-gray-900 font-normal">Your Dream</span>
          <span className="block text-[2.8rem] sm:text-[3.6rem] text-[#8B1538] font-normal">Stay Awaits</span>
        </h1>

      </motion.div>
      {/* ── Action cards ── */}
      <div className="space-y-3 mb-5">
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.view}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.12 + i * 0.08 }}
              onClick={() => onSelectView(card.view)}
              whileTap={{ scale: 0.985 }}
              className="w-full flex items-center gap-4 bg-white rounded-2xl px-4 py-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 active:scale-[0.99] transition-all duration-200 text-left"
            >
              {/* Icon box */}
              <div className={`w-[60px] h-[60px] rounded-xl grid place-items-center shrink-0 ${card.iconBg}`}>
                <Icon className={`w-7 h-7 ${card.iconColor}`} strokeWidth={1.5} />
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-base">{card.label}</p>
                <p className="text-sm text-gray-400 mt-0.5">{card.sub}</p>
              </div>

              {/* Arrow */}
              <div className="w-9 h-9 rounded-full border border-gray-200 bg-white grid place-items-center shrink-0">
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </motion.button>
          );
        })}
      </div>
      {/* ── Info strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.52, duration: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {INFO.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex flex-col items-center justify-center py-6 px-3 gap-2.5">
                <Icon className="w-6 h-6 text-[#8B1538]" strokeWidth={1.5} />
                <p className="text-sm font-bold text-gray-900 text-center">{item.label}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
