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

// ── Swipe deck — premium physics ─────────────────────────────────────────────

// Softer, more natural spring — feels like a real card settling into place.
// Lower stiffness + slightly higher mass = less robotic, more physical.
export const deckSpring = {
  type: 'spring',
  stiffness: 320,
  damping: 30,
  mass: 0.9,
  restSpeed: 0.4,
  restDelta: 0.001,
}

// Fly-out: faster start, longer travel, silky deceleration
export const deckTravel = {
  duration: 0.34,
  ease: [0.25, 0.8, 0.25, 1],  // custom bezier — fast launch, smooth landing
}

// Off-screen distance — full viewport width + margin for clean exit
export const deckFlyX = () =>
  typeof window !== 'undefined' ? Math.max(window.innerWidth, 480) * 1.05 : 680

// Stack geometry — more visible depth separation + slight rotation for
// a natural "held cards" feel (like holding a small deck in your hand)
export const deckSlot = (depth) => ({
  scale:   1 - depth * 0.05,
  y:       depth * 16,
  rotate:  depth === 1 ? 1.2 : depth === 2 ? -1.8 : 0,
  opacity: depth >= 2 ? 0.4 : 1,
})
