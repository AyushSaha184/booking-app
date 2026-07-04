import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, XCircle, Image as ImageIcon, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ChatView = 'welcome' | 'booking' | 'cancellation' | 'photos';

interface SuggestionChipsProps {
  onSelectView: (view: 'booking' | 'cancellation' | 'photos') => void;
}

type CardView = 'booking' | 'cancellation' | 'photos';

interface CardConfig {
  view: CardView;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  iconColor: string;
  iconBg: string;
  overlayClass: string;
  decorativeClass: string;
}

const CARDS: CardConfig[] = [
  {
    view: 'booking',
    icon: <Calendar className="w-6 h-6" />,
    title: 'Book Your Stay',
    subtitle: 'Reserve your perfect room',
    iconColor: 'text-[#8B1538]',
    iconBg: 'bg-[#8B1538]/10',
    overlayClass: 'bg-gradient-to-br from-[#8B1538] to-[#B93C3C]',
    decorativeClass: 'bg-gradient-to-br from-[#8B1538] to-[#B93C3C]',
  },
  {
    view: 'cancellation',
    icon: <XCircle className="w-6 h-6" />,
    title: 'Cancel Booking',
    subtitle: 'Manage your reservations',
    iconColor: 'text-gray-700',
    iconBg: 'bg-gray-100',
    overlayClass: 'bg-gradient-to-br from-gray-700 to-gray-900',
    decorativeClass: 'bg-gradient-to-br from-gray-700 to-gray-900',
  },
  {
    view: 'photos',
    icon: <ImageIcon className="w-6 h-6" />,
    title: 'View Gallery',
    subtitle: 'Explore our resort',
    iconColor: 'text-[#D4A574]',
    iconBg: 'bg-[#D4A574]/10',
    overlayClass: 'bg-gradient-to-br from-[#D4A574] to-[#B8956A]',
    decorativeClass: 'bg-gradient-to-br from-[#D4A574] to-[#B8956A]',
  },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

export default function SuggestionChips({ onSelectView }: SuggestionChipsProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="w-full max-w-4xl mx-auto space-y-12 py-8"
    >
      <motion.div variants={staggerItem} className="text-center space-y-6 px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-[#D4A574]" />
          <span className="text-sm font-medium text-gray-700">Dorshi Resort</span>
        </motion.div>

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

      <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 px-4">
        {CARDS.map((card) => (
          <motion.button
            key={card.view}
            variants={staggerItem}
            onClick={() => onSelectView(card.view)}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="group relative bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-300 text-left overflow-hidden"
          >
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300", card.overlayClass)} />
            <div className={cn("w-14 h-14 rounded-2xl grid place-items-center mb-6 transition-all duration-300", card.iconBg, "group-hover:scale-110")}>
              <div className={card.iconColor}>{card.icon}</div>
            </div>
            <div className="space-y-2 relative z-10">
              <h3 className="text-xl sm:text-2xl font-serif text-gray-900 group-hover:text-[#8B1538] transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{card.subtitle}</p>
            </div>
            <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-gray-100 grid place-items-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </div>
            <div className={cn("absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500", card.decorativeClass)} />
          </motion.button>
        ))}
      </motion.div>

      <motion.div variants={staggerItem} className="text-center pt-8 border-t border-gray-100 mx-4">
        <p className="text-sm text-gray-400">✨ Premium hospitality since 2024</p>
      </motion.div>
    </motion.div>
  );
}
