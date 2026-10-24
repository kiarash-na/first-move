"use client"

import { ArrowRightIcon, CheckIcon, LockIcon, ScanSearchIcon, XIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { dashboardHref } from "@/lib/dashboard/routes"
import { driverText } from "@/lib/dashboard/result-text"
import { explainResult, type DriverEffect, type QuickCheckComplete, type ResultLevel } from "@/lib/quick-check"
import { cn } from "@/lib/utils"
import { CustomParametersBadge } from "../../_components/custom-parameters-badge"
import { EffectMark } from "../../_components/effect-mark"
import { CalcInfo } from "../../_components/how-we-calculate"
import { useDictionary, useLocale } from "../../_components/i18n-provider"

/** State mapping of DESIGN-TOKENS §2: Promising = cyan + check, Further analysis = Paper + analysis icon, Not promising = orange + cross. */
const LEVEL = {
  promising: { icon: CheckIcon, text: "text-primary", border: "border-primary", line: "before:bg-primary" },
  further_analysis: { icon: ScanSearchIcon, text: "text-foreground", border: "border-foreground/60", line: "before:bg-foreground/70" },
  not_promising: { icon: XIcon, text: "text-hot", border: "border-hot", line: "before:bg-hot" },
} satisfies Record<ResultLevel, unknown>

const EFFECTS: DriverEffect[] = ["supporting", "limiting"]

/**
 * The verdict first (D-06, QCT-KF-01/05): the level with icon and text, a line on what it means,
 * and the supporting and limiting drivers beside it. The full reasoning is one click away.
 */
export function VerdictHero({ result }: { result: QuickCheckComplete }) {
  const lang = useLocale()
  const qc = useDictionary("quick-check")
  const overview = useDictionary("overview")
  const copy = overview.verdict
  const { assessment, flags, drivers } = result
  const level = LEVEL[assessment.level]
  const Icon = level.icon
  const levelCopy = qc.results.levels[assessment.level]

  return (
    <section
      aria-labelledby="overview-verdict"
      data-slot="verdict-hero"
      data-level={assessment.level}
      className={cn(
        "relative grid gap-x-12 gap-y-8 border bg-card p-[clamp(22px,3vw,40px)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]",
        "before:absolute before:inset-x-0 before:-top-px before:h-[3px]",
        level.line,
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">{copy.eyebrow}</p>
          <CalcInfo source={explainResult("level", flags)} label={copy.eyebrow} className="-m-2.5" />
        </div>
        <div className="flex items-start gap-5">
          <span className={cn("inline-flex size-16 shrink-0 items-center justify-center border sm:size-20", level.border, level.text)}>
            <Icon className="size-8 sm:size-10" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-col gap-2">
            <h2
              id="overview-verdict"
              className={cn("text-[clamp(32px,4.4vw,56px)] leading-[0.98] font-[580] tracking-[-0.05em] text-balance [font-stretch:78%]", level.text)}
            >
              {levelCopy.label}
            </h2>
            <p className="max-w-[46ch] text-base leading-relaxed text-text-secondary sm:text-[17px]">{levelCopy.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="secondary">
            <Link href={dashboardHref(lang, { page: "quick-check", step: "results" })}>
              {copy.details}
              <ArrowRightIcon strokeWidth={1.6} aria-hidden="true" />
            </Link>
          </Button>
          {assessment.forced && (
            <span className="inline-flex min-h-7 items-center gap-1.5 border px-2 py-0.5 font-mono text-xs tracking-[0.06em] text-foreground uppercase">
              <LockIcon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
              {qc.ui.results.forced}
            </span>
          )}
          <CustomParametersBadge />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">{copy.factors}</h3>
        <div className="grid gap-px border bg-border sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {EFFECTS.map((effect) => (
            <div key={effect} data-effect={effect} className="flex flex-col gap-3 bg-card p-4">
              <h4 className={cn("font-mono text-xs tracking-[0.075em] uppercase", effect === "supporting" ? "text-primary" : "text-hot")}>
                {copy[effect]} · {drivers[effect].length}
              </h4>
              {drivers[effect].length > 0 ? (
                <ul className="flex flex-col gap-2.5">
                  {drivers[effect].map((driver) => (
                    <li key={driver.id} className="flex items-start gap-2.5 text-[15px] leading-snug">
                      <EffectMark effect={effect} />
                      <span className="pt-0.5">{driverText(driver, qc, lang)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{copy.none}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
