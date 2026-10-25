"use client"

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from "react"
import { interpolate } from "@/lib/i18n/interpolate"
import { DECK_BOOT_STYLE_ID } from "@/lib/presentation/boot"
import { applyAction, type DeckAction, type SlideId } from "@/lib/presentation/slides"
import { DeckContext, SlideIndexContext, type DeckApi } from "./deck-context"
import { DeckControls, type DeckControlsCopy } from "./deck-controls"
import { DeckTopBar, type DeckTopBarProps } from "./deck-top-bar"
import { useDeckKeys, useSwipe } from "./use-deck-input"
import { useSlideHash } from "./use-slide-hash"
import "./presentation.css"

export interface DeckSlide {
  id: SlideId
  title: string
  content: ReactNode
}

export interface DeckCopy extends DeckControlsCopy {
  label: string
  slide: string
  slideLabel: string
  announce: string
  fullscreen: string
  exitFullscreen: string
}

export interface DeckProps extends Omit<DeckTopBarProps, "fullscreen"> {
  copy: DeckCopy
  slides: readonly DeckSlide[]
}

const noSubscription = () => () => {}

/**
 * The presentation deck (PLAN-PRESENTATION-00): one slide at a time, keyboard, swipe, dots and a
 * select as index, the slide number in the hash, a live announcement and focus that follows
 * the slide when it would otherwise be lost. Without JavaScript the slides stay one long page.
 */
export function Deck({ copy, slides, ...bar }: DeckProps) {
  const count = slides.length
  const [index, setIndex] = useSlideHash(count)
  const mounted = useSyncExternalStore(noSubscription, () => true, () => false)
  const sections = useRef<(HTMLElement | null)[]>([])
  const live = useRef<HTMLParagraphElement>(null)
  const focusNext = useRef(false)
  const shown = useRef<number | null>(null)

  const goTo = useCallback<DeckApi["goTo"]>(
    (target, options) => {
      const current = sections.current.find((section) => section?.contains(document.activeElement))
      focusNext.current = Boolean(options?.focus) || current !== undefined
      setIndex(target)
    },
    [setIndex],
  )
  const act = useCallback((action: DeckAction) => goTo(applyAction(index, action, count)), [goTo, index, count])

  useDeckKeys(act)
  const swipe = useSwipe(act)

  useEffect(() => {
    if (!mounted) return
    const section = sections.current[index]
    // The boot script's style shows a deep-linked slide before hydration; drop it once the deck shows the same slide.
    document.getElementById(DECK_BOOT_STYLE_ID)?.remove()
    if (shown.current !== null && shown.current !== index) {
      if (live.current) live.current.textContent = interpolate(copy.announce, { current: index + 1, total: count, title: slides[index].title })
      if (section) section.scrollTop = 0
    }
    if (focusNext.current) section?.focus({ preventScroll: true })
    focusNext.current = false
    shown.current = index
  }, [mounted, index, count, copy.announce, slides])

  const api = useMemo<DeckApi>(() => ({ index, count, goTo }), [index, count, goTo])

  return (
    <DeckContext.Provider value={api}>
      <div className="deck" style={{ "--deck-progress": (index + 1) / count } as CSSProperties}>
        <div className="deck-progress" aria-hidden="true" />
        <DeckTopBar {...bar} fullscreen={{ enterLabel: copy.fullscreen, exitLabel: copy.exitFullscreen }} />
        <main className="deck-stage" {...swipe}>
          <h1 className="sr-only">{copy.label}</h1>
          {slides.map((slide, slideIndex) => (
            <section
              key={slide.id}
              ref={(element) => {
                sections.current[slideIndex] = element
              }}
              id={`slide-${slideIndex + 1}`}
              className="deck-slide"
              data-slide={slide.id}
              data-number={slideIndex + 1}
              data-state={slideIndex === index ? "active" : slideIndex < index ? "before" : "after"}
              aria-roledescription={copy.slide}
              aria-label={interpolate(copy.slideLabel, { current: slideIndex + 1, total: count, title: slide.title })}
              inert={mounted && slideIndex !== index}
              tabIndex={-1}
            >
              <SlideIndexContext.Provider value={slideIndex}>{slide.content}</SlideIndexContext.Provider>
            </section>
          ))}
        </main>
        <DeckControls copy={copy} titles={slides.map((slide) => slide.title)} />
        <p ref={live} className="sr-only" aria-live="polite" aria-atomic="true" />
      </div>
    </DeckContext.Provider>
  )
}
