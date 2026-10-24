import { applyPatch, type ProjectPatch } from "@/lib/project/apply-patch"
import { createProject } from "@/lib/project/create-project"
import type { Project } from "@/lib/project/schema/project"
import type { Locale } from "@/lib/i18n/locales"
import { resolveTexts } from "./resolve-texts"
import type { ExampleDefinition } from "./types"

/** Examples carry a fixed date: a localized example is the same project every time. */
export const EXAMPLE_DATE = new Date("2026-10-24T00:00:00.000Z")

/** Placeholder id; the store gives the copy a fresh one when the user picks the example. */
const EXAMPLE_ID = "00000000-0000-4000-8000-000000000000"

/** `{ "buildings.shares.residential.2011_today": 25, ... }` for the filled cells. */
function sharePatch(shares: ExampleDefinition["buildings"]["shares"]): ProjectPatch {
  const entries = Object.entries(shares).flatMap(([type, periods]) =>
    Object.entries(periods ?? {}).map(([period, value]) => [`buildings.shares.${type}.${period}`, value] as const),
  )
  return Object.fromEntries(entries)
}

function sourcePatch(sources: ExampleDefinition["sources"]): ProjectPatch {
  const entries = Object.entries(sources.potentials).map(([source, potential]) => [`sources.potentials.${source}`, potential] as const)
  return { ...Object.fromEntries(entries), "sources.pv": sources.pv }
}

/** Containers are not patchable (D-05): groups of texts go in field by field, item lists whole. */
function planPatch(plan: Record<string, unknown>): ProjectPatch {
  const entries = Object.entries(plan).flatMap(([key, value]) =>
    Array.isArray(value) || typeof value !== "object" || value === null
      ? [[`businessPlan.${key}`, value] as const]
      : Object.entries(value).map(([field, text]) => [`businessPlan.${key}.${field}`, text] as const),
  )
  return Object.fromEntries(entries)
}

/**
 * The example as a valid `Project` in one language (both modules on). Built through
 * `createProject` and an atomic `applyPatch` (D-05), so it can never drift from the schema.
 * The caller copies it when the user picks the example (`addCopy`, D-04).
 */
export function localizeExample(example: ExampleDefinition, lang: Locale): Project {
  const plan = resolveTexts(example.businessPlan, lang) as Record<string, unknown>
  const site = resolveTexts(example.site, lang) as Record<string, unknown>
  const patch: ProjectPatch = {
    "meta.name": resolveTexts(example.name, lang),
    ...Object.fromEntries(Object.entries(site).map(([key, value]) => [`site.${key}`, value])),
    "buildings.total": example.buildings.total,
    "buildings.areaM2": example.buildings.areaM2,
    ...sharePatch(example.buildings.shares),
    ...sourcePatch(example.sources),
    "quickCheck.networkLengthM": example.networkLengthM ?? null,
    "businessPlan.scenarioId": example.scenarioId,
    ...planPatch(plan),
  }
  const empty = createProject({
    modules: { quickCheck: true, businessPlan: true },
    id: EXAMPLE_ID,
    exampleId: example.id,
    now: EXAMPLE_DATE,
  })
  const result = applyPatch(empty, patch, { atomic: true, now: EXAMPLE_DATE })
  if (!result.ok) {
    throw new Error(`Example "${example.id}" (${lang}) is invalid: ${JSON.stringify(result.errors)}`)
  }
  return result.project
}
