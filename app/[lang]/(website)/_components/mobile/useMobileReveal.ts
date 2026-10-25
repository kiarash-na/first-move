import { useEffect, type RefObject } from 'react'

export const REVEAL_ATTRIBUTE = 'data-m-reveal'
export const REVEAL_CLASS = 'is-in'

/**
 * Light scroll-reveal for the mobile landing: every `[data-m-reveal]` inside `root` gets `is-in`
 * when it scrolls into view. The hide rule in `mobile.css` needs `data-ready` on the root, which
 * only this effect sets, so without JavaScript nothing is hidden. With reduced motion, or without
 * IntersectionObserver, everything shows at once.
 */
export function useMobileReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current
    if (!element) return
    const targets = Array.from(element.querySelectorAll<HTMLElement>(`[${REVEAL_ATTRIBUTE}]`))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || typeof IntersectionObserver === 'undefined') {
      targets.forEach((target) => target.classList.add(REVEAL_CLASS))
      return
    }

    element.setAttribute('data-ready', 'true')
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add(REVEAL_CLASS)
        observer.unobserve(entry.target)
      }
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 })
    targets.forEach((target) => observer.observe(target))

    return () => {
      observer.disconnect()
      element.removeAttribute('data-ready')
    }
  }, [root])
}
