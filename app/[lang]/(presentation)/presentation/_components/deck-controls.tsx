"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDeck } from "./deck-context"

export interface DeckControlsCopy {
  index: string
  goTo: string
  previous: string
  next: string
  hint: string
}

/**
 * Bottom bar: the keyboard hint, the index (dots from 768 px, a native select below, where ten
 * 44 px dots do not fit), and previous and next. The arrows stay focusable at the ends
 * (`aria-disabled`), so focus is never lost.
 */
export function DeckControls({ copy, titles }: { copy: DeckControlsCopy; titles: readonly string[] }) {
  const { index, count, goTo } = useDeck()
  const label = (number: number) => interpolate(copy.goTo, { number, title: titles[number - 1] })
  const atStart = index === 0
  const atEnd = index === count - 1

  return (
    <div className="deck-bar deck-bar--bottom">
      <p className="deck-hint">{copy.hint}</p>
      <nav className="deck-index" aria-label={copy.index}>
        <ol className="deck-dots">
          {titles.map((title, slide) => (
            <li key={title}>
              <button
                type="button"
                className="deck-dot"
                aria-label={label(slide + 1)}
                aria-current={slide === index ? "step" : undefined}
                onClick={() => goTo(slide, { focus: true })}
              >
                <span aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
        <select className="deck-select" aria-label={copy.index} value={index} onChange={(event) => goTo(Number(event.target.value), { focus: true })}>
          {titles.map((title, slide) => (
            <option key={title} value={slide}>
              {label(slide + 1)}
            </option>
          ))}
        </select>
      </nav>
      <div className="deck-arrows">
        <button type="button" className="deck-icon-button" aria-label={copy.previous} aria-disabled={atStart} onClick={() => !atStart && goTo(index - 1)}>
          <ArrowLeft size={18} strokeWidth={1.6} aria-hidden="true" />
        </button>
        <button type="button" className="deck-icon-button deck-icon-button--next" aria-label={copy.next} aria-disabled={atEnd} onClick={() => !atEnd && goTo(index + 1)}>
          <ArrowRight size={18} strokeWidth={1.6} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
