import { useState, useEffect, useRef, useCallback } from 'react'
import { useT } from '../i18n/useT'

/* ── Splash — "the first card" ──────────────────────────────────────────────
   The intro deals you MindFeed's signature object: a small knowledge card
   springs in from the warm void, the wordmark cascades inside it, an amber
   rule draws itself, and the product promise ("10 cards · 5 minutes") settles
   under it — with a faint giant "10" watermark behind the whole scene.

   Behaviors (hardened):
   - First visit per browser: full ~2.5s choreography; returning visits: a
     ~1.25s compressed flash. Delays AND durations scale via --s, so the brief
     sequence always completes before the fade — no mid-animation cutoff.
     Reduced-motion users get a ~0.5s static reveal, not the full wait.
     Never a wall on every open.
   - Skippable IMMEDIATELY by tapping anywhere or pressing the real Skip
     button (Enter/Space work natively).
   - onDone fires exactly once (guarded), so the auto-timer and a manual skip
     can't race and unmount the app shell twice.
   - Accessibility: decorative layers are aria-hidden; the skip control is a
     real, labeled <button>; the overlay is not a hidden-but-focusable div.
   - The scene is decorative: if a user agent disables CSS animation (reduced
     motion), the card/wordmark/rule/meta fall back to visible statics
     instead of never appearing.                                       */

const FIRST_DURATION   = 2500  // full choreography ends at 2.5s (shine sweep)
const RETURN_DURATION  = 1250  // compressed flash: choreography * --s (0.5)
const REDUCED_DURATION = 500   // reduced motion: brief static reveal, then out
const SEEN_KEY         = 'mf_splash_seen'

function isFirstVisit() {
  try { return localStorage.getItem(SEEN_KEY) !== '1' } catch { return true }
}

function prefersReducedMotion() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
}

