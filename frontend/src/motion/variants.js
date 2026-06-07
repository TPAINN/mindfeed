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
