"use client"

import { driverText } from "@/lib/dashboard/result-text"
import type { DriverEffect, Drivers } from "@/lib/quick-check"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { EffectMark } from "../../_components/effect-mark"

const EFFECTS: DriverEffect[] = ["supporting", "limiting"]

/** The main factors supporting or limiting the result (QCT-KF-01, KF-05), side by side. */
export function DriversPanel({ drivers }: { drivers: Drivers }) {
  const lang = useLocale()
  const copy = useDictionary("quick-check")
  const ui = copy.ui.results.drivers
  return (
    <section aria-labelledby="drivers-title" data-slot="drivers" className="flex flex-col gap-4">
      <h2 id="drivers-title" className="text-xl leading-tight font-[560] tracking-[-0.035em] [font-stretch:86%]">
        {ui.title}
      </h2>
      <div className="grid gap-px border bg-border sm:grid-cols-2">
        {EFFECTS.map((effect) => (
          <div key={effect} data-effect={effect} className="flex flex-col gap-3 bg-background p-5">
            <h3 className={cn("font-mono text-xs tracking-[0.075em] uppercase", effect === "supporting" ? "text-primary" : "text-hot")}>
              {ui[effect]} · {drivers[effect].length}
            </h3>
            {drivers[effect].length > 0 ? (
              <ul className="flex flex-col gap-2.5">
                {drivers[effect].map((driver) => (
                  <li key={driver.id} className="flex items-start gap-3 text-[15px] leading-snug">
                    <EffectMark effect={effect} />
                    <span className="pt-0.5">{driverText(driver, copy, lang)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{ui.none}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
