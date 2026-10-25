import type { Dictionary } from "@/lib/i18n/dictionaries"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Locale } from "@/lib/i18n/locales"
import { GUARD_THRESHOLDS } from "@/lib/presentation/guard-demo"
import { SlideHeading } from "../slide-heading"
import { GuardDemo } from "./guard-demo"

/**
 * Slide 7: System 1 models for security, as built in lib/mail-agent/guard (D-52, D-55): a fast
 * decision model judges every incoming email before any generative model sees it, and code
 * thresholds decide.
 */
export function SystemOneSlide({ number, lang, copy }: { number: number; lang: Locale; copy: Dictionary<"presentation">["slides"]["systemOne"] }) {
  const value = (number: number) => formatNumber(number, lang, { minimumFractionDigits: 1 })
  const thresholds = interpolate(copy.thresholds, {
    block: value(GUARD_THRESHOLDS.block),
    suspect: value(GUARD_THRESHOLDS.suspect),
    offTopic: value(GUARD_THRESHOLDS.offTopic),
  })

  return (
    <div className="slide slide--split slide--system-one">
      <SlideHeading number={number} kicker={copy.kicker} headline={copy.headline} accent={copy.accent} />
      <GuardDemo lang={lang} copy={copy} thresholds={thresholds} />
    </div>
  )
}
