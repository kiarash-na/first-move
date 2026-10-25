import type { CSSProperties } from "react"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import { SLIDE_IDS, type SlideId } from "@/lib/presentation/slides"
import { SlideHeading } from "../slide-heading"
import { CriteriaPicker } from "./criteria-picker"

/** Which slide answers each jury criterion, in the order of `slides.challenge.criteria`. */
const ANSWERED_ON: readonly SlideId[] = ["quickCheck", "quickCheck", "businessPlan", "businessPlan", "aiEngine", "emails"]

/**
 * Slide 2: the challenge (BM-SCOPE-02), who it is for (QCT-SCOPE-13) and the jury's questions
 * (BM-SCOPE-08, QCT-SCOPE-11) mapped to the slides that answer them.
 */
export function ChallengeSlide({ number, copy }: { number: number; copy: Dictionary<"presentation">["slides"]["challenge"] }) {
  const criteria = copy.criteria.map((criterion, index) => ({ ...criterion, slide: SLIDE_IDS.indexOf(ANSWERED_ON[index]) }))

  return (
    <div className="slide slide--split slide--challenge">
      <SlideHeading number={number} kicker={copy.kicker} headline={copy.headline} accent={copy.accent} />
      <div className="slide__body">
        <p className="slide-line" data-reveal style={{ "--i": 3 } as CSSProperties}>
          {copy.line}
        </p>
        <div className="audiences" data-reveal style={{ "--i": 4 } as CSSProperties}>
          <p className="deck-label">{copy.forLabel}</p>
          <ul>
            {copy.audiences.map((audience) => (
              <li key={audience}>{audience}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="slide__visual" data-reveal style={{ "--i": 2 } as CSSProperties}>
        <CriteriaPicker criteria={criteria} labels={{ criteria: copy.criteriaLabel, answer: copy.answerLabel, goTo: copy.goTo }} />
      </div>
    </div>
  )
}
