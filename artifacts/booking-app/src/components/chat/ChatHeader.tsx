import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const RESORT_NAME = 'Dorshi Holiday Resort';

interface ChatHeaderProps {
  onClose: () => void;
}

export default function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <header
      className="relative flex items-center justify-between px-5 h-16 bg-white/80 backdrop-blur-xl shrink-0 z-20 border-b border-gray-100"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-10 h-10 rounded-xl bg-[#8B1538] flex items-center justify-center shrink-0 shadow-lg shadow-[#8B1538]/20"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" className="w-5 h-5" aria-hidden="true">
            <path d="M3 21h18M5 21V7l8-4 8 4v14M9 10a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col min-w-0"
        >
          <span className="text-[10px] tracking-[0.2em] text-[#8B1538]/70 uppercase font-semibold leading-none mb-1">
            Welcome to
          </span>
          <span className="text-sm font-bold text-gray-900 truncate tracking-tight leading-tight">
            {RESORT_NAME}
          </span>
        </motion.div>
      </div>
      <button
        onClick={onClose}
        aria-label="Go back"
        title="Go back"
        className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer text-gray-400 hover:text-[#8B1538] hover:bg-[#8B1538]/5 active:scale-95 transition-all duration-200"
      >
        <ArrowLeft className="w-5 h-5" strokeWidth={2} />
      </button>
    </header>
  );
}
