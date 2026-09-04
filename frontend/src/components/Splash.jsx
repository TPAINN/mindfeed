import { useState, useEffect, useRef, useCallback } from 'react'
import { useT } from '../i18n/useT'
import { getChosenVariantId, getVariant, revealMs } from '../splash/registry'
// Default variant ships with the shell so the most common splash has zero
// async gap; heavy variants (three.js) load on demand via registry.load().
import V1Card from '../splash/variants/v1-card.jsx'

const STATIC_VARIANTS = { 'v1-card': V1Card }

/* ── Splash shell ────────────────────────────────────────────────────────────
   One hardened overlay, five possible reveals (see ../splash/registry.js):
   - The chosen variant (localStorage `mf_splash_variant`, default v1-card)
     plays its full choreography inside this shell.
   - First visit per browser: the full reveal. Returning visits: a compressed
     flash that still completes before the fade (held ~2s — the user asked the
     splash to keep a presence, not blink past). Reduced-motion users: a ~0.5s
     static frame, not the wait.
   - Skippable immediately — tap anywhere or the real, labeled Skip button.
   - onDone fires exactly once (guarded), so the auto-timer and a manual skip
     can't race and unmount the app shell twice.
   - The scene is decorative: aria-hidden; the skip control is the focusable
     element; reduced-motion variants render visible statics.            */

const SEEN_KEY = 'mf_splash_seen'
const EXIT_MS  = 380
const REDUCED_MS = 500
// Returning-visit reveal target: every splash after the first holds ~2s.
// Per-variant speed is derived so the choreography ends exactly here.
const BRIEF_MS = 2000

function isFirstVisit() {
  try { return localStorage.getItem(SEEN_KEY) !== '1' } catch { return true }
}

function prefersReducedMotion() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
}

export default function Splash({ onDone }) {
  const t = useT()
  const [variantId] = useState(() => getChosenVariantId())
  const [phase, setPhase] = useState('in')
  const [hintReady, setHintReady] = useState(false)
  const onDoneRef = useRef(onDone)
  const doneRef   = useRef(false)
  const [brief]   = useState(() => !isFirstVisit())
  const [reduced] = useState(() => prefersReducedMotion())

  useEffect(() => { onDoneRef.current = onDone }, [onDone])

  // Fires the parent's callback exactly once — the auto-timer and a manual
  // skip can race, so this guard keeps the app shell from being unmounted twice.
  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    onDoneRef.current?.()
  }, [])

  // Remember this browser so the next open gets the short splash.
  useEffect(() => {
    try { localStorage.setItem(SEEN_KEY, '1') } catch { /* private mode */ }
  }, [])

  const { duration, speed } = useSplashTiming(variantId, brief, reduced)

  useEffect(() => {
    const tc = [
      setTimeout(() => setHintReady(true), reduced ? 60 : 150),
      setTimeout(() => setPhase('exit'), Math.max(duration - EXIT_MS, reduced ? 80 : 100)),
      setTimeout(() => finish(), duration),
    ]
    return () => tc.forEach(clearTimeout)
  }, [duration, finish, reduced])

  function skip() {
    // Idempotent: phase is just a class; finish() guards the unmount call.
    setPhase('exit')
    setTimeout(finish, EXIT_MS)
  }

  return (
    <div
      className={`mfs mfs--${phase}${hintReady ? ' mfs--ready' : ''}${brief ? ' mfs--brief' : ''}`}
      onClick={skip}
      style={{ '--s': speed }}
    >
      <style>{`
        .mfs {
          position: fixed; inset: 0; z-index: 9999;
          display: grid; place-items: center;
          background: var(--bg);
          overflow: hidden;
          --s: 1;
          transition: opacity ${EXIT_MS}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${EXIT_MS}ms cubic-bezier(0.4, 0, 0.2, 1);
          animation: mfs-fade-in 0.3s ease both;
        }
        @keyframes mfs-fade-in { from { opacity: 0 } to { opacity: 1 } }
        .mfs--exit {
          opacity: 0;
          transform: scale(1.04) translateY(-8px);
          pointer-events: none;
        }
        /* --s is set inline per run: 1 for first visits, a computed value
           (~0.8) on returning visits so the choreography finishes in 2.0s. */

        .mfs-scene {
          position: absolute; inset: 0;
          display: grid; place-items: center;
          transition: transform 0.38s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.32s ease, filter 0.32s ease;
        }
        .mfs--exit .mfs-scene {
          transform: scale(1.1) translateY(-12px);
          filter: blur(14px);
          opacity: 0;
        }

        .mfs-loading {
          color: var(--text-muted);
          font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase;
          display: flex; gap: 5px; align-items: center;
        }
        .mfs-loading i {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--accent);
          animation: mfs-dot 0.9s ease-in-out infinite;
        }
        .mfs-loading i:nth-child(2) { animation-delay: 0.15s; }
        .mfs-loading i:nth-child(3) { animation-delay: 0.3s; }
        @keyframes mfs-dot { 0%, 100% { opacity: 0.25; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }

        .mfs-skip {
          position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
          border: none; background: none; padding: 10px 16px; margin: 0;
          font: inherit; font-size: 10px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--text-muted); cursor: pointer;
          opacity: 0; border-radius: 999px;
          transition: opacity 0.35s ease, color 0.2s ease;
          z-index: 20;
        }
        .mfs-skip:hover { color: var(--accent); }
        .mfs--ready .mfs-skip { opacity: 0.6; }
        .mfs--ready .mfs-skip:focus-visible {
          opacity: 1; outline: 2px solid var(--accent); outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          .mfs { animation: none; }
        }
      `}</style>

      <VariantHost variantId={variantId} speed={speed} reduced={reduced} />

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

// Lazy-resolves the chosen variant. Static entries (default) resolve on the
// same tick; heavy ones (three.js) resolve async — a tiny dot loader covers
// the gap so the intro never shows a hard blank.
function VariantHost({ variantId, speed, reduced }) {
  const variant = getVariant(variantId)
  const [Comp, setComp] = useState(() => STATIC_VARIANTS[variantId] || null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (STATIC_VARIANTS[variantId]) return
    let alive = true
    variant.load().then(m => {
      if (alive) setComp(() => m.default)
    }).catch(() => { if (alive) setFailed(true) })
    return () => { alive = false }
  }, [variantId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (failed) return <BrandFallback />
  if (!Comp) return <LoadingFallback />

  return (
    <div className="mfs-scene" aria-hidden="true">
      <Comp speed={speed} reduced={reduced} />
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="mfs-scene" aria-hidden="true">
      <span className="mfs-loading"><i /><i /><i />MindFeed</span>
    </div>
  )
}

function BrandFallback() {
  return (
    <div className="mfs-scene" aria-hidden="true">
      <span style={{ fontFamily: 'var(--heading)', fontSize: 'clamp(34px,10vw,46px)', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--text-h)' }}>MindFeed</span>
    </div>
  )
}

// One-shot timing snapshot per mount: the duration that drives the exit/
// finish timers, plus the speed the variant scene must run at so its
// choreography ends exactly when the reveal is due.
function useSplashTiming(variantId, brief, reduced) {
  const [t] = useState(() => {
    if (reduced) return { duration: REDUCED_MS, speed: 1 }
    const full = revealMs(variantId, false) // full reveal of this variant at speed 1
    if (!brief) return { duration: full, speed: 1 }
    const duration = Math.min(BRIEF_MS, full)
    return { duration, speed: duration / full }
  })
  return t
}
