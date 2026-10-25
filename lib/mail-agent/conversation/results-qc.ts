import "server-only"
import type { Block, IndicatorItem, Section, ValueRow } from "@/emails/model"
import { indicatorEffect } from "@/lib/dashboard/indicator-effect"
import { formatIndicator } from "@/lib/dashboard/indicator-format"
import { driverText, reasonText } from "@/lib/dashboard/result-text"
import { formatEnergy, formatEur, formatQuantity } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { BUILDING_TYPES, CONSTRUCTION_PERIODS, SOURCES, type Project } from "@/lib/project"
import type { Driver, QuickCheckComplete } from "@/lib/quick-check"
import { calcNotesSection } from "./calc-notes"
import { formatFieldValue } from "./format-value"
import type { MailTexts } from "./texts"

function indicators(result: QuickCheckComplete, t: MailTexts): IndicatorItem[] {
  const lang = t.locale
  const copy = t.quickCheck
  const ui = copy.ui.results.indicators
  const { results } = t.mail.conversation
  const { classes, values, drivers } = result
  const effectLabel = (effect: IndicatorItem["effect"]) => (effect ? copy.ui.results.drivers[effect] : undefined)
  const item = (label: string, value: string, classLabel: string, effect: IndicatorItem["effect"]): IndicatorItem => ({
    label,
    value,
    classLabel,
    effect,
    ...(effectLabel(effect) && { effectLabel: effectLabel(effect) }),
  })
  const notApplicable = copy.results.classes.notApplicable.label
  const coverage = (demand: "heating" | "cooling") => {
    const cls = demand === "heating" ? classes.heatingCoverage : classes.coolingCoverage
    const value = demand === "heating" ? values.heatingCoverage : values.coolingCoverage
    return item(
      demand === "heating" ? results.heatingCoverage : results.coolingCoverage,
      cls ? formatIndicator("coverage", value, lang) : "–",
      cls ? copy.results.classes.coverage[cls].label : notApplicable,
      indicatorEffect(drivers, demand === "heating" ? "heating_coverage" : "cooling_coverage"),
    )
  }
  return [
    coverage("heating"),
    coverage("cooling"),
    item(
      ui.buildingDensity,
      `${formatIndicator("buildingDensity", values.buildingDensity, lang)} ${ui.densityUnit}`,
      `${copy.results.classes.buildingDensity[classes.buildingDensity].label} · ${copy.derived.densityCategory.options[classes.densityCategory].label}`,
      indicatorEffect(drivers, "building_density"),
    ),
    item(
      ui.heatDensity,
      `${formatIndicator("heatDensity", values.heatDensityMwhPerM, lang)} ${ui.heatUnit}`,
      copy.results.classes.heatDensity[classes.heatDensity].label,
      indicatorEffect(drivers, "heat_density"),
    ),
    item(ui.chRatio, formatIndicator("chRatio", values.chRatio, lang), classes.chRatio ? copy.results.classes.chRatio[classes.chRatio].label : notApplicable, null),
    item(
      ui.economic,
      values.economicRatio === null ? notApplicable : interpolate(ui.ratio, { value: formatIndicator("economic", values.economicRatio, lang) }),
      classes.economic ? copy.results.classes.economic[classes.economic].label : notApplicable,
      indicatorEffect(drivers, "economics"),
    ),
  ]
}

function figures(result: QuickCheckComplete, t: MailTexts): ValueRow[] {
  const lang = t.locale
  const ui = t.quickCheck.ui.results.figures
  const { values, flags } = result
  const perYear = (value: number) => `${formatEur(value, lang)}${ui.perYear}`
  return [
    { label: ui.heatingDemandKwh, value: formatEnergy(values.heatingDemandKwh, lang, { perYear: true }) },
    { label: ui.coolingDemandKwh, value: formatEnergy(values.coolingDemandKwh, lang, { perYear: true }) },
    { label: ui.heatingSupplyKwh, value: formatEnergy(values.heatingSupplyKwh, lang, { perYear: true }) },
    { label: ui.coolingSupplyKwh, value: formatEnergy(values.coolingSupplyKwh, lang, { perYear: true }) },
    {
      label: ui.networkLengthM,
      value: formatQuantity(values.networkLengthM, "m", lang, { maximumFractionDigits: 0 }),
      ...(flags.estimatedNetworkLength && { note: t.mail.conversation.results.estimatedLength }),
    },
    { label: ui.overallInvestment, value: formatEur(values.overallInvestment, lang) },
    { label: ui.overallRevenue, value: perYear(values.overallRevenue) },
    { label: ui.annualCosts, value: perYear(values.annualCosts) },
  ]
}

