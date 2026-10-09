import barba from '@barba/core'

// React owns rendering and history; Barba's lifecycle only orchestrates motion.
// PJAX container replacement would remove a mounted React tree.
barba.hooks.enter(({ next, signal }) => {
  if (signal.aborted || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const animation = next.container.animate(
    [{ opacity: .3, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: 240, easing: 'cubic-bezier(.22,1,.36,1)' },
  )
  const cancel = () => animation.cancel()
  signal.addEventListener('abort', cancel, { once: true })
  return animation.finished.catch(() => {}).finally(() => signal.removeEventListener('abort', cancel))
})

export function enterScreen(container, namespace, signal) {
  return barba.hooks.do('enter', { next: { container, namespace }, signal })
}
