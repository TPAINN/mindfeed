import { useState, useEffect, useRef } from 'react'

/**
 * MindFeed splash — Midnight Observatory. Same canvas as the app (midnight
 * blue, amber accent, Fraunces wordmark) so the intro flows seamlessly into
 * the feed. The real logo mark spring-pops in a glass tile with a soft
 * lavender halo (the mark's own inner light), the wordmark wipes in, the
 * amber line fills, then a calm scale+blur exit. Pure CSS — never stalls
 * first paint, and runs regardless of any system animation setting.
 */
export default function Splash({ onDone }) {
  const [phase, setPhase] = useState('in')
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone }, [onDone])

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase('exit'), 2150),
      setTimeout(() => onDoneRef.current?.(), 2600),
    ]
    return () => ts.forEach(clearTimeout)
  }, [])

  return (
    <div aria-hidden="true" className={`mfs mfs--${phase}`}>
      <style>{`
        .mfs {
          position: fixed; inset: 0; z-index: 9999;
          display: grid; place-items: center;
          background:
            radial-gradient(ellipse 1100px 560px at 50% -6%, oklch(0.80 0.165 66 / 0.10), transparent 58%),
            radial-gradient(ellipse 700px 450px at 4% 98%, oklch(0.72 0.18 318 / 0.06), transparent 54%),
            var(--bg, #0b0e17);
          overflow: hidden;
          transition: opacity 0.45s ease;
        }
        .mfs--exit { opacity: 0; pointer-events: none; }

        /* star field — three drifting pin-pricks of the observatory sky */
        .mfs-star {
          position: absolute; width: 3px; height: 3px; border-radius: 50%;
          background: oklch(0.9 0.02 252 / 0.5);
          box-shadow: 0 0 8px 1px oklch(0.9 0.02 252 / 0.35);
          animation: mfs-twinkle 3.2s ease-in-out infinite;
        }
        .mfs-star:nth-child(1) { top: 18%; left: 22%; animation-delay: 0.2s; }
        .mfs-star:nth-child(2) { top: 30%; right: 18%; width: 2px; height: 2px; animation-delay: 1.1s; }
        .mfs-star:nth-child(3) { bottom: 24%; left: 30%; width: 2px; height: 2px; animation-delay: 1.9s; }
        @keyframes mfs-twinkle {
          0%, 100% { opacity: 0.25; transform: scale(0.8); }
          50%      { opacity: 1;    transform: scale(1.15); }
        }

        .mfs-inner {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center;
        }
        .mfs--exit .mfs-inner {
          transform: scale(1.05); filter: blur(6px);
          transition: transform 0.45s cubic-bezier(0.5,0,0.2,1), filter 0.45s ease;
        }

        /* logo tile — glass slab on midnight, spring pop, breathing halo */
        .mfs-tile {
          position: relative;
          width: 112px; height: 112px; border-radius: 28px;
          display: grid; place-items: center;
          background: linear-gradient(160deg, oklch(0.17 0.018 252), oklch(0.11 0.018 252));
          border: 1px solid rgba(255,255,255,0.09);
          box-shadow:
            0 4px 8px rgba(0,0,0,0.45),
            0 28px 72px -12px rgba(0,0,0,0.75),
            inset 0 1px 0 rgba(255,255,255,0.08);
          margin-bottom: 30px;
          animation: mfs-pop 0.85s cubic-bezier(0.2, 1.4, 0.4, 1) both;
        }
        @keyframes mfs-pop {
          0%   { opacity: 0; transform: scale(0.3) rotate(-8deg); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }
        .mfs-tile::before {
          content: ''; position: absolute; inset: -16px; border-radius: 40px; z-index: -1;
          background: radial-gradient(circle, oklch(0.80 0.165 66 / 0.30), transparent 70%);
          opacity: 0; animation: mfs-halo 2.6s ease-in-out 0.45s infinite;
        }
        @keyframes mfs-halo {
          0%, 100% { opacity: 0.3; transform: scale(0.94); }
          50%      { opacity: 0.7; transform: scale(1.05); }
        }
        .mfs-tile img {
          width: 64px; height: 64px; display: block;
          filter: drop-shadow(0 4px 16px rgba(240, 161, 60, 0.45));
        }

        /* wordmark — Fraunces, solid, wipe reveal */
        .mfs-word {
          font-family: var(--heading, Georgia, serif);
          font-size: 44px; font-weight: 800; line-height: 1;
          letter-spacing: -0.045em;
          font-variation-settings: 'opsz' 40;
          color: var(--text-h, #f4f5f8);
          clip-path: inset(0 100% 0 0);
          animation: mfs-wipe 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.42s forwards;
        }
        @keyframes mfs-wipe { to { clip-path: inset(0 0 0 0); } }

        .mfs-sub {
          margin-top: 13px; text-align: center;
          font-family: var(--sans, system-ui, sans-serif);
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.17em; text-transform: uppercase;
          color: oklch(0.80 0.165 66 / 0.85);
          opacity: 0; transform: translateY(8px);
          animation: mfs-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.95s forwards;
        }
        @keyframes mfs-up { to { opacity: 1; transform: translateY(0); } }

        /* amber fill line */
        .mfs-line {
          position: relative;
          margin-top: 40px; width: 168px; height: 3px;
          border-radius: 99px; overflow: hidden;
          background: oklch(0.80 0.165 66 / 0.14);
          opacity: 0; animation: mfs-up 0.5s ease 1.15s forwards;
        }
        .mfs-line::after {
          content: ''; position: absolute; inset: 0 auto 0 0; height: 100%; width: 0%;
          border-radius: 99px;
          background: linear-gradient(90deg, oklch(0.70 0.14 56), oklch(0.80 0.165 66));
          box-shadow: 0 0 12px oklch(0.80 0.165 66 / 0.55);
          animation: mfs-fill 1.15s cubic-bezier(0.5, 0, 0.1, 1) 1.2s forwards;
        }
        @keyframes mfs-fill { to { width: 100%; } }
      `}</style>
      <span className="mfs-star" />
      <span className="mfs-star" />
      <span className="mfs-star" />
      <div className="mfs-inner">
        <div className="mfs-tile">
          <img src="/mark.svg" alt="" />
        </div>
        <div className="mfs-word">MindFeed</div>
        <div className="mfs-sub">Γνώση που αξίζει</div>
        <div className="mfs-line" />
      </div>
    </div>
  )
}
