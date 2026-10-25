// @vitest-environment node
import { describe, expect, it } from "vitest"
import { referenceOf } from "@/lib/docs/references"
import { LOCALES } from "@/lib/i18n/locales"
import { inputStatus, migrateProject, projectSchema } from "@/lib/project"
import { run } from "@/lib/quick-check"
import { EXAMPLES, getExample } from "../index"
import { localizeExample } from "../localize"
import { isLocalized } from "../resolve-texts"
import type { Localized } from "../types"
import {
  FICTIONAL_DISCLAIMER,
  REFERENCE_CASE_CATALOG,
  REFERENCE_CASES,
  REFERENCE_KINDS,
  REFERENCE_TIERS,
  getReferenceCase,
  referenceCaseSourceOf,
  type ReferenceCase,
} from "./index"

/** Every `Localized` text in a value, with its path. */
function texts(value: unknown, path = ""): [string, Localized][] {
  if (isLocalized(value)) return [[path, value]]
  if (Array.isArray(value)) return value.flatMap((entry, index) => texts(entry, `${path}.${index}`))
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, entry]) => texts(entry, path ? `${path}.${key}` : key))
  }
  return []
}

/** The Business Plan texts of a case that are left empty. */
const emptyTexts = (entry: ReferenceCase) => texts(entry.businessPlan).filter(([, value]) => value.en.trim() === "")

const MARKERS = {
  fictional: { en: "(illustrative)", de: "(illustrativ)" },
  real: { en: "(proposed)", de: "(vorgeschlagen)" },
} as const

describe("the reference cases (D-76)", () => {
  it("are the six cases of the catalog, in its order, each spreading its card", () => {
    expect(REFERENCE_CASES.map((entry) => entry.id)).toEqual(REFERENCE_CASE_CATALOG.map((card) => card.id))
    REFERENCE_CASES.forEach((entry, index) => expect(entry).toMatchObject(REFERENCE_CASE_CATALOG[index]))
  })

  it("have unique ids that are valid example ids and do not clash with the examples", () => {
    const ids = REFERENCE_CASES.map((entry) => entry.id)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]{1,64}$/)
    expect(new Set([...ids, ...EXAMPLES.map((example) => example.id)]).size).toBe(ids.length + EXAMPLES.length)
  })

  it("hold exactly one weak, one middling and one strong plan per group", () => {
    for (const kind of REFERENCE_KINDS) {
      const tiers = REFERENCE_CASES.filter((entry) => entry.kind === kind).map((entry) => entry.tier)
      expect([...tiers].sort()).toEqual([...REFERENCE_TIERS].sort())
    }
  })

  it("are found by getReferenceCase and by getExample, so they load like the examples", () => {
    for (const entry of REFERENCE_CASES) {
      expect(getReferenceCase(entry.id)).toBe(entry)
      expect(getExample(entry.id)).toBe(entry)
    }
    expect(getReferenceCase("housing-cooperatives")).toBeUndefined()
  })

  it("cite only checked sources, each at most once, and every case source is cited", () => {
    for (const entry of REFERENCE_CASES) {
      expect(entry.references.length, entry.id).toBeGreaterThanOrEqual(4)
      expect(new Set(entry.references).size, entry.id).toBe(entry.references.length)
      for (const id of entry.references) expect(referenceCaseSourceOf(id) ?? referenceOf(id), `${entry.id}: ${id}`).toBeDefined()
    }
  })

  it("give German text for every English text, so neither language falls back", () => {
    for (const entry of REFERENCE_CASES) {
      const missing = texts(entry)
        .filter(([, value]) => value.en.trim() !== "" && (value.de === undefined || value.de.trim() === ""))
        .map(([path]) => path)
      expect(missing, entry.id).toEqual([])
    }
  })

  it("fill every Business Plan text in the strong and middling plans, and leave some empty in the weak ones", () => {
    for (const entry of REFERENCE_CASES) {
      if (entry.tier === "weak") expect(emptyTexts(entry).length, entry.id).toBeGreaterThan(0)
      else expect(emptyTexts(entry), entry.id).toEqual([])
    }
  })

  it("make each weak plan thinner than the stronger ones of its group", () => {
    const filled = (entry: ReferenceCase) => texts(entry.businessPlan).filter(([, value]) => value.en.trim() !== "")
    const length = (entry: ReferenceCase) => filled(entry).reduce((sum, [, value]) => sum + value.en.length, 0)
    for (const kind of REFERENCE_KINDS) {
      const group = REFERENCE_CASES.filter((entry) => entry.kind === kind)
      const [strong, middling, weak] = [...REFERENCE_TIERS].reverse().map((tier) => group.find((entry) => entry.tier === tier)!)
      expect(length(strong), kind).toBeGreaterThan(length(middling))
      expect(length(middling), kind).toBeGreaterThan(length(weak))
      expect(filled(weak).length, kind).toBeLessThan(filled(middling).length)
    }
  })

  it("name exactly one deal-breaker and give the strong plans a quantified decision gate", () => {
    for (const entry of REFERENCE_CASES) {
      expect(entry.businessPlan.risks.filter((risk) => risk.dealBreaker), entry.id).toHaveLength(1)
      if (entry.tier !== "strong") continue
      expect(entry.businessPlan.criticalAssumptions.length, entry.id).toBeGreaterThanOrEqual(3)
      expect(entry.businessPlan.risks.length, entry.id).toBeGreaterThanOrEqual(3)
      expect(entry.businessPlan.nextSteps.decisions.en, entry.id).toMatch(/\d/)
    }
  })

  it("mark invented details of fictional plans as illustrative and proposals of the strong real plan as proposed", () => {
    for (const entry of REFERENCE_CASES) {
      const all = texts(entry)
      for (const lang of LOCALES) {
        const marker = MARKERS[entry.kind][lang]
        const marked = all.filter(([, value]) => (value[lang] ?? "").includes(marker))
        if (entry.kind === "fictional") expect(marked.length, `${entry.id} ${lang}`).toBeGreaterThan(entry.tier === "weak" ? 0 : 5)
        if (entry.kind === "real" && entry.tier === "strong") expect(marked.length, `${entry.id} ${lang}`).toBeGreaterThan(3)
      }
      if (entry.kind === "real") expect(all.filter(([, value]) => value.en.includes(MARKERS.fictional.en)), entry.id).toEqual([])
    }
  })

  it("keep their names usable as docs headings, so a card can link to its section", () => {
    for (const entry of REFERENCE_CASES) {
      for (const lang of LOCALES) expect(entry.name[lang] ?? entry.name.en).toMatch(/^[\p{L}\p{N} ,:?()'.-]+$/u)
    }
  })
})

