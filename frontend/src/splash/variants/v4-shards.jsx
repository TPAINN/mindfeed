import { useMemo } from 'react'
import { motion } from 'framer-motion'

/* ── Variant 4 — "Shards" (Motion), chosen default ──────────────────────────
   Six faceted gem-diamonds fly in from every direction and lock into a star
   around the mark. Landing rings pulse outward as the last shard settles,
   the wordmark rises letter-by-letter, and an amber rule draws beneath the
   word. Framer springs give each lock a soft overshoot — pure "animations
   that just happen". Reduced motion renders the locked, complete frame.   */

const WORD = 'MindFeed'
const N = 6
const R = 132          // ring radius for shard centers
const SHARD = 26       // shard size

// Shard i rests at slot angle i*60°, tip pointing outward (diamond = slot+45).
function slot(i) {
  const a = (i / N) * Math.PI * 2 - Math.PI / 2
  return { x: Math.cos(a) * R, y: Math.sin(a) * R, rot: (i / N) * 360 - 90 + 45 }
}

const SHARDS = Array.from({ length: N }, (_, i) => {
  const dest = slot(i)
  const a = (i + N / 2) % N
  const from = slot(a) // fly from the opposite side of the ring
  return {
    i,
    start: { x: from.x * 2.7, y: from.y * 2.7 },
    dest,
    spin: 150 + ((i * 47) % 60), // each diamond tumbles in at its own angle
  }
})

