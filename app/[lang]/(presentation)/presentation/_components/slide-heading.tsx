import type { CSSProperties } from "react"
import { padSlideNumber } from "@/lib/presentation/slides"

/**
 * Kicker and display title of a slide: an uppercase line and an italic accent line, each rising
 * out of its own mask when the slide enters (`presentation.css`).
 */
export function SlideHeading({ number, kicker, headline, accent }: { number: number; kicker: string; headline: string; accent: string }) {
  return (
    <header className="slide-heading">
      <p className="slide-kicker" data-reveal style={{ "--i": 0 } as CSSProperties}>
        <span className="slide-kicker__number">{padSlideNumber(number)}</span>
        {kicker}
      </p>
      <h2 className="slide-title">
        <span className="slide-title__line">
          <span>{headline}</span>
        </span>{" "}
        <span className="slide-title__line slide-title__line--accent">
          <span>{accent}</span>
        </span>
      </h2>
    </header>
  )
}
