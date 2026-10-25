import type { CSSProperties } from "react"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import { SlideHeading } from "../slide-heading"
import { HealingLoop } from "./healing-loop"

/** Slide 8: self-healing apps, a concept and labelled so: errors tracked, reproduced, fixed by an agent, approved by a person. */
export function SelfHealingSlide({ number, copy }: { number: number; copy: Dictionary<"presentation">["slides"]["selfHealing"] }) {
  return (
    <div className="slide slide--split slide--self-healing">
      <SlideHeading number={number} kicker={copy.kicker} headline={copy.headline} accent={copy.accent} />
      <div className="slide__body">
        <p className="deck-chip deck-chip--hot deck-chip--concept" data-reveal style={{ "--i": 3 } as CSSProperties}>
          {copy.concept}
        </p>
        <p className="slide-line" data-reveal style={{ "--i": 4 } as CSSProperties}>
          {copy.line}
        </p>
      </div>
      <div className="slide__visual" data-reveal style={{ "--i": 2 } as CSSProperties}>
        <HealingLoop copy={copy} />
      </div>
    </div>
  )
}
