import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

/* ── Variant 3 — "Bloom" (Anime.js · CSS) ───────────────────────────────────
   A warm amber light breathes behind the wordmark while every letter rises
   out of soft blur, a big mono counter counts to 100 and a hairline grows
   beneath — the brand as a calm, living preloader. Reduced motion renders
   the static, fully-lit frame. */

export default function V3Bloom({ speed = 1, reduced = false }) {
  const rootRef = useRef(null)
  const letterRefs = useRef([])
  const pctTextRef = useRef(null)

  useEffect(() => {
    if (reduced) return
    // speed is a compression factor (0.5 = brief, plays in half the time)
    const t = (ms) => ms * speed
    // Hidden starts (skipped for reduced motion → statics stay visible)
    animate(letterRefs.current, { opacity: 0, translateY: 26, filter: 'blur(10px)', duration: 1 })
    if (pctTextRef.current) pctTextRef.current.textContent = '000'

    const counter = { v: 0 }
    const pct = animate(counter, {
      v: 100, duration: t(2300), ease: 'outExpo',
      update: () => {
        if (pctTextRef.current) {
          pctTextRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0')
        }
      },
    })

    const letters = animate(letterRefs.current, {
      opacity: 1, translateY: 0, filter: 'blur(0px)',
      duration: t(700), ease: 'outExpo',
      delay: stagger(t(70), { start: t(350) }),
    })

    const bars = animate(rootRef.current.querySelectorAll('.mfv3-fill'), {
      width: '100%',
      duration: t(2400), ease: 'inOutSine', delay: t(200),
    })

    const tags = animate(rootRef.current.querySelectorAll('.mfv3-tag'), {
      opacity: 1, translateY: 0,
      duration: t(600), ease: 'outExpo',
      delay: t(1600),
    })

    return () => { pct.pause(); letters.pause(); bars.pause(); tags.pause() }
  }, [speed, reduced])

  return (
    <div className="mfv3" ref={rootRef} style={{ ['--spd']: speed }}>
      <style>{`
        .mfv3 {
          position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden;
          background:
            radial-gradient(ellipse 1000px 620px at 50% -10%, oklch(0.60 0.17 55 / 0.22), transparent 58%),
            radial-gradient(ellipse 420px 340px at 8% 96%, oklch(0.55 0.15 150 / 0.10), transparent 55%),
            radial-gradient(ellipse 380px 300px at 94% 78%, oklch(0.5 0.15 318 / 0.10), transparent 52%),
            var(--bg);
        }

        .mfv3-bloom {
          position: absolute; left: 50%; top: 50%;
          width: min(80vw, 640px); aspect-ratio: 1;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(circle, oklch(0.74 0.17 62 / 0.30), oklch(0.62 0.16 50 / 0.10) 46%, transparent 70%);
          filter: blur(6px);
          animation: mfv3-breathe calc(3.4s * var(--spd, 1)) ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes mfv3-breathe {
          0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(0.96); }
          50%      { opacity: 1; transform: translate(-50%, -50%) scale(1.06); }
        }

        .mfv3-stage { position: relative; display: grid; place-items: center; }

        .mfv3-word {
          display: flex; gap: 0.01em;
          font-family: var(--heading);
          font-weight: 800; letter-spacing: -0.05em;
          font-size: clamp(40px, 11vw, 60px);
          color: var(--text-h);
          will-change: transform, opacity, filter;
        }
        .mfv3-word span { display: inline-block; }

        .mfv3-pct {
          position: absolute; top: calc(50% - 12px); left: calc(50% + 2px);
          transform: translate(100%, -50%);
          font-family: var(--mono);
          font-size: clamp(11px, 2.6vw, 13px);
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.18em;
          color: oklch(0.72 0.16 55);
        }

        .mfv3-meta {
          position: absolute; top: calc(50% + 120px); left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          width: min(300px, 70vw);
        }
        .mfv3-hair {
          width: 100%; height: 2px; border-radius: 2px;
          background: var(--ui-border); overflow: hidden;
        }
        .mfv3-fill {
          display: block; height: 100%; width: 0%;
          background: linear-gradient(90deg, oklch(0.8 0.17 62), oklch(0.62 0.16 45));
          box-shadow: 0 0 12px oklch(0.72 0.16 55 / 0.8);
        }
        .mfv3-tag {
          font-size: 10px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--text-muted); text-align: center;
          opacity: 0; transform: translateY(6px);
        }

        @media (prefers-reduced-motion: reduce) {
          .mfv3-bloom { animation: none; opacity: 0.85; }
          .mfv3-fill { width: 100%; }
          .mfv3-tag { opacity: 1; transform: none; }
        }
      `}</style>

      <div className="mfv3-bloom" aria-hidden="true" />

      <div className="mfv3-stage" aria-hidden="true">
        <div className="mfv3-word">
          {'MindFeed'.split('').map((ch, i) => (
            <span key={i} ref={el => { letterRefs.current[i] = el }}>{ch}</span>
          ))}
        </div>
        <span className="mfv3-pct" ref={pctTextRef}>000</span>

        <div className="mfv3-meta">
          <div className="mfv3-hair"><i className="mfv3-fill" /></div>
          <span className="mfv3-tag">knowledge that breathes</span>
        </div>
      </div>
    </div>
  )
}
