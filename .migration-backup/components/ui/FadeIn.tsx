'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { fadeIn, slideUp, slideDown, slideLeft, slideRight } from '@/lib/animations'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

interface MotionWrapperProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate' | 'exit'> {
  direction?: Direction
  delay?: number
  duration?: number
  children: React.ReactNode
  /** When true, wraps content in motion.div triggered once it enters view */
  once?: boolean
}

const directionVariants = {
  up: slideUp,
  down: slideDown,
  left: slideLeft,
  right: slideRight,
  none: fadeIn,
}

/**
 * Fade-in animation wrapper using Framer Motion.
 *
 * @example
 * <FadeIn direction="up" delay={0.1}>
 *   <Card />
 * </FadeIn>
 */
function FadeIn({
  direction = 'none',
  delay = 0,
  duration,
  className,
  children,
  ...props
}: MotionWrapperProps) {
  const variants = directionVariants[direction]

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      transition={
        delay || duration
          ? { delay, duration: duration ?? 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
          : undefined
      }
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Slide-in animation wrapper — alias for FadeIn with a direction pre-set.
 * Uses Framer Motion viewport detection when `once` is true.
 */
function SlideIn({
  direction = 'up',
  delay = 0,
  once = true,
  className,
  children,
  ...props
}: MotionWrapperProps) {
  const variants = directionVariants[direction]

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-50px' }}
      className={className}
      transition={delay ? { delay } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export { FadeIn, SlideIn }
export type { MotionWrapperProps, Direction }
