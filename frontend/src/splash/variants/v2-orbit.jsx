import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'

/* ── Variant 2 — "Orbit" (GSAP) ─────────────────────────────────────────────
   A deep-space halo. Letters assemble in the middle while a progress ring
   draws around them and a bright satellite keeps orbiting the finished ring.
   The percentage is a real tween, so the "preloader" reads as data even
   though nothing is loading. Reduced motion shows the assembled static. */

const WORD = 'MindFeed'
const R = 128
const CIRC = 2 * Math.PI * R

export default function V2Orbit({ speed = 1, reduced = false }) {
  const rootRef = useRef(null)
  const ringRef = useRef(null)
  const pctRef = useRef(null)
  const pctTextRef = useRef(null)
  const letterRefs = useRef([])

  const stars = useMemo(() =>
    Array.from({ length: 42 }, (_, i) => ({
      id: i,
      left: (i * 37.7) % 100,
      top: (i * 53.3) % 100,
      size: (i % 3) === 0 ? 2 : 1.4,
      delay: (i % 7) * 0.6,
    })), [])

  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      // `speed` compresses the whole timeline (brief visits play 2× faster).
      const tl = gsap.timeline({ timeScale: 1 / speed })
      // Hidden starts (skipped under reduced motion → static defaults visible)
      gsap.set(letterRefs.current, { opacity: 0, y: 34, scale: 0.7, filter: 'blur(10px)' })
      gsap.set(ringRef.current, { strokeDashoffset: CIRC })
      gsap.set(pctTextRef.current, { opacity: 0 })
      gsap.set(rootRef.current.querySelectorAll('.mfv2-tag'), { opacity: 0, y: 8 })

      const pct = { v: 0 }
      tl.to(pct, {
        v: 100, duration: 2.3, ease: 'power2.out',
        onUpdate: () => {
          if (pctTextRef.current) pctTextRef.current.textContent = String(Math.round(pct.v)).padStart(3, '0')
        },
      }, 0)

      tl.to(ringRef.current, {
        strokeDashoffset: 0, duration: 2.3, ease: 'power2.inOut',
      }, 0)

      tl.to(letterRefs.current, {
        opacity: 1, y: 0, scale: 1,
        filter: 'blur(0px)',
        duration: 0.55, ease: 'power3.out',
        stagger: 0.05,
      }, 0.38)

      tl.to(pctTextRef.current, { opacity: 1, duration: 0.3 }, 0.5)
      tl.to(rootRef.current.querySelectorAll('.mfv2-tag'), {
        opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08,
      }, 1.5)
    }, rootRef)
    return () => ctx.revert()
  }, [reduced, speed])

  useEffect(() => {
    if (reduced || !rootRef.current) return
    // Satellite + ring shimmer keep orbiting after the one-shot timeline ends.
    const sat = gsap.to(rootRef.current.querySelector('.mfv2-sat'), {
      rotation: 360, duration: 4.2, ease: 'none', repeat: -1, transformOrigin: 'center center',
    })
    return () => { sat.kill() }
  }, [reduced])

  return (
    <div className="mfv2" ref={rootRef} style={{ ['--spd']: speed }}>
      <style>{`
        .mfv2 {
          position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden;
          background:
            radial-gradient(ellipse 900px 520px at 50% -12%, oklch(0.42 0.14 265 / 0.55), transparent 60%),
            radial-gradient(ellipse 700px 500px at 50% 115%, oklch(0.52 0.16 210 / 0.30), transparent 62%),
            linear-gradient(180deg, oklch(0.10 0.035 262), oklch(0.07 0.025 250) 55%, oklch(0.05 0.02 240));
        }
        .mfv2-star {
          position: absolute; border-radius: 50%;
          background: oklch(0.88 0.03 250);
          opacity: 0.35;
          animation: mfv2-twinkle calc(2.8s * var(--spd, 1)) ease-in-out infinite;
        }
        @keyframes mfv2-twinkle { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.7; } }

        .mfv2-stage { position: relative; display: grid; place-items: center; }

        .mfv2-ringwrap { position: relative; width: 300px; height: 300px; display: grid; place-items: center; }
        .mfv2-ring {
          position: absolute; inset: 0;
          filter: drop-shadow(0 0 14px oklch(0.72 0.15 55 / 0.55));
        }
        .mfv2-ring circle { fill: none; }
        .mfv2-ring .track { stroke: oklch(0.95 0.02 90 / 0.10); }
        .mfv2-ring .prog {
          stroke: url(#mfv2-grad);
          stroke-linecap: round;
          transform: rotate(-90deg); transform-origin: 50% 50%;
        }

        .mfv2-sat {
          position: absolute; inset: 0;
          width: 300px; height: 300px;
          will-change: transform;
        }
        .mfv2-sat i {
          position: absolute; top: 16px; left: 50%; margin-left: -6px;
          width: 12px; height: 12px; border-radius: 50%;
          background: oklch(0.84 0.16 62);
          box-shadow: 0 0 18px 4px oklch(0.72 0.17 58 / 0.7);
        }

        .mfv2-word {
          position: absolute;
          display: flex; gap: 0.02em;
          font-family: var(--heading);
          font-weight: 800; letter-spacing: -0.05em;
          font-size: clamp(30px, 8.5vw, 44px);
          color: oklch(0.97 0.01 90);
          filter: drop-shadow(0 4px 24px oklch(0.4 0.12 265 / 0.5));
        }
        .mfv2-word span { display: inline-block; will-change: transform, opacity, filter; }

        .mfv2-pct {
          position: absolute; top: 50%; left: 50%;
          transform: translate(118px, -50%) rotate(0);
          font-family: var(--mono);
          font-size: 12px; letter-spacing: 0.14em;
          color: oklch(0.85 0.13 55);
          opacity: 0.9;
        }

        .mfv2-meta {
          position: absolute; top: calc(50% + 168px); left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          width: 300px;
        }
        .mfv2-tag {
          font-size: 10px; font-weight: 700; letter-spacing: 0.32em; text-transform: uppercase;
          color: oklch(0.72 0.05 250);
          text-align: center;
        }
        .mfv2-bar {
          width: 100%; height: 2px; border-radius: 2px;
          background: oklch(0.9 0.02 90 / 0.12); overflow: hidden;
        }
        .mfv2-bar i {
          display: block; height: 100%; width: 0;
          background: linear-gradient(90deg, oklch(0.72 0.15 55), oklch(0.62 0.14 40));
          box-shadow: 0 0 10px oklch(0.72 0.15 55 / 0.7);
          animation: mfv2-fill calc(2.3s * var(--spd, 1)) cubic-bezier(0.6, 0, 0.3, 1) forwards;
        }
        @keyframes mfv2-fill { to { width: 100%; } }

        @media (prefers-reduced-motion: reduce) {
          .mfv2-star { animation: none; opacity: 0.4; }
          .mfv2-bar i { animation: none; width: 100%; }
        }
      `}</style>

      {/* starfield */}
      {stars.map(s => (
        <span key={s.id} className="mfv2-star"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }} />
      ))}

      <div className="mfv2-stage">
        <div className="mfv2-ringwrap">
          <svg className="mfv2-ring" width="300" height="300" viewBox="0 0 300 300" aria-hidden="true">
            <defs>
              <linearGradient id="mfv2-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.84 0.16 62)" />
                <stop offset="100%" stopColor="oklch(0.62 0.14 40)" />
              </linearGradient>
            </defs>
            <circle className="track" cx="150" cy="150" r={R} strokeWidth="2" />
            <circle className="prog" cx="150" cy="150" r={R} strokeWidth="3" ref={ringRef}
              strokeDasharray={CIRC} strokeDashoffset={CIRC} />
          </svg>

          <div className="mfv2-sat" aria-hidden="true"><i /></div>

          <div className="mfv2-word" aria-hidden="true">
            {WORD.split('').map((ch, i) => (
              <span key={i} ref={el => { letterRefs.current[i] = el }}>{ch}</span>
            ))}
          </div>

          <span className="mfv2-pct" ref={pctTextRef} aria-hidden="true">000</span>
        </div>

        <div className="mfv2-meta" aria-hidden="true">
          <div className="mfv2-bar"><i ref={pctRef} /></div>
          <span className="mfv2-tag">ten cards · sourced · calm</span>
        </div>
      </div>
    </div>
  )
}
