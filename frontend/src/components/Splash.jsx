import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Splash.css'

const EASE_EXPO = [0.16, 1, 0.3, 1]
const SPRING    = { type: 'spring', stiffness: 320, damping: 26, mass: 0.9 }

function NeuralIcon() {
  return (
    <svg className="mf-splash__svg" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      {/* Outer glow ring */}
      <circle cx="48" cy="48" r="44" stroke="url(#rg)" strokeWidth="1.2" strokeDasharray="4 6" opacity="0.5" />
      {/* Inner connections */}
      <line x1="48" y1="14" x2="28" y2="38" stroke="url(#lg1)" strokeWidth="1.4" />
      <line x1="48" y1="14" x2="68" y2="38" stroke="url(#lg1)" strokeWidth="1.4" />
      <line x1="28" y1="38" x2="48" y2="56" stroke="url(#lg2)" strokeWidth="1.4" />
      <line x1="68" y1="38" x2="48" y2="56" stroke="url(#lg2)" strokeWidth="1.4" />
      <line x1="48" y1="56" x2="36" y2="76" stroke="url(#lg2)" strokeWidth="1.2" opacity="0.7" />
      <line x1="48" y1="56" x2="60" y2="76" stroke="url(#lg2)" strokeWidth="1.2" opacity="0.7" />
      <line x1="28" y1="38" x2="14" y2="52" stroke="url(#lg2)" strokeWidth="1" opacity="0.5" />
      <line x1="68" y1="38" x2="82" y2="52" stroke="url(#lg2)" strokeWidth="1" opacity="0.5" />
      {/* Nodes */}
      <circle cx="48" cy="14" r="5.5" fill="url(#ng1)" />
      <circle cx="28" cy="38" r="4.5" fill="url(#ng2)" />
      <circle cx="68" cy="38" r="4.5" fill="url(#ng2)" />
      <circle cx="48" cy="56" r="6"   fill="url(#ng1)" />
      <circle cx="36" cy="76" r="3.5" fill="url(#ng3)" />
      <circle cx="60" cy="76" r="3.5" fill="url(#ng3)" />
      <circle cx="14" cy="52" r="3"   fill="url(#ng3)" opacity="0.6" />
      <circle cx="82" cy="52" r="3"   fill="url(#ng3)" opacity="0.6" />
      {/* Core pulse */}
      <circle cx="48" cy="48" r="8" fill="url(#ngcore)" className="mf-splash__core-pulse" />
      <defs>
        <radialGradient id="rg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.80 0.165 66)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="oklch(0.72 0.18 318)" stopOpacity="0.2" />
        </radialGradient>
        <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.85 0.15 70)" />
          <stop offset="100%" stopColor="oklch(0.80 0.165 66)" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.80 0.165 66)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="oklch(0.72 0.18 318)" stopOpacity="0.3" />
        </linearGradient>
        <radialGradient id="ng1" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="oklch(0.92 0.12 76)" />
          <stop offset="100%" stopColor="oklch(0.78 0.165 64)" />
        </radialGradient>
        <radialGradient id="ng2" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="oklch(0.86 0.13 72)" />
          <stop offset="100%" stopColor="oklch(0.74 0.155 60)" />
        </radialGradient>
        <radialGradient id="ng3" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="oklch(0.80 0.18 318)" />
          <stop offset="100%" stopColor="oklch(0.64 0.17 310)" />
        </radialGradient>
        <radialGradient id="ngcore" cx="40%" cy="38%" r="60%">
          <stop offset="0%" stopColor="oklch(0.95 0.10 75)" />
          <stop offset="100%" stopColor="oklch(0.80 0.165 66)" />
        </radialGradient>
      </defs>
    </svg>
  )
}

// ── Choreography (2.0s total) ────────────────────────────────────────────────
//  0.00–0.55  logo POPS in centered (spring zoom)
//  0.60–1.25  logo glides LEFT while "MindFeed" UNFOLDS to the right from
//             behind it (the name wrapper's maxWidth grows inside the centered
//             flex row, so the logo shifts left naturally — one motion)
//  1.60–2.00  calm exit fade
export default function Splash({ onDone }) {
  const [phase, setPhase] = useState('enter')

  useEffect(() => {
    const t = setTimeout(() => setPhase('exit'), 1600)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {phase !== 'exit' && (
        <motion.div
          className="mf-splash"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.03,
            filter: 'blur(10px)',
            transition: { duration: 0.4, ease: EASE_EXPO },
          }}
        >
          {/* Ambient glow (kept minimal — the logo is the show) */}
          <div className="mf-splash__glow" aria-hidden />

          <div className="mf-splash__content">
            <div className="mf-splash__row">
              {/* Logo — pop in */}
              <motion.div
                className="mf-splash__icon-wrap"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...SPRING, delay: 0.05 }}
              >
                <NeuralIcon />
              </motion.div>

              {/* Wordmark — unfolds rightward from behind the logo.
                  maxWidth 0→260 grows the wrapper inside the centered row,
                  which is what slides the logo leftward at the same time. */}
              <motion.div
                className="mf-splash__name-clip"
                initial={{ maxWidth: 0, opacity: 0 }}
                animate={{ maxWidth: 260, opacity: 1 }}
                transition={{ duration: 0.65, ease: EASE_EXPO, delay: 0.6 }}
                aria-hidden={phase === 'enter' ? undefined : true}
              >
                <motion.span
                  className="mf-splash__name"
                  initial={{ x: -56 }}
                  animate={{ x: 0 }}
                  transition={{ duration: 0.65, ease: EASE_EXPO, delay: 0.6 }}
                >
                  MindFeed
                </motion.span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
