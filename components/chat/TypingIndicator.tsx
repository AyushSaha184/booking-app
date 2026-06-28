'use client'

import { motion } from 'framer-motion'

/** Three bouncing dots typing indicator — luxury cream style */
export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start items-start pl-11"
      aria-label="Assistant is typing"
      role="status"
    >
      <div className="bg-[rgba(255,255,255,0.75)] backdrop-blur-md border border-[rgba(185,60,60,0.15)] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#B93C3C] block"
              animate={{
                height: [6, 16, 6],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                repeat: Infinity,
                duration: 1,
                ease: 'easeInOut',
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
