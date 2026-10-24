import type { Dictionary } from "@/lib/i18n/dictionaries"
import { INTL_LOCALES } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Locale } from "@/lib/i18n/locales"
import type { SourceKey } from "@/lib/project/catalog/sources"
import type { Demand, Driver, OverallReason } from "@/lib/quick-check"

type QuickCheckCopy = Dictionary<"quick-check">

/** "a, b and c" in the UI language. */
export function joinList(items: readonly string[], lang: Locale): string {
  return new Intl.ListFormat(INTL_LOCALES[lang], { style: "long", type: "conjunction" }).format(items)
}

const sourceNames = (sources: readonly SourceKey[] | undefined, copy: QuickCheckCopy, lang: Locale) =>
  joinList((sources ?? []).map((source) => copy.sources[source].inText), lang)

const demandNames = (demands: readonly Demand[] | undefined, copy: QuickCheckCopy, lang: Locale) =>
  joinList((demands ?? []).map((demand) => copy.results.demands[demand].inText), lang)

/**
 * The sentence of one TBL-11 reason (QCT-KF-01, KF-06), with the sources or demands it names
 * filled in: "The potential of geothermal is unknown. …".
 */
export function reasonText(reason: OverallReason, copy: QuickCheckCopy, lang: Locale): string {
  return interpolate(copy.results.reasons[reason.code].label, {
    sources: sourceNames(reason.sources, copy, lang),
    demands: demandNames(reason.demands, copy, lang),
  })
}

/** The label of a supporting or limiting factor (QCT-KF-05). */
export function driverText(driver: Driver, copy: QuickCheckCopy, lang: Locale): string {
  const effects = copy.results.drivers[driver.id] as Partial<Record<Driver["effect"], { label: string }>>
  const template = effects[driver.effect]?.label ?? ""
  return interpolate(template, { sources: sourceNames(driver.sources, copy, lang) })
}
