"use client"

import { ArrowRight, Plus } from "lucide-react"
import { useId, useState, type CSSProperties } from "react"
import { formatPercent } from "@/lib/i18n/format"
import type { Locale } from "@/lib/i18n/locales"
import { padSlideNumber } from "@/lib/presentation/slides"
import { useDeck } from "../deck-context"

export interface StepsMeterCopy {
  stepsLabel: string
  steps: readonly { label: string; text: string }[]
  meter: string
  meterNote: string
  illustrative: string
  judge: string
}

/**
 * Slide 4: the four Business Plan steps (BM-STEP-01..04). Opening a step reveals what it asks;
 * the meter beside it fills as an illustration of Pitch completeness, which counts and never
 * judges. Its link leads to the slide that judges: the AI Plan Score.
 */
export function StepsMeter({ lang, copy, judgeSlide }: { lang: Locale; copy: StepsMeterCopy; judgeSlide: number }) {
  const [open, setOpen] = useState<readonly boolean[]>(() => copy.steps.map(() => false))
  const { goTo } = useDeck()
  const id = useId()
  const share = open.filter(Boolean).length / copy.steps.length

  return (
    <div className="steps">
      <p className="deck-label">{copy.stepsLabel}</p>
      <ol className="steps__track">
        {copy.steps.map((step, index) => (
          <li key={step.label} className="steps__step" data-open={open[index] || undefined} style={{ "--i": index } as CSSProperties}>
            <button
              type="button"
              className="steps__button"
              aria-expanded={open[index]}
              aria-controls={`${id}-${index}`}
              onClick={() => setOpen((current) => current.map((value, at) => (at === index ? !value : value)))}
            >
              <span className="steps__number" aria-hidden="true">
                {padSlideNumber(index + 1)}
              </span>
              <span className="steps__label">{step.label}</span>
              <Plus className="steps__icon" size={16} strokeWidth={1.6} aria-hidden="true" />
            </button>
            <div className="steps__reveal" id={`${id}-${index}`}>
              <p>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="meter" style={{ "--share": share } as CSSProperties}>
        <p className="meter__head">
          <span className="meter__name">{copy.meter}</span>
          <span className="meter__tag">{copy.illustrative}</span>
          <span className="meter__value">{formatPercent(share, lang)}</span>
        </p>
        <div className="meter__bar" aria-hidden="true">
          <span />
        </div>
        <p className="meter__note">{copy.meterNote}</p>
        <button type="button" className="deck-link-button" onClick={() => goTo(judgeSlide, { focus: true })}>
          {copy.judge}
          <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
