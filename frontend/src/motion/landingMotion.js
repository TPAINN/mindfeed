import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export default function setupLandingMotion(root) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  let lenis
  let animation
  function stop() {
    lenis?.destroy()
    lenis = undefined
    animation?.cancel()
  }
  function start() {
    stop()
    if (preference.matches) return
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      lenis = new Lenis({ autoRaf: true, anchors: true, duration: .8 })
    }
    animation = root.querySelector('.editorial-preview')?.animate(
      [{ transform: 'translateY(12px)', opacity: .5 }, { transform: 'translateY(0)', opacity: 1 }],
      { duration: 550, easing: 'cubic-bezier(.22,1,.36,1)' },
    )
  }
  start()
  preference.addEventListener('change', start)
  return () => { preference.removeEventListener('change', start); stop() }
}
