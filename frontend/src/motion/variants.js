// ── Shared Framer Motion variants — tuned for 60fps silk ────────────────────
// All animations use GPU-accelerated properties: opacity, transform.
// Spring params are calibrated for snappy-but-soft iOS-quality feel.

export const cardVariants = {
  enter:  { opacity: 0, x: 40, scale: 0.97 },
  center: { opacity: 1, x: 0,  scale: 1 },
  exit:   { opacity: 0, x: -40, scale: 0.97 },
}

export const cardTransition = {
  duration: 0.26,
  ease: [0.16, 1, 0.3, 1],
}

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] } },
}

export const fadeUpStagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.065, delayChildren: 0.05 } },
}

export const fadeUpItem = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
  },
}

// ── Swipe deck ────────────────────────────────────────────────────────────────

// Snappy spring for card stack settling
export const deckSpring = {
  type: 'spring',
  stiffness: 380,   // ↑ snappier than before
  damping: 34,
  mass: 0.85,
  restSpeed: 0.5,
  restDelta: 0.001,
}

// Fly-out / fly-in: fast exponential deceleration
export const deckTravel = {
  duration: 0.30,
  ease: [0.32, 0.72, 0, 1],  // expo decel — very fast start, silky settle
}

// Off-screen distance (symmetric for swipe left & right)
export const deckFlyX = () =>
  typeof window !== 'undefined' ? Math.max(window.innerWidth, 480) * 0.92 : 620

// Stack geometry — subtle depth illusion
export const deckSlot = (depth) => ({
  scale:   1 - depth * 0.042,
  y:       depth * 14,
  opacity: depth >= 2 ? 0.48 : 1,
})