/** The inputs the result used (D-33): what was entered, and what was estimated instead. */
export function inputRows(project: Project, t: MailTexts): ValueRow[] {
  const { results } = t.mail.conversation
  const copy = t.quickCheck
  const value = (id: string, raw: unknown) => formatFieldValue(id, raw, t)
  const shares = BUILDING_TYPES.flatMap((type) =>
    CONSTRUCTION_PERIODS.filter((period) => (project.buildings.shares[type][period] ?? 0) > 0).map((period) =>
      interpolate(results.shares, { type: copy.buildingTypes[type].label, period: copy.periods[period].label, share: value(`buildings.shares.${type}.${period}`, project.buildings.shares[type][period]) }),
    ),
  )
  const sources = SOURCES.filter((source) => project.sources.potentials[source]).map((source) =>
    interpolate(results.source, { source: copy.sources[source].label, potential: value(`sources.potentials.${source}`, project.sources.potentials[source]) }),
  )
  const manual = project.quickCheck.manualDemand
  const orEstimated = (id: string, raw: number | null) => (raw === null ? results.estimated : value(id, raw))
  const field = copy.fields
  return [
    { label: field.buildings.total.label, value: value("buildings.total", project.buildings.total) },
    { label: field.buildings.areaM2.label, value: value("buildings.areaM2", project.buildings.areaM2) },
    { label: field.buildings.shares.label, value: shares.join("; ") || results.notEntered },
    { label: field.sources.potentials.label, value: sources.join("; ") || results.notEntered },
    { label: field.sources.pv.label, value: value("sources.pv", project.sources.pv) },
    { label: field.quickCheck.manualDemand.heatingKwhPerYear.label, value: orEstimated("quickCheck.manualDemand.heatingKwhPerYear", manual.heatingKwhPerYear) },
    { label: field.quickCheck.manualDemand.coolingKwhPerYear.label, value: orEstimated("quickCheck.manualDemand.coolingKwhPerYear", manual.coolingKwhPerYear) },
    { label: field.quickCheck.networkLengthM.label, value: orEstimated("quickCheck.networkLengthM", project.quickCheck.networkLengthM) },
  ]
}

function driverRows(drivers: readonly Driver[], t: MailTexts): ValueRow[] {
  const ui = t.quickCheck.ui.results.drivers
  return drivers.map((driver) => ({ label: driverText(driver, t.quickCheck, t.locale), value: ui[driver.effect], ...(driver.effect === "limiting" && { tone: "hot" as const }) }))
}

/**
 * The Quick Check result by email (PLAN-AGENT-07 step 9), computed by `run(project)`, never by a
 * model (QCT-CALC-00): the overall result and why, the main factors, the indicators, key figures,
 * the inputs used, the screening disclaimer, and how each number is calculated with its EQ IDs.
 */
export function qcResultSections(result: QuickCheckComplete, project: Project, t: MailTexts, { docsUrl, updated }: { docsUrl: string; updated: boolean }): Section[] {
  const copy = t.quickCheck
  const { conversation } = t.mail
  const { results } = conversation
  const { assessment, drivers } = result
  const level = copy.results.levels[assessment.level]
  const driverList = [...drivers.supporting, ...drivers.limiting]
  const blocks: Block[] = [
    ...(updated ? [{ type: "text" as const, text: results.updated, tone: "strong" as const }] : []),
    { type: "text", text: results.lead, tone: "muted" },
    { type: "verdict", level: assessment.level, label: level.label, description: level.description, ...(assessment.forced && { badge: results.forced }) },
    { type: "text", text: results.reasons, tone: "strong" },
    { type: "bullets", items: assessment.reasons.map((reason) => reasonText(reason, copy, t.locale)) },
    { type: "rows", title: results.drivers, rows: driverList.length ? driverRows(driverList, t) : [{ label: results.none, value: "" }] },
    { type: "text", text: results.indicators, tone: "strong" },
    { type: "indicators", items: indicators(result, t) },
    { type: "rows", title: results.figures, rows: figures(result, t) },
    { type: "rows", title: results.inputs, rows: inputRows(project, t) },
    { type: "text", text: `${copy.ui.results.screening.title}. ${copy.ui.results.screening.body}`, tone: "muted" },
  ]
  return [
    { kicker: conversation.kicker.quickCheck, title: results.title, accent: "cool", blocks },
    calcNotesSection(result, t, docsUrl),
  ]
}
