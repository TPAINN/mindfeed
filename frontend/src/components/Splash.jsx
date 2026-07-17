import { useState, useEffect, useRef } from 'react'

/**
 * MindFeed splash — uses the ACTUAL app logo (favicon.svg), not a random
 * neural graphic. ~2.6s premium intro: aura glow, logo tile spring-pops with a
 * soft breathing halo, "MindFeed" wordmark reveals, tagline fades up, thin
 * progress line fills, then a calm scale+blur exit. Framer-motion-free (pure
 * CSS) so it can't stall the first paint.
 */
export default function Splash({ onDone }) {
  const [phase, setPhase] = useState('in')
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone }, [onDone])

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase('exit'), 2200),
      setTimeout(() => onDoneRef.current?.(), 2650),
    ]
    return () => ts.forEach(clearTimeout)
  }, [])

  return (
    <div aria-hidden="true" className={`mfs mfs--${phase}`}>
      <style>{`
        .mfs {
          position: fixed; inset: 0; z-index: 9999;
          display: grid; place-items: center;
          background: radial-gradient(120% 120% at 50% 30%, #191225 0%, #0c0913 60%, #08060d 100%);
          overflow: hidden;
          transition: opacity 0.45s ease;
        }
        .mfs--exit { opacity: 0; pointer-events: none; }

        /* brand aura */
        .mfs::before, .mfs::after {
          content: ''; position: absolute; border-radius: 50%;
          filter: blur(90px); pointer-events: none;
        }
        .mfs::before {
          width: 62vmax; height: 62vmax; left: -18vmax; top: -22vmax;
          background: radial-gradient(circle, rgba(134,59,255,0.30), transparent 62%);
          animation: mfs-drift 11s ease-in-out infinite alternate;
        }
        .mfs::after {
          width: 52vmax; height: 52vmax; right: -14vmax; bottom: -18vmax;
          background: radial-gradient(circle, rgba(71,191,255,0.22), transparent 62%);
          animation: mfs-drift 14s ease-in-out infinite alternate-reverse;
        }
        @keyframes mfs-drift { to { transform: translate(6vmax, 4vmax) scale(1.14); } }

        .mfs-inner {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center;
        }
        .mfs--exit .mfs-inner {
          transform: scale(1.06); filter: blur(6px);
          transition: transform 0.45s cubic-bezier(0.5,0,0.2,1), filter 0.45s ease;
        }

        /* logo tile with a breathing halo — spring pop in */
        .mfs-tile {
          position: relative;
          width: 116px; height: 116px; border-radius: 30px;
          display: grid; place-items: center;
          background: linear-gradient(160deg, #1c1430, #120c1f);
          box-shadow: 0 12px 48px rgba(134,59,255,0.35), inset 0 1px 0 rgba(255,255,255,0.06);
          margin-bottom: 30px;
          animation: mfs-pop 0.9s cubic-bezier(0.2, 1.5, 0.4, 1) both;
        }
        @keyframes mfs-pop {
          0%   { opacity: 0; transform: scale(0.25) rotate(-10deg); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }
        .mfs-tile::before {
          content: ''; position: absolute; inset: -14px; border-radius: 40px; z-index: -1;
          background: radial-gradient(circle, rgba(134,59,255,0.55), transparent 70%);
          opacity: 0; animation: mfs-halo 2.6s ease-in-out 0.5s infinite;
        }
        @keyframes mfs-halo { 0%,100% { opacity: 0.35; transform: scale(0.94); } 50% { opacity: 0.8; transform: scale(1.06); } }
        .mfs-tile img {
          width: 60px; height: 58px; display: block;
          filter: drop-shadow(0 4px 14px rgba(134,59,255,0.5));
        }

        .mfs-word {
          font: 800 46px/1 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
          letter-spacing: -0.03em;
          background: linear-gradient(100deg, #b98cff 0%, #863bff 45%, #47bfff 110%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
          clip-path: inset(0 100% 0 0);
          animation: mfs-wipe 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.45s forwards;
        }
        @keyframes mfs-wipe { to { clip-path: inset(0 0 0 0); } }

        .mfs-sub {
          margin-top: 12px; text-align: center;
          font: 600 12.5px 'Inter', sans-serif; letter-spacing: 0.16em; text-transform: uppercase;
          color: rgba(185,140,255,0.75);
          opacity: 0; transform: translateY(8px);
          animation: mfs-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 1.0s forwards;
        }
        @keyframes mfs-up { to { opacity: 1; transform: translateY(0); } }

        .mfs-line {
          margin-top: 42px; width: 180px; height: 4px; border-radius: 99px; overflow: hidden;
          background: rgba(134,59,255,0.16);
          opacity: 0; animation: mfs-up 0.5s ease 1.25s forwards;
        }
        .mfs-line::after {
          content: ''; position: absolute; inset: 0 auto 0 0; height: 100%; width: 0%;
          border-radius: 99px; background: linear-gradient(90deg, #863bff, #47bfff);
          box-shadow: 0 0 12px rgba(134,59,255,0.6);
          animation: mfs-fill 1.3s cubic-bezier(0.5,0,0.1,1) 1.3s forwards;
        }
        @keyframes mfs-fill { to { width: 100%; } }
      `}</style>
      <div className="mfs-inner">
        <div className="mfs-tile">
          <img src="/favicon.svg" alt="" />
        </div>
        <div className="mfs-word">MindFeed</div>
        <div className="mfs-sub">Γνώση που αξίζει</div>
        <div className="mfs-line" style={{ position: 'relative' }} />
      </div>
    </div>
  )
}
