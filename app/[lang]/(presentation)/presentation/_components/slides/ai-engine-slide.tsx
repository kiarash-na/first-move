import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import type { CSSProperties } from "react"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import { formatDate, formatNumber, formatQuantity } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { withLocale } from "@/lib/i18n/locale-path"
import type { Locale } from "@/lib/i18n/locales"
import type { BlindSummary } from "@/lib/presentation/blind-test/summary"
import { SlideHeading } from "../slide-heading"
import { BlindTest, type BlindTestView } from "./blind-test"

type Copy = Dictionary<"presentation">["slides"]["aiEngine"]
type Labels = Dictionary<"ai-score">["labels"]

/** Engine ids → the app's own EN/DE names (`ai-score.json`), with the id as a last resort. */
function nameOf(table: Record<string, { name: string } | string>, id: string): string {
  const entry = table[id]
  return typeof entry === "string" ? entry : (entry?.name ?? id)
}

/** Everything the replay shows, formatted on the server in the slide's language. */
export function blindView(lang: Locale, summary: BlindSummary, copy: Copy, labels: Labels): BlindTestView {
  const day = (iso: string) => formatDate(iso, lang, { dateStyle: "long", timeZone: "UTC" })
  const outcomeUrl = summary.outcome.sources as Record<string, string>
  return {
    seats: summary.dimensions.map((dimension) => ({ ...dimension, name: nameOf(labels.dimensions, dimension.id) })),
    score: summary.score,
    band: summary.band,
    levelName: labels.scoreLevels[summary.level].name,
    turns: summary.engine.turns,
    input: interpolate(copy.blindInput, { date: day(summary.input.created) }),
    inputUrl: summary.input.url,
    decided: interpolate(copy.decided, { seconds: formatQuantity(summary.decisionsMs / 1000, "s", lang, { maximumFractionDigits: 1 }) }),
    // Every gate the run checked: the core gates and the follow-up gates its branches chose.
    gates: interpolate(copy.gates, {
      count: formatNumber(summary.gates.pass + summary.gates.fail + summary.gates.unclear, lang),
      outcomes: [
        `${formatNumber(summary.gates.pass, lang)} ${labels.outcomes.pass}`,
        `${formatNumber(summary.gates.fail, lang)} ${labels.outcomes.fail}`,
        `${formatNumber(summary.gates.unclear, lang)} ${labels.outcomes.unclear}`,
      ].join(" · "),
    }),
    mustHave: summary.mustHaveFailed.map((id) => nameOf(labels.gates, id)),
    action: summary.action,
    outcome: copy.outcome.map((item) => ({ text: item.text, url: outcomeUrl[item.source] })),
    recorded: interpolate(copy.recorded, { date: day(summary.at) }),
    tryHref: withLocale("/dashboard/ai-score", lang),
  }
}

/**
 * Slide 5: the AI Plan Score as a table of experts (D-71, D-75): taught what a good decision is
 * from the provider's material and verified sources, deciding in seconds. The proof is a blind
 * test on a plan with a known outcome; one case demonstrates, it does not validate.
 */
export function AiEngineSlide({ number, lang, copy, labels, summary }: { number: number; lang: Locale; copy: Copy; labels: Labels; summary: BlindSummary }) {
  return (
    <div className="slide slide--split slide--ai-engine">
      <SlideHeading number={number} kicker={copy.kicker} headline={copy.headline} accent={copy.accent} />
      <div className="slide__body">
        <p className="slide-line" data-reveal style={{ "--i": 3 } as CSSProperties}>
          {copy.line}{" "}
          <Link href={withLocale("/docs/ai-plan-score", lang)} className="deck-inline-link" prefetch={false}>
            {copy.sources}
            <ArrowUpRight size={14} strokeWidth={1.6} aria-hidden="true" />
          </Link>
        </p>
      </div>
      <div className="slide__visual" data-reveal style={{ "--i": 2 } as CSSProperties}>
        <BlindTest lang={lang} view={blindView(lang, summary, copy, labels)} copy={copy} />
      </div>
    </div>
  )
}
