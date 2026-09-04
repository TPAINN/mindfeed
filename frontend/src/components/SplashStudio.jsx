import { useEffect, useRef, useState } from 'react'
import { SPLASH_VARIANTS, getVariant, getChosenVariantId, setChosenVariantId } from '../splash/registry'
import './SplashStudio.css'

/* ── Splash Studio (?studio=1) ─────────────────────────────────────────────
   Compare every splash reveal in an endless loop, then pick one. The chosen
   variant is persisted (mf_splash_variant) and becomes the app's real splash
   on the next load. Purely a dev/selection tool — never shipped into the
   user flow.                                                              */

const GAP_MS = 1100 // settle pause between concepts

export default function SplashStudio() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [runId, setRunId] = useState(0)
  const [chosen, setChosen] = useState(() => getChosenVariantId())
  const loadedRef = useRef(new Set())
  const timerRef = useRef(null)

  const variant = SPLASH_VARIANTS[index]
  const totalMs = variant.duration + GAP_MS

  // Preload all variants (first paint of each is instant after the first loop).
  useEffect(() => {
    SPLASH_VARIANTS.forEach(v => {
      if (loadedRef.current.has(v.id)) return
      v.load().then(() => loadedRef.current.add(v.id)).catch(() => {})
    })
  }, [])

  // Auto-advance loop.
  useEffect(() => {
    if (!playing) return
    timerRef.current = setTimeout(() => {
      setIndex(i => (i + 1) % SPLASH_VARIANTS.length)
      setRunId(r => r + 1)
    }, totalMs)
    return () => clearTimeout(timerRef.current)
  }, [playing, index, runId, totalMs])

  const go = (i) => {
    setIndex((i + SPLASH_VARIANTS.length) % SPLASH_VARIANTS.length)
    setRunId(r => r + 1)
  }

  const select = (id) => {
    setChosenVariantId(id)
    setChosen(id)
  }

  const exit = () => {
    // Full reload without ?studio → the app boots and plays the chosen splash.
    const u = new URL(window.location.href)
    u.searchParams.delete('studio')
    window.location.assign(u.pathname + u.search)
  }

  const stageId = `${variant.id}-${runId}`

  return (
    <div className="ss" data-playing={playing}>
      {/* elapsed bar for the current concept */}
      <div className="ss-elapsed" aria-hidden="true">
        <i key={stageId} className={playing ? 'on' : 'paused'} style={{ animationDuration: `${totalMs}ms` }} />
      </div>

      <div className="ss-stage" key={stageId}>
        <VariantStage id={variant.id} />
      </div>

      {/* vignette + wordmark ghost so each scene reads on brand */}
      <div className="ss-top" aria-hidden="true">
        <span className="ss-logo">MindFeed</span>
        <span className="ss-context">splash studio · pick your reveal</span>
      </div>

      <div className="ss-bottom">
        <div className="ss-meta">
          <span className="ss-index mono">{String(index + 1).padStart(2, '0')} / {String(SPLASH_VARIANTS.length).padStart(2, '0')}</span>
          <div className="ss-names">
            <span className="ss-name">{variant.name}</span>
            <span className="ss-tech">{variant.tech}</span>
          </div>
          <span className="ss-note">{variant.note}</span>
        </div>

        <div className="ss-controls">
          <button className="ss-btn ss-btn--icon" onClick={() => go(index - 1)} aria-label="Previous concept" title="Previous">
            <Chevron left />
          </button>
          <button
            className="ss-btn ss-btn--play"
            onClick={() => setPlaying(p => !p)}
            aria-label={playing ? 'Pause loop' : 'Play loop'}
            title={playing ? 'Pause loop' : 'Play loop'}
          >
            {playing ? <PauseGlyph /> : <PlayGlyph />}
          </button>
          <button className="ss-btn ss-btn--icon" onClick={() => go(index + 1)} aria-label="Next concept" title="Next">
            <Chevron />
          </button>
        </div>

        <div className="ss-dots" role="tablist" aria-label="Splash concepts">
          {SPLASH_VARIANTS.map((v, i) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={i === index}
              className={`ss-dot${i === index ? ' is-active' : ''}${v.id === chosen ? ' is-chosen' : ''}`}
              onClick={() => go(i)}
              title={`${v.name}${v.id === chosen ? ' (active)' : ''}`}
            >
              <span />
            </button>
          ))}
        </div>

        <div className="ss-actions">
          <button
            className={`ss-use${variant.id === chosen ? ' is-chosen' : ''}`}
            onClick={() => select(variant.id)}
            title="Set as the app splash (plays on next load)"
          >
            {variant.id === chosen ? '✓ Active splash' : 'Use this one'}
          </button>
          <button className="ss-exit" onClick={exit}>
            Back to app
          </button>
        </div>
      </div>

      <Hint />
    </div>
  )
}

function Hint() {
  return <p className="ss-hint">auto-playing in a loop — pause, skip, and pick your favorite</p>
}

// Lazy stage: renders the selected variant's scene at full size.
function VariantStage({ id }) {
  const variant = getVariant(id)
  const [Comp, setComp] = useState(null)

  useEffect(() => {
    let alive = true
    variant.load().then(m => { if (alive) setComp(() => m.default) }).catch(() => {})
    return () => { alive = false }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ss-scene" aria-hidden="true">
      {Comp ? <Comp speed={1} reduced={false} /> : <span className="ss-scene-loading" />}
    </div>
  )
}

/* tiny inline glyphs — no icon dependency for a dev tool */
function Chevron({ left }) {
  return (
    <svg width="9" height="14" viewBox="0 0 9 14" fill="none" style={left ? { transform: 'rotate(180deg)' } : undefined}>
      <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function PlayGlyph() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
      <path d="M1 1.6c0-.8.9-1.3 1.6-.9l8.4 5.4c.6.4.6 1.4 0 1.8L2.6 13.3c-.7.4-1.6-.1-1.6-.9V1.6z" fill="currentColor" />
    </svg>
  )
}
function PauseGlyph() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
      <rect x="1" y="1" width="3.6" height="12" rx="1.2" fill="currentColor" />
      <rect x="7.4" y="1" width="3.6" height="12" rx="1.2" fill="currentColor" />
    </svg>
  )
}
