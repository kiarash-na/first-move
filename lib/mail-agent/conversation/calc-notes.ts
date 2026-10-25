import "server-only"
import type { CalcNote, Section } from "@/emails/model"
import { interpolate } from "@/lib/i18n/interpolate"
import { lookup } from "@/lib/i18n/lookup"
import { explainResult, formulaNameKey, type ExplainedResult, type QuickCheckComplete } from "@/lib/quick-check"
import type { MailTexts } from "./texts"

/** The results whose calculation the email explains: the overall result and the numbers it rests on. */
const EXPLAINED = ["level", "heatingCoverage", "coolingCoverage", "buildingDensity", "networkLengthM", "heatDensityMwhPerM", "economicRatio"] as const satisfies readonly ExplainedResult[]

function title(key: (typeof EXPLAINED)[number], t: MailTexts): string {
  const ui = t.quickCheck.ui.results
  switch (key) {
    case "level":
      return ui.overall
    case "heatingCoverage":
      return t.mail.conversation.results.heatingCoverage
    case "coolingCoverage":
      return t.mail.conversation.results.coolingCoverage
    case "buildingDensity":
      return ui.indicators.buildingDensity
    case "networkLengthM":
      return ui.figures.networkLengthM
    case "heatDensityMwhPerM":
      return ui.indicators.heatDensity
    case "economicRatio":
      return ui.indicators.economic
  }
}

/**
 * "How we calculate" for the results in the email (D-33): per result its `calc` sentence and the
 * methodology equations it uses (EQ IDs and resolved OQ formulas, with their names), for the
 * flags of this run, so the list reproduces the numbers shown (manual inputs drop the estimates).
 */
export function calcNotes(result: QuickCheckComplete, t: MailTexts): CalcNote[] {
  return EXPLAINED.filter((key) => !(key === "coolingCoverage" && result.classes.coolingCoverage === null)).map((key) => {
    const explanation = explainResult(key, result.flags)
    return {
      title: title(key, t),
      text: lookup(t.calc, explanation.text) ?? "",
      formulas: explanation.formulas.map((id) => `${id} ${lookup(t.calc, formulaNameKey(id)) ?? ""}`.trim()),
    }
  })
}

/** The notes as their own section, with the link to every equation in the docs. */
export function calcNotesSection(result: QuickCheckComplete, t: MailTexts, docsUrl: string): Section {
  const { results } = t.mail.conversation
  return {
    kicker: t.mail.conversation.kicker.quickCheck,
    title: t.calc.ui.title,
    accent: "ink",
    blocks: [
      { type: "text", text: interpolate(results.notesLead, { link: docsUrl }), tone: "muted" },
      { type: "notes", items: calcNotes(result, t) },
    ],
  }
}