export default function V4Shards({ speed = 1, reduced = false }) {
  const s = (sec) => sec * speed

  const letters = useMemo(() => WORD.split(''), [])

  return (
    <div className="mfv4" style={{ ['--spd']: speed }}>
      <style>{`
        .mfv4 {
          position: absolute; inset: 0;
          display: grid; place-items: center;
          overflow: hidden;
          background:
            radial-gradient(ellipse 760px 520px at 50% 40%, oklch(0.62 0.17 55 / 0.11), transparent 62%),
            radial-gradient(ellipse 1000px 560px at 50% -18%, oklch(0.55 0.16 318 / 0.08), transparent 55%),
            var(--bg);
        }

        /* Breathing ambient light behind the assembly */
        .mfv4-aura { position: absolute; inset: 0; pointer-events: none; }
        .mfv4-aura i {
          position: absolute; border-radius: 50%;
          filter: blur(64px); will-change: transform, opacity;
        }
        .mfv4-aura i:nth-child(1) {
          width: 420px; height: 420px; left: 50%; top: 38%;
          margin: -210px 0 0 -210px;
          background: radial-gradient(circle, oklch(0.62 0.17 55 / 0.28), transparent 68%);
          animation: mfv4-breathe calc(3.2s * var(--spd, 1)) ease-in-out calc(0.9s * var(--spd, 1)) infinite;
        }
        .mfv4-aura i:nth-child(2) {
          width: 320px; height: 320px; left: 50%; top: 62%;
          margin: -160px 0 0 -160px;
          background: radial-gradient(circle, oklch(0.55 0.15 318 / 0.16), transparent 66%);
          animation: mfv4-breathe calc(4.6s * var(--spd, 1)) ease-in-out calc(1.2s * var(--spd, 1)) infinite reverse;
        }
        @keyframes mfv4-breathe {
          0%, 100% { opacity: 0.55; transform: scale(0.94); }
          50%      { opacity: 1;    transform: scale(1.06); }
        }

        .mfv4-stage {
          position: relative;
          width: min(440px, 92vw);
          aspect-ratio: 1 / 1;
          display: grid; place-items: center;
        }

        /* Expanding lock rings — fire as the last shard clicks home */
        .mfv4-lock {
          position: absolute; left: 50%; top: 50%;
          width: ${R * 2}px; height: ${R * 2}px;
          margin: -${R}px 0 0 -${R}px;
          border-radius: 50%;
          border: 1px solid oklch(0.74 0.16 58 / 0.55);
          box-shadow: 0 0 26px oklch(0.68 0.16 55 / 0.25), inset 0 0 18px oklch(0.68 0.16 55 / 0.15);
          opacity: 0; pointer-events: none;
          animation: mfv4-lock calc(0.9s * var(--spd, 1)) cubic-bezier(0.16, 1, 0.3, 1) calc(1.25s * var(--spd, 1)) forwards;
        }
        .mfv4-lock--b {
          border-color: oklch(0.66 0.13 318 / 0.4);
          animation-delay: calc(1.38s * var(--spd, 1));
        }
        @keyframes mfv4-lock {
          0%   { opacity: 0; transform: scale(0.55); }
          35%  { opacity: 0.9; }
          100% { opacity: 0; transform: scale(1.28); }
        }

        .mfv4-shard {
          position: absolute; left: 50%; top: 50%;
          width: ${SHARD}px; height: ${SHARD}px;
          margin: -${SHARD / 2}px 0 0 -${SHARD / 2}px;
          border-radius: 6px;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 38%),
            linear-gradient(135deg, oklch(0.9 0.12 70), oklch(0.62 0.16 48));
          box-shadow:
            0 0 0 1px oklch(1 0 0 / 0.14) inset,
            0 0 22px oklch(0.68 0.16 55 / 0.5);
          will-change: transform, opacity;
        }
        .mfv4-stage .mfv4-shard:nth-child(even) {
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 38%),
            linear-gradient(135deg, oklch(0.9 0.12 70), oklch(0.55 0.15 318));
          box-shadow:
            0 0 0 1px oklch(1 0 0 / 0.12) inset,
            0 0 22px oklch(0.6 0.14 318 / 0.4);
        }

        .mfv4-word {
          position: absolute; inset: 0;
          display: grid; place-items: center;
          font-family: var(--heading);
          font-weight: 800; letter-spacing: -0.05em;
          font-size: clamp(34px, 9.5vw, 50px);
          color: var(--text-h);
          text-shadow: 0 2px 30px oklch(0.6 0.17 55 / 0.35);
          z-index: 2;
        }
        .mfv4-word > span { display: flex; gap: 0.015em; align-items: center; }
        .mfv4-word i {
          display: inline-block;
          overflow: hidden;
          font-style: normal;
          padding: 0.12em 0.02em 0.18em; /* mask room: no glyph shaving */
        }
        .mfv4-word b { display: inline-block; font-weight: 800; will-change: transform, filter; }

        /* Amber rule drawn beneath the word */
        .mfv4-rule {
          position: absolute; left: 50%; bottom: calc(50% - 1.55em);
          width: 64px; height: 2px; border-radius: 2px;
          transform: translateX(-50%) scaleX(0); transform-origin: center;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          box-shadow: 0 0 12px var(--accent-glow);
          opacity: 0;
          animation: mfv4-rule calc(0.5s * var(--spd, 1)) cubic-bezier(0.16, 1, 0.3, 1) calc(1.02s * var(--spd, 1)) forwards;
        }
        @keyframes mfv4-rule {
          0%   { opacity: 0; transform: translateX(-50%) scaleX(0); }
          60%  { opacity: 1; }
          100% { opacity: 0.85; transform: translateX(-50%) scaleX(1); }
        }

        .mfv4-meta {
          position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 9px;
          width: min(280px, 72vw);
        }
        .mfv4-hair {
          width: 100%; height: 2px; border-radius: 2px; overflow: hidden;
          background: var(--ui-border);
        }
        .mfv4-fill {
          display: block; height: 100%; width: 0;
          background: linear-gradient(90deg, var(--accent-dim), var(--accent));
          animation: mfv4-fill calc(1.5s * var(--spd, 1)) cubic-bezier(0.6, 0, 0.3, 1) calc(0.45s * var(--spd, 1)) forwards;
        }
        @keyframes mfv4-fill { to { width: 100%; } }
        .mfv4-tag {
          font-size: 10px; font-weight: 700; letter-spacing: 0.32em; text-transform: uppercase;
          color: var(--text-muted);
        }

        @media (prefers-reduced-motion: reduce) {
          .mfv4-aura i { animation: none; opacity: 0.5; }
          .mfv4-lock { animation: none; opacity: 0; }
          .mfv4-rule { animation: none; opacity: 0.85; transform: translateX(-50%) scaleX(1); }
          .mfv4-fill { width: 100%; }
        }
      `}</style>

      <div className="mfv4-aura" aria-hidden="true"><i /><i /></div>

      <div className="mfv4-stage" aria-hidden="true">
        <span className="mfv4-lock" />
        <span className="mfv4-lock mfv4-lock--b" />

        {SHARDS.map(({ i, start, dest, spin }) => (
          <motion.span
            key={i}
            className="mfv4-shard"
            initial={reduced ? false : { x: start.x, y: start.y, opacity: 0, scale: 0.3, rotate: start.rot + spin }}
            animate={{ x: dest.x, y: dest.y, opacity: 0.95, scale: 1, rotate: dest.rot }}
            transition={
              reduced
                ? undefined
                : { type: 'spring', stiffness: 58, damping: 11.5, mass: 0.9, delay: s(0.42 + i * 0.09) }
            }
          />
        ))}

        <div className="mfv4-word">
          <span>
            {letters.map((ch, i) => (
              <i key={i}>
                <motion.b
                  initial={reduced ? false : { y: '112%', rotate: 6, filter: 'blur(6px)' }}
                  animate={{ y: 0, rotate: 0, filter: 'blur(0px)' }}
                  transition={
                    reduced
                      ? undefined
                      : { duration: s(0.68), ease: [0.16, 1, 0.3, 1], delay: s(0.55 + i * 0.05) }
                  }
                >{ch}</motion.b>
              </i>
            ))}
          </span>
        </div>

        <span className="mfv4-rule" />
      </div>

      <div className="mfv4-meta" aria-hidden="true">
        <div className="mfv4-hair"><i className="mfv4-fill" /></div>
        <motion.span
          className="mfv4-tag"
          initial={reduced ? false : { opacity: 0, y: 8, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={reduced ? undefined : { duration: s(0.5), ease: [0.16, 1, 0.3, 1], delay: s(1.7) }}
        >shaped for ten</motion.span>
      </div>
    </div>
  )
}
