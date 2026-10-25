import type { Dictionary } from "@/lib/i18n/dictionaries"
import { SlideHeading } from "../slide-heading"
import { FeatureCards } from "./feature-cards"

/**
 * Slide 9: future features (owner's choice: a 3D building scan, plus four that follow from the
 * challenge: map import, an owner tracker, a funding and permit navigator, a live digital twin).
 */
export function NextMovesSlide({ number, copy }: { number: number; copy: Dictionary<"presentation">["slides"]["nextMoves"] }) {
  return (
    <div className="slide slide--stack slide--next-moves">
      <SlideHeading number={number} kicker={copy.kicker} headline={copy.headline} accent={copy.accent} />
      <FeatureCards features={copy.features} />
    </div>
  )
}
