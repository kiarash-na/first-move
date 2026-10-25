"use client"

import type { CSSProperties } from "react"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Locale } from "@/lib/i18n/locales"
import { CountUp } from "../count-up"
import { useSlideActive } from "../deck-context"

export interface CostFiguresCopy {
  build: string
  about: string
  run: string
  maintenance: string
  /** The small print: the work hours the build figure does not count. */
  hours: string
}

/** Slide 10's two numbers, counting up when the slide enters: what First Move cost to build and costs to run. */
export function CostFigures({ lang, copy, cost }: { lang: Locale; copy: CostFiguresCopy; cost: { buildEur: number; runEurPerMonth: number; activeUsers: number } }) {
  const active = useSlideActive()
  const [before = "", after = ""] = copy.about.split("{amount}")
  const figures = [
    { key: "build", value: cost.buildEur, label: copy.build, duration: 1400 },
    { key: "run", value: cost.runEurPerMonth, label: interpolate(copy.run, { users: formatNumber(cost.activeUsers, lang) }), duration: 900 },
  ]

  return (
    <div className="cost" data-reveal style={{ "--i": 3 } as CSSProperties}>
      <div className="cost__figures">
        {figures.map((figure) => (
          <p key={figure.key} className="cost__figure" data-figure={figure.key}>
            <span className="cost__value">
              {before.trim() ? <span className="cost__about">{before.trim()} </span> : null}
              <CountUp value={figure.value} lang={lang} style="eur" active={active} duration={figure.duration} />
              {after.trim() ? <span className="cost__about"> {after.trim()}</span> : null}
            </span>{" "}
            <span className="cost__label">{figure.label}</span>
          </p>
        ))}
      </div>
      <p className="cost__note">{copy.maintenance}</p>
      <p className="cost__note cost__note--small">{copy.hours}</p>
    </div>
  )
}
