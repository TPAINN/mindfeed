import { useState, useEffect, useRef, useCallback } from 'react'
import { useT } from '../i18n/useT'

/* ── Splash ─────────────────────────────────────────────────────────────────
   Branded intro, not a loading gate:
   - First visit in this browser gets the full choreography (~2.2s).
   - Returning visits get a short 850ms flash — never a 2.4s wall on every
     open (that was the bug: every reload/return was force-delayed).
   - Skippable IMMEDIATELY by tapping anywhere or pressing the real Skip
     button (Enter/Space work natively). No 250ms "wait before you may skip".
   - onDone can only fire once (guarded), so the auto-timer and a manual skip
     can't race and unmount the app shell twice.
   - Accessibility: decorative layers are aria-hidden; the skip control is a
     real, labeled <button>; the overlay is no longer a hidden-but-focusable
     div.
   - The letter cascade is decorative: if a user agent disables CSS animation
     (reduced motion), the wordmark/tile/tagline fall back to visible statics
     instead of never appearing.                                     */

const FIRST_DURATION  = 2200
const RETURN_DURATION = 850
const SEEN_KEY        = 'mf_splash_seen'

function isFirstVisit() {
  try { return localStorage.getItem(SEEN_KEY) !== '1' } catch { return true }
}

export default function Splash({ onDone }) {
  const t = useT()
  const [phase, setPhase] = useState('in')
  const [hintReady, setHintReady] = useState(false)
  const onDoneRef = useRef(onDone)
  const doneRef   = useRef(false)
  const firstVisitRef = useRef(isFirstVisit())

  useEffect(() => { onDoneRef.current = onDone }, [onDone])

  // Fires the parent's callback exactly once — the auto-timer and a manual
  // skip can race, so this guard is what keeps the app shell from being
  // unmounted twice.
  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    onDoneRef.current?.()
  }, [])

  useEffect(() => {
    // Remember this browser so the next open gets the short splash.
    try { localStorage.setItem(SEEN_KEY, '1') } catch { /* private mode */ }
    const duration = firstVisitRef.current ? FIRST_DURATION : RETURN_DURATION
    const tc = [
      setTimeout(() => setHintReady(true), 150),
      setTimeout(() => setPhase('exit'), Math.max(duration - 380, 180)),
      setTimeout(() => finish(), duration),
    ]
    return () => tc.forEach(clearTimeout)
  }, [finish])

  function skip() {
    // Idempotent: phase is just a class; finish() guards the unmount call.
    setPhase('exit')
    setTimeout(finish, 320)
  }

  return (
    <div className={`mfs mfs--${phase}${hintReady ? ' mfs--ready' : ''}`} onClick={skip}>
      <style>{`
        .mfs {
          position: fixed; inset: 0; z-index: 9999;
          display: grid; place-items: center;
          background:
            radial-gradient(ellipse 1100px 550px at 50% -14%, oklch(0.60 0.18 55 / 0.12), transparent 55%),
            radial-gradient(ellipse 480px 380px at 6% 90%, oklch(0.55 0.16 148 / 0.06), transparent 50%),
            radial-gradient(ellipse 420px 320px at 94% 74%, oklch(0.52 0.17 318 / 0.05), transparent 48%),
            var(--bg);
          overflow: hidden;
          transition: opacity 0.38s cubic-bezier(0.4, 0, 0.2, 1), transform 0.38s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .mfs--exit {
          opacity: 0;
          transform: scale(1.04) translateY(-8px);
          pointer-events: none;
        }

        /* ── Ambient orbs ── */
        .mfs-orbs { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .mfs-orb {
          position: absolute; border-radius: 50%;
          filter: blur(50px);
          will-change: transform;
          animation: mfs-orb-drift 9s ease-in-out infinite both;
        }
        .mfs-orb:nth-child(1) {
          width: 400px; height: 400px; top: -18%; left: 16%;
          background: radial-gradient(circle, oklch(0.60 0.18 55 / 0.32), transparent 65%);
        }
        .mfs-orb:nth-child(2) {
          width: 300px; height: 300px; top: 50%; right: -10%;
          background: radial-gradient(circle, oklch(0.52 0.17 318 / 0.20), transparent 65%);
          animation-delay: 3s;
        }
        .mfs-orb:nth-child(3) {
          width: 260px; height: 260px; bottom: -14%; left: 5%;
          background: radial-gradient(circle, oklch(0.55 0.16 148 / 0.16), transparent 65%);
          animation-delay: 5s;
        }
        @keyframes mfs-orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.55; }
          33%      { transform: translate(20px, -12px) scale(1.06); opacity: 0.85; }
          66%      { transform: translate(-10px, 14px) scale(0.95); opacity: 0.45; }
        }

        /* ── Center content ── */
        .mfs-inner {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center;
          transition: transform 0.38s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.32s ease, filter 0.32s ease;
        }
        .mfs--exit .mfs-inner {
          transform: scale(1.1) translateY(-12px);
          filter: blur(14px);
          opacity: 0;
        }

        /* ── App icon — spring pop ── */
        .mfs-tile {
          position: relative;
          width: 96px; height: 96px; border-radius: 24px;
          display: grid; place-items: center;
          background: linear-gradient(155deg, oklch(0.68 0.18 58), oklch(0.52 0.17 44));
          border: 1px solid rgba(255,255,255,0.32);
          box-shadow:
            0 4px 12px rgba(0,0,0,0.06),
            0 24px 56px -10px oklch(0.60 0.18 55 / 0.42),
            inset 0 1px 0 rgba(255,255,255,0.38);
          margin-bottom: 26px;
          animation: mfs-tile-in 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          will-change: transform, opacity;
        }
        .mfs-tile img {
          width: 52px; height: 52px; display: block;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.18));
          animation: mfs-icon-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.22s both;
        }
        .mfs-tile::after {
          content: ''; position: absolute; inset: -18px; border-radius: 42px; z-index: -1;
          background: radial-gradient(circle, oklch(0.60 0.18 55 / 0.28), transparent 65%);
          animation: mfs-halo 3s ease-in-out 0.4s infinite;
        }
        @keyframes mfs-tile-in {
          0%   { opacity: 0; transform: scale(0.15) rotate(-24deg) translateY(40px); }
          55%  { opacity: 1; transform: scale(1.1) rotate(3deg) translateY(-6px); }
          75%  { transform: scale(0.97) rotate(-1deg) translateY(2px); }
          100% { opacity: 1; transform: scale(1) rotate(0deg) translateY(0); }
        }
        @keyframes mfs-icon-in {
          0%   { opacity: 0; transform: scale(0.3) rotate(-10deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes mfs-halo {
          0%, 100% { opacity: 0.3; transform: scale(0.86); }
          50%      { opacity: 0.65; transform: scale(1.14); }
        }

        /* ── Wordmark — SplitText effect (per-letter cascade with bounce) ── */
        .mfs-word {
          font-family: var(--heading);
          font-size: 44px; font-weight: 800; line-height: 1;
          letter-spacing: -0.05em;
          font-variation-settings: 'opsz' 42;
          display: flex; gap: 0;
          overflow: hidden;
          padding: 6px 2px;
        }
        .mfs-word span {
          display: inline-block;
          opacity: 0;
          transform: translateY(120%) rotate(8deg) scale(0.85);
          animation: mfs-split-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          color: var(--text-h);
        }
        .mfs-word span:nth-child(1) { animation-delay: 0.26s; }
        .mfs-word span:nth-child(2) { animation-delay: 0.31s; }
        .mfs-word span:nth-child(3) { animation-delay: 0.36s; }
        .mfs-word span:nth-child(4) { animation-delay: 0.41s; }
        .mfs-word span:nth-child(5) { animation-delay: 0.46s; }
        .mfs-word span:nth-child(6) { animation-delay: 0.51s; }
        .mfs-word span:nth-child(7) { animation-delay: 0.56s; }
        .mfs-word span:nth-child(8) { animation-delay: 0.61s; }
        @keyframes mfs-split-in {
          0%   { opacity: 0; transform: translateY(120%) rotate(8deg) scale(0.85); }
          65%  { opacity: 1; transform: translateY(-6%) rotate(-2deg) scale(1.04); }
          82%  { transform: translateY(2%) rotate(0.5deg) scale(0.99); }
          100% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
        }

        /* ── ShinyText sweep — gradient highlight passes across after letters land ── */
        .mfs-word-shine {
          position: relative;
          display: inline-block;
        }
        .mfs-word-shine::after {
          content: 'MindFeed';
          position: absolute;
          inset: 0;
          font-family: var(--heading);
          font-size: 44px; font-weight: 800; line-height: 1;
          letter-spacing: -0.05em;
          font-variation-settings: 'opsz' 42;
          background: linear-gradient(
            120deg,
            transparent 0%,
            transparent 30%,
            oklch(0.92 0.06 85) 48%,
            oklch(0.98 0.02 90) 50%,
            oklch(0.92 0.06 85) 52%,
            transparent 70%,
            transparent 100%
          );
          background-size: 250% 100%;
          background-position: 180% center;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: mfs-shine-sweep 1.1s cubic-bezier(0.4, 0, 0.2, 1) 0.95s forwards;
          pointer-events: none;
        }
        @keyframes mfs-shine-sweep {
          0%   { background-position: 180% center; }
          100% { background-position: -80% center; }
        }

        /* ── Tagline ── */
        .mfs-sub {
          margin-top: 14px; text-align: center;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--accent);
          opacity: 0; transform: translateY(10px);
          animation: mfs-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.75s forwards;
        }
        @keyframes mfs-up { to { opacity: 1; transform: translateY(0); } }

        /* ── Skip — a real button (Enter/Space work natively) ── */
        .mfs-skip {
          position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
          border: none; background: none; padding: 10px 16px; margin: 0;
          font: inherit; font-size: 10px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--text-muted); cursor: pointer;
          opacity: 0; border-radius: var(--radius-pill);
          transition: opacity 0.35s ease, color 0.2s ease;
        }
        .mfs-skip:hover { color: var(--accent); }
        .mfs--ready .mfs-skip { opacity: 0.6; }
        .mfs--ready .mfs-skip:focus-visible {
          opacity: 1; outline: 2px solid var(--accent); outline-offset: 2px;
        }

        /* ── Graceful fallback when animations are disabled ──
           Decorative intro only — never let the wordmark stay invisible. */
        @media (prefers-reduced-motion: reduce) {
          .mfs-orb { animation: none; opacity: 0.5; }
          .mfs-tile, .mfs-tile img, .mfs-tile::after,
          .mfs-word span, .mfs-word-shine::after, .mfs-sub {
            animation: none;
          }
          .mfs-tile { transform: none; }
          .mfs-word span { opacity: 1; transform: none; }
          .mfs-sub { opacity: 1; transform: none; }
        }
      `}</style>

      <div className="mfs-orbs" aria-hidden="true">
        <span className="mfs-orb" />
        <span className="mfs-orb" />
        <span className="mfs-orb" />
      </div>

      <div className="mfs-inner" aria-hidden="true">
        <div className="mfs-tile">
          <img src="/favicon.svg" alt="" />
        </div>
        <div className="mfs-word-shine">
          <div className="mfs-word">
            {'MindFeed'.split('').map((ch, i) => <span key={i}>{ch}</span>)}
          </div>
        </div>
        <div className="mfs-sub">{t('splash.tagline')}</div>
      </div>

      <button
        type="button"
        className="mfs-skip"
        onClick={(e) => { e.stopPropagation(); skip() }}
        tabIndex={hintReady ? 0 : -1}
      >
        {t('splash.skip')}
      </button>
    </div>
  )
}