describe.each(REFERENCE_CASES.map((entry) => [entry.id, entry] as const))("reference case %s", (id, entry) => {
  describe.each(LOCALES)("localized to %s", (lang) => {
    const project = localizeExample(entry, lang)

    it("is a valid project that survives the import path (JSON round trip and migration)", () => {
      expect(projectSchema.safeParse(project).success).toBe(true)
      const imported = migrateProject(JSON.parse(JSON.stringify(project)))
      expect(imported.ok).toBe(true)
    })

    it("has both modules on and carries its id as the example id", () => {
      expect(project.meta.modules).toEqual({ quickCheck: true, businessPlan: true })
      expect(project.meta.exampleId).toBe(id)
      expect(project.meta.name).toBe(entry.name[lang] ?? entry.name.en)
    })

    it("has every Quick Check input, and the Quick Check computes a result", () => {
      expect(inputStatus(project, "quickCheck")).toMatchObject({ complete: true, missing: [] })
      const result = run(project)
      expect(result.status).toBe("complete")
    })

    it.runIf(entry.kind === "fictional")("says in its first sentence on the site step that it is fictional", () => {
      expect(project.site.ownership.startsWith(FICTIONAL_DISCLAIMER[lang]!)).toBe(true)
      expect(project.meta.name).toMatch(lang === "de" ? /fiktiv/ : /fictional/)
      expect(project.site.name).toMatch(lang === "de" ? /fiktiver Plan/ : /fictional plan/)
    })
  })

  it("has the same Quick Check inputs in both languages and is deterministic", () => {
    const [en, de] = LOCALES.map((lang) => localizeExample(entry, lang))
    expect(de.buildings).toEqual(en.buildings)
    expect(de.sources).toEqual(en.sources)
    expect(de.quickCheck).toEqual(en.quickCheck)
    expect(localizeExample(entry, "en")).toEqual(en)
  })
})
