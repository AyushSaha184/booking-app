'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/app/components/ui/GlassCard'

/** Three bouncing dots typing indicator — glass-card style */
export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start"
      aria-label="Assistant is typing"
      role="status"
    >
      <GlassCard className="px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-text-tertiary block"
              animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: 'easeInOut',
                delay: i * 0.18,
              }}
            />
          ))}
        </div>
      </GlassCard>
    </motion.div>
  )
}
