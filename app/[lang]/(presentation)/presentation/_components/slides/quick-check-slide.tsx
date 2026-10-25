import type { CSSProperties } from "react"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/locales"
import { demoProject, runDemo } from "@/lib/presentation/quick-check-demo"
import type { ResultLevel } from "@/lib/quick-check/overall-rule"
import { SlideHeading } from "../slide-heading"
import { DeterminismDemo } from "./determinism-demo"

/**
 * Slide 3: the Quick Check is the provider's methodology, deterministic (QCT-SCOPE-04,
 * QCT-SCOPE-11 "correct implementation"). The console shows a real result of an illustrative
 * example; the level names come from the Quick Check's own dictionary.
 */
export function QuickCheckSlide({
  number,
  lang,
  copy,
  levelNames,
}: {
  number: number
  lang: Locale
  copy: Dictionary<"presentation">["slides"]["quickCheck"]
  levelNames: Record<ResultLevel, string>
}) {
  const project = demoProject(lang)

  return (
    <div className="slide slide--split slide--quick-check">
      <SlideHeading number={number} kicker={copy.kicker} headline={copy.headline} accent={copy.accent} />
      <div className="slide__body">
        <p className="slide-line" data-reveal style={{ "--i": 3 } as CSSProperties}>
          {copy.line}
        </p>
      </div>
      <div className="slide__visual" data-reveal style={{ "--i": 2 } as CSSProperties}>
        <DeterminismDemo lang={lang} project={project} initial={runDemo(project)} copy={copy} levelNames={levelNames} />
      </div>
    </div>
  )
}
