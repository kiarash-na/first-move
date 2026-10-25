import type { Locale } from "./locales"

/**
 * Dictionary loaders, one JSON file per area and locale (PLAN-DASH-00).
 * EN is the source of truth for keys and types; DE may be partial (D-32).
 * Load through `getDictionary` on the server, never import JSON in client code.
 */
export const AREAS = [
  "common",
  "landing",
  "start",
  "shell",
  "overview",
  "quick-check",
  "business-plan",
  "assumptions",
  "calc",
  "legal",
  "terms",
  "privacy",
  "cookies",
  "imprint",
  "ai",
  "license",
  "assistant",
  "mail",
  "docs",
  "report",
  "ai-score",
] as const

export type Area = (typeof AREAS)[number]

type Loader = () => Promise<unknown>

const en = {
  common: () => import("@/dictionaries/en/common.json").then((m) => m.default),
  landing: () => import("@/dictionaries/en/landing.json").then((m) => m.default),
  start: () => import("@/dictionaries/en/start.json").then((m) => m.default),
  shell: () => import("@/dictionaries/en/shell.json").then((m) => m.default),
  overview: () => import("@/dictionaries/en/overview.json").then((m) => m.default),
  "quick-check": () => import("@/dictionaries/en/quick-check.json").then((m) => m.default),
  "business-plan": () => import("@/dictionaries/en/business-plan.json").then((m) => m.default),
  assumptions: () => import("@/dictionaries/en/assumptions.json").then((m) => m.default),
  calc: () => import("@/dictionaries/en/calc.json").then((m) => m.default),
  legal: () => import("@/dictionaries/en/legal.json").then((m) => m.default),
  terms: () => import("@/dictionaries/en/terms.json").then((m) => m.default),
  privacy: () => import("@/dictionaries/en/privacy.json").then((m) => m.default),
  cookies: () => import("@/dictionaries/en/cookies.json").then((m) => m.default),
  imprint: () => import("@/dictionaries/en/imprint.json").then((m) => m.default),
  ai: () => import("@/dictionaries/en/ai.json").then((m) => m.default),
  license: () => import("@/dictionaries/en/license.json").then((m) => m.default),
  assistant: () => import("@/dictionaries/en/assistant.json").then((m) => m.default),
  mail: () => import("@/dictionaries/en/mail.json").then((m) => m.default),
  docs: () => import("@/dictionaries/en/docs.json").then((m) => m.default),
  report: () => import("@/dictionaries/en/report.json").then((m) => m.default),
  "ai-score": () => import("@/dictionaries/en/ai-score.json").then((m) => m.default),
}

const de: Record<Area, Loader> = {
  common: () => import("@/dictionaries/de/common.json").then((m) => m.default),
  landing: () => import("@/dictionaries/de/landing.json").then((m) => m.default),
  start: () => import("@/dictionaries/de/start.json").then((m) => m.default),
  shell: () => import("@/dictionaries/de/shell.json").then((m) => m.default),
  overview: () => import("@/dictionaries/de/overview.json").then((m) => m.default),
  "quick-check": () => import("@/dictionaries/de/quick-check.json").then((m) => m.default),
  "business-plan": () => import("@/dictionaries/de/business-plan.json").then((m) => m.default),
  assumptions: () => import("@/dictionaries/de/assumptions.json").then((m) => m.default),
  calc: () => import("@/dictionaries/de/calc.json").then((m) => m.default),
  legal: () => import("@/dictionaries/de/legal.json").then((m) => m.default),
  terms: () => import("@/dictionaries/de/terms.json").then((m) => m.default),
  privacy: () => import("@/dictionaries/de/privacy.json").then((m) => m.default),
  cookies: () => import("@/dictionaries/de/cookies.json").then((m) => m.default),
  imprint: () => import("@/dictionaries/de/imprint.json").then((m) => m.default),
  ai: () => import("@/dictionaries/de/ai.json").then((m) => m.default),
  license: () => import("@/dictionaries/de/license.json").then((m) => m.default),
  assistant: () => import("@/dictionaries/de/assistant.json").then((m) => m.default),
  mail: () => import("@/dictionaries/de/mail.json").then((m) => m.default),
  docs: () => import("@/dictionaries/de/docs.json").then((m) => m.default),
  report: () => import("@/dictionaries/de/report.json").then((m) => m.default),
  "ai-score": () => import("@/dictionaries/de/ai-score.json").then((m) => m.default),
}

/** The typed shape of one area, taken from the EN file. */
export type Dictionary<A extends Area> = Awaited<ReturnType<(typeof en)[A]>>

/** `Record<Locale, …>` makes both locales list every area; `en` keeps its JSON types. */
export const dictionaryLoaders: Record<Locale, Record<Area, Loader>> & { en: typeof en } = { en, de }
