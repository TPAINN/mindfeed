// Shared Framer Motion variants — import these everywhere

export const cardVariants = {
  enter:  { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit:   { opacity: 0, x: -40 },
}

export const cardTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
}

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
}

export const fadeUpStagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
}

export const fadeUpItem = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
}

// ── Swipe deck ────────────────────────────────────────────────
// Snappy but soft — used when cards settle into their stack slot.
export const deckSpring = {
  type: 'spring',
  stiffness: 320,
  damping: 32,
  mass: 0.9,
}

// Flying off screen after a committed swipe.
export const deckExit = {
  duration: 0.34,
  ease: [0.32, 0.72, 0, 1],
}

// Stack geometry per depth (0 = top card).
export const deckSlot = (depth) => ({
  scale: 1 - depth * 0.05,
  y: depth * 16,
  opacity: depth >= 2 ? 0.5 : 1,
})
