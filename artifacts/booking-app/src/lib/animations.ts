import type { Variants, Transition } from 'framer-motion';

export const transitions: Record<'smooth' | 'spring' | 'bounce', Transition> = {
  smooth: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  spring: { type: 'spring', stiffness: 400, damping: 30 },
  bounce: { type: 'spring', stiffness: 500, damping: 20 },
};

export const checkmarkDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut', delay: 0.2 },
  },
};

export const bounceIn: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20, delay: 0.1 },
  },
};
