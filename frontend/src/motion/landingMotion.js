// ── Landing-only scroll choreography ────────────────────────────────────────
// This module is loaded via dynamic import ONLY when the marketing page
// mounts, so gsap + lenis (~65 kB) never enter the bundle of the deck app —
// the core product stays fast on slow phones. Everything here is torn down
// when the Landing unmounts (ctx.revert() clears GSAP inline styles, Lenis is
// destroyed, the ticker hook is removed).

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

let activeLenis = null

/** Current Lenis instance (if the Landing is mounted and motion is allowed). */
export function lenisInstance() {
  return activeLenis
}

export default function setupLandingMotion(root, navEl) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let lenis = null
  let tick = null

  if (!reduced) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 })
    activeLenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
  }

  const ctx = gsap.context(() => {
    if (reduced) return

    // The giant "10" settles: it arrives soft and blurred, tightening as it
    // crosses the viewport (scrubbed with scroll, no pin — layout-safe).
    gsap.fromTo('.mf-lp__ten-numeral',
      { scale: 0.78, opacity: 0.25, filter: 'blur(14px)' },
      {
        scale: 1, opacity: 1, filter: 'blur(0px)',
        ease: 'none',
        scrollTrigger: {
          trigger: '.mf-lp__ten',
          start: 'top 78%',
          end: 'top 30%',
          scrub: 0.6,
        },
      }
    )

    // Compare columns glide in from their own sides; the divider draws last.
    gsap.from('.mf-lp__col--them', {
      xPercent: -6, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.mf-lp__compare', start: 'top 82%', once: true },
    })
    gsap.from('.mf-lp__col--us', {
      xPercent: 6, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.mf-lp__compare', start: 'top 82%', once: true },
    })
    gsap.from('.mf-lp__vs', {
      scaleY: 0.2, opacity: 0, duration: 0.8, ease: 'power2.out',
      transformOrigin: 'center',
      scrollTrigger: { trigger: '.mf-lp__compare', start: 'top 72%', once: true },
    })

    // Source chips arrive in a soft wave.
    gsap.from('.mf-lp__sources li', {
      y: 18, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.07,
      scrollTrigger: { trigger: '.mf-lp__sources', start: 'top 82%', once: true },
    })
  }, root)

  // Glass nav once the page has travelled a little.
  const onScroll = () => {
    if (navEl) navEl.classList.toggle('is-scrolled', window.scrollY > 14)
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  // Let webfonts settle before measuring trigger positions.
  const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 500)

  return function cleanup() {
    clearTimeout(refreshTimer)
    window.removeEventListener('scroll', onScroll)
    ctx.revert()
    if (tick) gsap.ticker.remove(tick)
    if (lenis) {
      lenis.destroy()
      if (activeLenis === lenis) activeLenis = null
    }
  }
}
