"use client"

import { ArrowRight } from "lucide-react"
import { useState } from "react"
import { interpolate } from "@/lib/i18n/interpolate"
import { padSlideNumber } from "@/lib/presentation/slides"
import { useDeck } from "../deck-context"

export interface Criterion {
  label: string
  answer: string
  /** 0-based index of the slide that answers it. */
  slide: number
}

/**
 * Slide 2: what the jury asks (BM-SCOPE-08, QCT-SCOPE-11), and where the deck answers it. Picking
 * a criterion shows the answer; its button jumps to that slide.
 */
export function CriteriaPicker({ criteria, labels }: { criteria: readonly Criterion[]; labels: { criteria: string; answer: string; goTo: string } }) {
  const [selected, setSelected] = useState(0)
  const { goTo } = useDeck()
  const current = criteria[selected]

  return (
    <div className="criteria">
      <div className="criteria__list">
        <p className="deck-label">{labels.criteria}</p>
        <ul>
          {criteria.map((criterion, index) => (
            <li key={criterion.label}>
              <button type="button" className="criteria__item" aria-pressed={index === selected} onClick={() => setSelected(index)}>
                <span className="criteria__number" aria-hidden="true">
                  {padSlideNumber(index + 1)}
                </span>
                {criterion.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="criteria__answer" aria-live="polite">
        <p className="deck-label">{labels.answer}</p>
        <div key={selected} className="criteria__card">
          <p className="criteria__text">{current.answer}</p>
          <button type="button" className="deck-link-button" onClick={() => goTo(current.slide, { focus: true })}>
            {interpolate(labels.goTo, { number: current.slide + 1 })}
            <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
