import type { Dictionary } from "@/lib/i18n/dictionaries"
import { SlideHeading } from "../slide-heading"
import { FirstMove } from "./first-move"

/** Slide 1: why the name. In chess the first move shapes the game; here it starts a 5GDHC network. */
export function WhySlide({ number, copy }: { number: number; copy: Dictionary<"presentation">["slides"]["why"] }) {
  return (
    <div className="slide slide--split slide--why">
      <SlideHeading number={number} kicker={copy.kicker} headline={copy.headline} accent={copy.accent} />
      <FirstMove copy={copy} />
    </div>
  )
}
