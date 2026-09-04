/* ── Splash variant registry ────────────────────────────────────────────────
   Each entry is a full-screen reveal concept that can be picked in the Splash
   Studio (?studio=1). The user's choice is persisted to localStorage under
   mf_splash_variant and the real Splash shell renders that variant.

   `load` is dynamic so un-chosen heavy variants (three.js) never enter the
   app's main bundle. v1 is the default and is statically bundled.           */

export const DEFAULT_VARIANT = 'v4-shards'

export const SPLASH_VARIANTS = [
  {
    id: 'v1-card',
    name: 'The First Card',
    tech: 'Motion · CSS',
    note: 'The deal — a knowledge card springs in',
    existing: true,
    duration: 2500,
    static: true,
    load: () => import('./variants/v1-card.jsx'),
  },
  {
    id: 'v2-orbit',
    name: 'Orbit',
    tech: 'GSAP',
    note: 'Progress ring draws as letters fly into orbit',
    duration: 3000,
    static: false,
    load: () => import('./variants/v2-orbit.jsx'),
  },
  {
    id: 'v3-bloom',
    name: 'Bloom',
    tech: 'Anime.js · Motion',
    note: 'Breathing light bloom + counting preloader',
    duration: 2800,
    static: false,
    load: () => import('./variants/v3-bloom.jsx'),
  },
  {
    id: 'v4-shards',
    name: 'Shards',
    tech: 'Motion',
    note: 'Geometric shards assemble into a star',
    duration: 2800,
    static: false,
    load: () => import('./variants/v4-shards.jsx'),
  },
  {
    id: 'v5-float',
    name: '3D Float',
    tech: 'React Three Fiber',
    note: 'A softly lit 3D object floats behind the mark',
    duration: 3200,
    static: false,
    load: () => import('./variants/v5-float.jsx'),
  },
]

export function getVariant(id) {
  return SPLASH_VARIANTS.find(v => v.id === id) || SPLASH_VARIANTS[0]
}

export function getChosenVariantId() {
  try {
    const stored = localStorage.getItem('mf_splash_variant')
    if (stored && SPLASH_VARIANTS.some(v => v.id === stored)) return stored
  } catch { /* storage unavailable */ }
  return DEFAULT_VARIANT
}

export function setChosenVariantId(id) {
  if (!getVariant(id)) return
  try { localStorage.setItem('mf_splash_variant', id) } catch { /* private mode */ }
}

// Per-variant reveal time. Brief visits compress via speed 0.5; reduced
// motion shows a short static frame (500ms) regardless of the variant.
export function revealMs(variantId, brief) {
  const v = getVariant(variantId)
  return brief ? Math.round(v.duration * 0.5) : v.duration
}