export default function Splash({ onDone }) {
  const t = useT()
  const [phase, setPhase] = useState('in')
  const [hintReady, setHintReady] = useState(false)
  const onDoneRef = useRef(onDone)
  const doneRef   = useRef(false)
  const [brief]   = useState(() => !isFirstVisit())
  const [reduced] = useState(() => prefersReducedMotion())

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
    const duration = reduced ? REDUCED_DURATION : brief ? RETURN_DURATION : FIRST_DURATION
    const tc = [
      setTimeout(() => setHintReady(true), 150),
      setTimeout(() => setPhase('exit'), Math.max(duration - 380, 100)),
      setTimeout(() => finish(), duration),
    ]
    return () => tc.forEach(clearTimeout)
  }, [finish, brief, reduced])

  function skip() {
    // Idempotent: phase is just a class; finish() guards the unmount call.
    setPhase('exit')
    setTimeout(finish, 380)
  }


  return (
    <div
      className={`mfs mfs--${phase}${hintReady ? ' mfs--ready' : ''}${brief ? ' mfs--brief' : ''}`}
      onClick={skip}
    >
      <style>{`
        .mfs {
          position: fixed; inset: 0; z-index: 9999;
          display: grid; place-items: center;
          background:
            radial-gradient(ellipse 1100px 550px at 50% -14%, oklch(0.60 0.18 55 / 0.14), transparent 55%),
            radial-gradient(ellipse 480px 380px at 6% 90%, oklch(0.55 0.16 148 / 0.07), transparent 50%),
            radial-gradient(ellipse 420px 320px at 94% 74%, oklch(0.52 0.17 318 / 0.06), transparent 48%),
            var(--bg);
          overflow: hidden;
          --s: 1; /* choreography speed factor — brief visits compress via this */
          transition: opacity 0.38s cubic-bezier(0.4, 0, 0.2, 1), transform 0.38s cubic-bezier(0.4, 0, 0.2, 1);
          animation: mfs-fade-in 0.3s ease both;
        }
        @keyframes mfs-fade-in { from { opacity: 0 } to { opacity: 1 } }
        .mfs--exit {
          opacity: 0;
          transform: scale(1.04) translateY(-8px);
          pointer-events: none;
        }
        .mfs--brief { --s: 0.5; }

        /* ── Ambient orbs ── */
        .mfs-orbs { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .mfs-orb {
          position: absolute; border-radius: 50%;
          filter: blur(50px);
          will-change: transform;
          animation: mfs-orb-drift calc(9s * var(--s)) ease-in-out infinite both;
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

        /* ── Giant "10" watermark ── */
        .mfs-10 {
          position: absolute; z-index: 1;
          font-family: var(--heading);
          font-weight: 900;
          font-size: clamp(280px, 52vw, 520px);
          line-height: 1;
          letter-spacing: -0.08em;
          color: transparent;
          -webkit-text-stroke: 1.5px oklch(0.62 0.17 55 / 0.20);
          opacity: 0;
          animation:
            mfs-ten-in calc(1.1s * var(--s)) cubic-bezier(0.16, 1, 0.3, 1) calc(0.5s * var(--s)) both,
            mfs-ten-float calc(7s * var(--s)) ease-in-out calc(2.2s * var(--s)) infinite;
          pointer-events: none;
          user-select: none;
        }
        @keyframes mfs-ten-in {
          from { opacity: 0; transform: translateY(36px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mfs-ten-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-14px) scale(1.02); }
        }

        /* ── Center content ── */
        .mfs-inner {
          position: relative; z-index: 2;
          display: grid; place-items: center;
          transition: transform 0.38s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.32s ease, filter 0.32s ease;
        }
        .mfs--exit .mfs-inner {
          transform: scale(1.1) translateY(-12px);
          filter: blur(14px);
          opacity: 0;
        }

        /* ── The first card — dealt in from the void ── */
        .mfs-card {
          position: relative;
          width: min(344px, 84vw);
          padding: 30px 34px 28px;
          border-radius: 26px;
          background:
            linear-gradient(165deg, var(--surface-2), var(--surface));
          border: 1px solid var(--border);
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.05),
            0 32px 72px -14px oklch(0.60 0.18 55 / 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          overflow: hidden;
          will-change: transform, opacity;
          animation: mfs-card-in calc(0.72s * var(--s)) cubic-bezier(0.34, 1.56, 0.64, 1) calc(0.06s * var(--s)) both;
        }
        .mfs-card-halo {
          position: absolute; inset: -30%;
          z-index: 0; pointer-events: none;
          background: radial-gradient(circle at 30% 0%, oklch(0.60 0.18 55 / 0.20), transparent 55%);
          animation: mfs-halo calc(3s * var(--s)) ease-in-out calc(1s * var(--s)) infinite;
        }
        @keyframes mfs-card-in {
          0%   { opacity: 0; transform: translate(30vw, -22vh) rotate(12deg) scale(0.7); }
          55%  { opacity: 1; transform: translate(-2vw, 1vh) rotate(-2deg) scale(1.03); }
          75%  { transform: translate(0.4vw, -0.3vh) rotate(0.6deg) scale(0.99); }
          100% { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(1); }
        }
        @keyframes mfs-halo {
          0%, 100% { opacity: 0.35; transform: scale(0.92); }
          50%      { opacity: 0.8; transform: scale(1.1); }
        }

        /* ── Chip (category promise) ── */
        .mfs-chip {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 10px; font-weight: 800;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--accent);
          opacity: 0; transform: translateY(8px);
          animation: mfs-up calc(0.4s * var(--s)) cubic-bezier(0.16, 1, 0.3, 1) calc(0.44s * var(--s)) forwards;
        }
        .mfs-chip::before {
          content: ''; width: 6px; height: 6px; border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 10px var(--accent);
          animation: mfs-chip-dot calc(1.8s * var(--s)) ease-in-out calc(0.9s * var(--s)) infinite;
        }
        @keyframes mfs-chip-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(0.7); }
        }

        /* ── Wordmark — per-letter cascade with bounce ── */
        .mfs-word {
          position: relative; z-index: 1;
          font-family: var(--heading);
          font-size: clamp(34px, 10vw, 42px);
          font-weight: 800; line-height: 1.1;
          letter-spacing: -0.05em;
          font-variation-settings: 'opsz' 42;
          display: flex;
          margin-top: 10px;
          overflow: hidden;
          padding: 4px 2px 2px;
        }
        .mfs-word span {
          display: inline-block;
          opacity: 0;
          transform: translateY(120%) rotate(8deg) scale(0.85);
          animation: mfs-split-in calc(0.58s * var(--s)) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          color: var(--text-h);
        }
        .mfs-word span:nth-child(1) { animation-delay: calc(0.50s * var(--s)); }
        .mfs-word span:nth-child(2) { animation-delay: calc(0.56s * var(--s)); }
        .mfs-word span:nth-child(3) { animation-delay: calc(0.62s * var(--s)); }
        .mfs-word span:nth-child(4) { animation-delay: calc(0.68s * var(--s)); }
        .mfs-word span:nth-child(5) { animation-delay: calc(0.74s * var(--s)); }
        .mfs-word span:nth-child(6) { animation-delay: calc(0.80s * var(--s)); }
        .mfs-word span:nth-child(7) { animation-delay: calc(0.86s * var(--s)); }
        .mfs-word span:nth-child(8) { animation-delay: calc(0.92s * var(--s)); }
        @keyframes mfs-split-in {
          0%   { opacity: 0; transform: translateY(120%) rotate(8deg) scale(0.85); }
          65%  { opacity: 1; transform: translateY(-6%) rotate(-2deg) scale(1.04); }
          82%  { transform: translateY(2%) rotate(0.5deg) scale(0.99); }
          100% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
        }

        /* ── Amber shine sweep after letters land ── */
        .mfs-shine {
          position: relative; display: inline-block;
        }
        .mfs-shine::after {
          content: 'MindFeed';
          position: absolute; inset: 0;
          font-family: var(--heading);
          font-size: clamp(34px, 10vw, 42px);
          font-weight: 800; line-height: 1.1;
          letter-spacing: -0.05em;
          font-variation-settings: 'opsz' 42;
          background: linear-gradient(
            120deg,
            transparent 0%,
            transparent 32%,
            oklch(0.72 0.17 58 / 0.45) 46%,
            oklch(0.92 0.08 80 / 0.9) 50%,
            oklch(0.72 0.17 58 / 0.45) 54%,
            transparent 68%,
            transparent 100%
          );
          background-size: 250% 100%;
          background-position: 180% center;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: mfs-shine-sweep calc(1.15s * var(--s)) cubic-bezier(0.4, 0, 0.2, 1) calc(1.35s * var(--s)) forwards;
          pointer-events: none;
        }
        @keyframes mfs-shine-sweep {
          0%   { background-position: 180% center; }
          100% { background-position: -80% center; }
        }

        /* ── Amber rule ── */
        .mfs-rule {
          position: relative; z-index: 1;
          margin-top: 18px;
          height: 2px; width: 100%;
          border-radius: 2px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          transform-origin: center;
          transform: scaleX(0);
          opacity: 0;
          animation: mfs-rule-draw calc(0.55s * var(--s)) cubic-bezier(0.4, 0, 0.2, 1) calc(1.02s * var(--s)) forwards;
        }
        @keyframes mfs-rule-draw {
          0%   { transform: scaleX(0); opacity: 0; }
          60%  { opacity: 1; }
          100% { transform: scaleX(1); opacity: 1; }
        }

        /* ── Promise meta ── */
        .mfs-meta {
          position: relative; z-index: 1;
          margin-top: 16px;
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          text-align: center;
          opacity: 0; transform: translateY(8px);
          animation: mfs-up calc(0.45s * var(--s)) cubic-bezier(0.16, 1, 0.3, 1) calc(1.24s * var(--s)) forwards;
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
           Decorative intro only — never let the scene stay invisible. */
        @media (prefers-reduced-motion: reduce) {
          .mfs { --s: 1; animation: none; }
          .mfs-orb { animation: none; opacity: 0.5; }
          .mfs-10  { animation: none; opacity: 0.45; }
          .mfs-card, .mfs-card-halo { animation: none; }
          .mfs-chip, .mfs-word span, .mfs-shine::after, .mfs-rule, .mfs-meta {
            animation: none;
          }
          .mfs-card { transform: none; }
          .mfs-chip, .mfs-meta { opacity: 1; transform: none; }
          .mfs-word span { opacity: 1; transform: none; }
          .mfs-rule { transform: scaleX(1); opacity: 1; }
        }
      `}</style>

      <div className="mfs-orbs" aria-hidden="true">
        <span className="mfs-orb" />
        <span className="mfs-orb" />
        <span className="mfs-orb" />
      </div>

      <div className="mfs-10" aria-hidden="true">10</div>

      <div className="mfs-inner" aria-hidden="true">
        <div className="mfs-card">
          <span className="mfs-card-halo" aria-hidden="true" />
          <div className="mfs-chip">{t('splash.chip')}</div>
          <div className="mfs-shine">
            <div className="mfs-word">
              {'MindFeed'.split('').map((ch, i) => <span key={i}>{ch}</span>)}
            </div>
          </div>
          <div className="mfs-rule" />
          <div className="mfs-meta">{t('splash.meta')}</div>
        </div>
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