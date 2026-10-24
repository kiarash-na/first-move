import { useEffect, useState } from 'react'

export function useActiveChapter() {
  const [chapter, setChapter] = useState('overview')

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'))
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setChapter(entry.target.id)
      })
    }, { rootMargin: '-42% 0px -48% 0px', threshold: 0 })

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return chapter
}

export function useScrollReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])
}
