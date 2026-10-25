import type { CSSProperties } from "react"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/locales"
import { SLIDE_IDS } from "@/lib/presentation/slides"
import { SlideHeading } from "../slide-heading"
import { StepsMeter } from "./steps-meter"

/** Slide 4: the Business Plan's four steps (BM-STEP-01..04) and Pitch completeness (D-74). */
export function BusinessPlanSlide({ number, lang, copy }: { number: number; lang: Locale; copy: Dictionary<"presentation">["slides"]["businessPlan"] }) {
  return (
    <div className="slide slide--split slide--business-plan">
      <SlideHeading number={number} kicker={copy.kicker} headline={copy.headline} accent={copy.accent} />
      <div className="slide__body">
        <p className="slide-line" data-reveal style={{ "--i": 3 } as CSSProperties}>
          {copy.line}
        </p>
      </div>
      <div className="slide__visual" data-reveal style={{ "--i": 2 } as CSSProperties}>
        <StepsMeter lang={lang} copy={copy} judgeSlide={SLIDE_IDS.indexOf("aiEngine")} />
      </div>
    </div>
  )
}
