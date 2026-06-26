import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Splash.css'

// ── Premium spring presets ──────────────────────────────────────────────────
const SPRING_SNAPPY  = { type: 'spring', stiffness: 340, damping: 28, mass: 0.8 }
const SPRING_GENTLE  = { type: 'spring', stiffness: 180, damping: 22, mass: 1.0 }
const EASE_EXPO_OUT  = [0.16, 1, 0.3, 1]

export default function Splash({ onDone }) {
  const [phase, setPhase] = useState('enter') // enter → hold → exit

  useEffect(() => {
    // Phase 1: animate in (0 → 0.9s)
    // Phase 2: hold (0.9 → 2.2s)
    // Phase 3: exit (2.2 → 2.9s) → done
    const holdTimer = setTimeout(() => setPhase('exit'), 2200)
    return () => clearTimeout(holdTimer)
  }, [])

  const isExiting = phase === 'exit'

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!isExiting && (
        <motion.div
          className="mf-splash"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.06,
            filter: 'blur(8px)',
            transition: { duration: 0.55, ease: EASE_EXPO_OUT },
          }}
        >
          {/* ── Layered ambient glows ── */}
          <div className="mf-splash__glow" aria-hidden />

          {/* ── Dual orbital rings ── */}
          <div className="mf-splash__ring" aria-hidden />

          {/* ── Main content ── */}
          <div className="mf-splash__content">

            {/* Icon — bounces in with spring */}
            <motion.div
              className="mf-splash__icon"
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ ...SPRING_SNAPPY, delay: 0.08 }}
            >
              🧠
            </motion.div>

            {/* Name — slides up from below with blur reveal */}
            <motion.div
              className="mf-splash__name"
              initial={{ opacity: 0, y: 22, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: EASE_EXPO_OUT, delay: 0.28 }}
            >
              MindFeed
            </motion.div>

            {/* Tagline — fades in after name */}
            <motion.div
              className="mf-splash__tagline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_EXPO_OUT, delay: 0.6 }}
            >
              Γνώση που αξίζει
            </motion.div>

            {/* Loading dots — appear last */}
            <motion.div
              className="mf-splash__dots"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.9 }}
              aria-hidden
            >
              <span className="mf-splash__dot" />
              <span className="mf-splash__dot" />
              <span className="mf-splash__dot" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
