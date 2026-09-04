import { useMemo } from 'react'
import { motion } from 'framer-motion'

/* ── Variant 4 — "Shards" (Motion) ──────────────────────────────────────────
   Six gradient diamonds fly in from every direction and lock into a ring
   around the mark while a preloader spinner fades away and the letters rise
   through a mask. Framer springs give the lock a soft overshoot — pure
   "animations that just happen". Reduced motion renders the locked star. */

const WORD = 'MindFeed'
const R = 148

function slot(i) {
  const a = (i / 6) * Math.PI * 2 - Math.PI / 2
  return { x: Math.cos(a) * R, y: Math.sin(a) * R, ang: (i / 6) * 360 - 90 }
}

export default function V4Shards({ speed = 1, reduced = false }) {
  const s = (sec) => sec * speed // speed 0.5 = brief → half the duration

  const shards = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const dir = slot((i + 3) % 6) // fly in from the opposite side
    const dest = slot(i)
    return {
      i,
      start: { x: dir.x * 2.6, y: dir.y * 2.6 },
      dest,
    }
  }), [])

  return (
    <div className="mfv4" style={{ ['--spd']: speed }}>
      <style>{`
        .mfv4 {
          position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden;
          background:
            radial-gradient(ellipse 720px 480px at 50% 42%, oklch(0.62 0.17 55 / 0.12), transparent 62%),
            radial-gradient(ellipse 1000px 500px at 50% -16%, oklch(0.55 0.16 318 / 0.07), transparent 55%),
            var(--bg);
        }
        .mfv4-stage { position: relative; width: 420px; height: 420px; display: grid; place-items: center; }

        .mfv4-shard {
          position: absolute; left: 50%; top: 50%;
          width: 22px; height: 22px;
          margin: -11px 0 0 -11px;
          border-radius: 6px;
          background: linear-gradient(135deg, oklch(0.86 0.16 65), oklch(0.6 0.16 45));
          box-shadow: 0 0 18px oklch(0.68 0.16 55 / 0.45);
          will-change: transform, opacity;
        }
        .mfv4-stage { /* alternate inner accent */
          --sc: oklch(0.52 0.15 318 / 0.85);
        }
        .mfv4-stage .mfv4-shard:nth-child(even) {
          background: linear-gradient(135deg, oklch(0.86 0.16 65), var(--sc));
        }

        .mfv4-spin {
          position: absolute; inset: 0;
          border-radius: 50%;
          background: conic-gradient(from 0deg, transparent 0 300deg, oklch(0.8 0.16 62) 300deg 360deg);
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px));
          mask: radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px));
          animation: mfv4-spin calc(0.9s * var(--spd, 1)) linear infinite, mfv4-spin-out calc(1.7s * var(--spd, 1)) ease forwards calc(1.2s * var(--spd, 1));
          opacity: 0;
        }
        @keyframes mfv4-spin { to { transform: rotate(360deg); } }
        @keyframes mfv4-spin-out { 0% { opacity: 0; } 15% { opacity: 1; } 100% { opacity: 0; } }

        .mfv4-word {
          position: absolute; inset: 0;
          display: grid; place-items: center;
          font-family: var(--heading);
          font-weight: 800; letter-spacing: -0.05em;
          font-size: clamp(26px, 7vw, 36px);
          color: var(--text-h);
        }
        .mfv4-word > span { display: flex; gap: 0.01em; }
        .mfv4-word i {
          display: inline-block;
          overflow: hidden;
          font-style: normal;
        }
        .mfv4-word b { display: inline-block; font-weight: 800; will-change: transform; }

        .mfv4-meta {
          position: absolute; bottom: 34px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          width: min(260px, 66vw);
        }
        .mfv4-hair {
          width: 100%; height: 2px; border-radius: 2px; overflow: hidden;
          background: var(--ui-border);
        }
        .mfv4-fill {
          display: block; height: 100%; width: 0;
          background: linear-gradient(90deg, var(--accent-dim), var(--accent));
          animation: mfv4-fill calc(2s * var(--spd, 1)) cubic-bezier(0.6, 0, 0.3, 1) calc(0.5s * var(--spd, 1)) forwards;
        }
        @keyframes mfv4-fill { to { width: 100%; } }
        .mfv4-tag {
          font-size: 10px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--text-muted);
        }

        @media (prefers-reduced-motion: reduce) {
          .mfv4-spin { animation: none; opacity: 0; }
          .mfv4-fill { width: 100%; }
        }
      `}</style>

      <div className="mfv4-stage" aria-hidden="true">
        <span className="mfv4-spin" />

        {shards.map(({ i, start, dest }) => (
          <motion.span
            key={i}
            className="mfv4-shard"
            initial={reduced ? false : { x: start.x, y: start.y, opacity: 0, scale: 0.4, rotate: 120 }}
            animate={
              reduced
                ? { x: dest.x, y: dest.y, opacity: 0.95, scale: 1, rotate: dest.ang + 45 }
                : { x: dest.x, y: dest.y, opacity: 0.95, scale: 1, rotate: dest.ang + 45 }
            }
            transition={reduced ? undefined : { type: 'spring', stiffness: 66, damping: 13, delay: s(0.5 + i * 0.07) }}
          />
        ))}

        <div className="mfv4-word">
          <span>
            {WORD.split('').map((ch, i) => (
              <i key={i}>
                <motion.b
                  initial={reduced ? false : { y: '115%' }}
                  animate={{ y: 0 }}
                  transition={reduced ? undefined : { duration: s(0.6), ease: [0.16, 1, 0.3, 1], delay: s(0.62 + i * 0.05) }}
                >{ch}</motion.b>
              </i>
            ))}
          </span>
        </div>
      </div>

      <div className="mfv4-meta" aria-hidden="true">
        <div className="mfv4-hair"><i className="mfv4-fill" /></div>
        <motion.span
          className="mfv4-tag"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? undefined : { duration: s(0.5), ease: [0.16, 1, 0.3, 1], delay: s(1.6) }}
        >shaped for ten</motion.span>
      </div>
    </div>
  )
}
