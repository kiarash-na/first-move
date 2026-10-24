// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import deCopy from "@/dictionaries/de/docs.json"
import enCopy from "@/dictionaries/en/docs.json"
import { redactSecrets } from "@/lib/ai/text/redact"
import { DASHBOARD_ROUTES, dashboardHref } from "@/lib/dashboard/routes"
import { headingId } from "@/lib/docs/heading-id"
import { AI_DOC_SLUGS, DOC_SLUGS, isDocSlug, type DocSlug } from "@/lib/docs/pages"
import { isLegalSlug } from "@/lib/legal/docs"
import { OPERATOR } from "@/lib/legal/operator"
import {
  BUILDING_DENSITY_RULE,
  CH_RATIO_RULE,
  COVERAGE_RULE,
  ECONOMIC_RULE,
  HEAT_DENSITY_RULE,
} from "@/lib/quick-check/classify/rules.config"
import { TBL_10, TBL_4, TBL_5, TBL_6, TBL_7, TBL_8, TBL_9 } from "@/lib/quick-check/reference"

/**
 * Guards the public docs (PLAN-AGENT-04, D-57) in both languages: both agents answer from these
 * pages, so they must hold no internal paths, environment names, secrets or internal ids, link
 * only to the site's own pages, use only the Markdown the docs route renders, and state the
 * methodology's numbers exactly as the engine uses them. The German pages follow the English
 * ones section by section (D-32).
 */

const ROOT = path.resolve(__dirname, "../..")
const LANGS = ["en", "de"] as const
type Lang = (typeof LANGS)[number]
const COPY = { en: enCopy, de: deCopy }

const source = (slug: DocSlug, lang: Lang = "en") => readFileSync(path.join(ROOT, "content/docs", lang, `${slug}.mdx`), "utf8")
const PAGES = LANGS.flatMap((lang) => DOC_SLUGS.map((slug) => ({ lang, slug, text: source(slug, lang) })))

const headings = (text: string) => [...text.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim())
const anchors = (slug: DocSlug, lang: Lang = "en") => headings(source(slug, lang)).map(headingId)
const links = (text: string) => [...text.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)].map((match) => ({ label: match[1], href: match[2], index: match.index }))

/** The `#…` section ids of a legal page, from its dictionary (the same in every language). */
const legalSections = (slug: string) =>
  (JSON.parse(readFileSync(path.join(ROOT, "dictionaries/en", `${slug}.json`), "utf8")) as { sections: { id: string }[] }).sections.map(
    (section) => section.id,
  )

/** Site paths without a language: `/dashboard`, `/dashboard/quick-check/area`, … */
const DASHBOARD_PATHS = new Set(DASHBOARD_ROUTES.map((route) => dashboardHref("en", route).replace(/^\/en/, "")))

/** Character offsets covered by `<AiOnly>…</AiOnly>` blocks. */
function aiOnlyRanges(text: string): [number, number][] {
  return [...text.matchAll(/<AiOnly>[\s\S]*?<\/AiOnly>/g)].map((match) => [match.index, match.index + match[0].length])
}

/** The docs page a link points to, or null for any other target. */
function docsTarget(slug: DocSlug, pathname: string): DocSlug | null {
  if (pathname === "") return slug
  const target = pathname === "/docs" ? "index" : pathname.startsWith("/docs/") ? pathname.slice("/docs/".length) : null
  return isDocSlug(target) ? target : null
}

/** Why a link target is not one of the site's pages or sections, or null when it is. */
function brokenTarget(slug: DocSlug, href: string, lang: Lang = "en"): string | null {
  const [pathname, anchor] = href.split("#")
  if (pathname === "") return anchors(slug, lang).includes(anchor) ? null : `no heading #${anchor} on this page`
  if (!pathname.startsWith("/") || pathname.startsWith("//")) return "not a site path"
  if (pathname === "/docs" || pathname.startsWith("/docs/")) {
    const target = docsTarget(slug, pathname)
    if (!target) return "no such docs page"
    return anchor === undefined || anchors(target, lang).includes(anchor) ? null : `no heading #${anchor} on ${target}`
  }
  if (DASHBOARD_PATHS.has(pathname)) return anchor === undefined ? null : "dashboard pages have no anchors"
  const legal = pathname.slice(1)
  if (isLegalSlug(legal)) return anchor === undefined || legalSections(legal).includes(anchor) ? null : `no section #${anchor} on ${legal}`
  return "not a page of the site"
}

/**
 * The German target of an English link: the same path, and an anchor on a docs page moved to the
 * German heading at the same position. Legal section ids are the same in both languages.
 */
function germanTarget(slug: DocSlug, href: string): string {
  const [pathname, anchor] = href.split("#")
  const target = docsTarget(slug, pathname)
  if (anchor === undefined || !target) return href
  return `${pathname}#${anchors(target, "de")[anchors(target, "en").indexOf(anchor)]}`
}

/** The block structure of a page: heading levels, list items, `<AiOnly>` tags, text and blank lines. */
const outline = (text: string) =>
  text.split("\n").map((line) => /^#+ |^- |^\d+\. |^<\/?AiOnly>$/.exec(line)?.[0].trim() ?? (line.trim() === "" ? "" : "text"))

describe("public docs content (PLAN-AGENT-04)", () => {
  it.each(LANGS)("has exactly one %s file per docs page (D-32)", (lang) => {
    const files = readdirSync(path.join(ROOT, "content/docs", lang)).filter((file) => file.endsWith(".mdx"))
    expect(files.sort()).toEqual(DOC_SLUGS.map((slug) => `${slug}.mdx`).sort())
  })

  it.each(PAGES)("$lang/$slug starts with its title, the one level-1 heading", ({ lang, slug, text }) => {
    expect(text.split("\n")[0]).toBe(`# ${COPY[lang].pages[slug].title}`)
    expect(text.match(/^#\s/gm)).toHaveLength(1)
  })

  it.each(PAGES)("$lang/$slug uses only the Markdown the docs route renders", ({ text }) => {
    expect(text, "frontmatter").not.toMatch(/^---/)
    expect(text, "import or export").not.toMatch(/^(import|export)\s/m)
    expect(text, "code fence").not.toContain("```")
    expect(text, "level-3 heading (the index splits at ##)").not.toMatch(/^#{3,}\s/m)
    expect(text, "table").not.toMatch(/^\s*\|/m)
    expect(text, "image").not.toContain("![")
    expect(text, "MDX expression").not.toMatch(/[{}]/)
    expect(text, "HTML comment").not.toContain("<!--")
    expect(text, "underscore (emphasis in the index)").not.toContain("_")
    const tags = [...text.matchAll(/<\/?[A-Za-z][^>]*>/g)].map((match) => match[0])
    expect(tags.filter((tag) => tag !== "<AiOnly>" && tag !== "</AiOnly>")).toEqual([])
  })

  it.each(PAGES)("$lang/$slug has plain, unique section headings", ({ text }) => {
    const list = headings(text)
    expect(list.length).toBeGreaterThan(2)
    for (const heading of list) expect(heading, heading).toMatch(/^[\p{L}\p{N} ,:?()'.-]+$/u)
    const ids = list.map(headingId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(PAGES)("$lang/$slug links only to pages and sections of the site", ({ lang, slug, text }) => {
    for (const { href } of links(text)) expect(brokenTarget(slug, href, lang), href).toBeNull()
  })

  it("rejects targets outside the site in the link check", () => {
    expect(brokenTarget("index", "https://example.org")).toBe("not a site path")
    expect(brokenTarget("index", "/docs/missing")).toBe("no such docs page")
    expect(brokenTarget("index", "/docs/quick-check#missing")).toBe("no heading #missing on quick-check")
    expect(brokenTarget("index", "/privacy#missing")).toBe("no section #missing on privacy")
    expect(brokenTarget("index", "/somewhere")).toBe("not a page of the site")
    expect(brokenTarget("quick-check", "#supply")).toBeNull()
  })

  it("checks German anchors against the German headings", () => {
    expect(brokenTarget("quick-check", "#angebot", "de")).toBeNull()
    expect(brokenTarget("quick-check", "#supply", "de")).toBe("no heading #supply on this page")
    expect(brokenTarget("index", "/docs/quick-check#supply", "de")).toBe("no heading #supply on quick-check")
    expect(brokenTarget("index", "/privacy#retention", "de")).toBeNull()
    expect(germanTarget("quick-check", "#supply")).toBe("#angebot")
    expect(germanTarget("index", "/docs/quick-check#supply")).toBe("/docs/quick-check#angebot")
    expect(germanTarget("email-agent", "/privacy#email-tracking")).toBe("/privacy#email-tracking")
  })

  it("links to the AI pages only from the AI pages or inside <AiOnly>, so no link breaks while they are off", () => {
    for (const { lang, slug, text } of PAGES) {
      if (AI_DOC_SLUGS.includes(slug)) continue
      const ranges = aiOnlyRanges(text)
      for (const { href, index } of links(text)) {
        const target = href.split("#")[0].replace(/^\/docs\//, "")
        if (!AI_DOC_SLUGS.includes(target as DocSlug)) continue
        expect(ranges.some(([start, end]) => index > start && index < end), `${lang}/${slug}: ${href}`).toBe(true)
      }
    }
  })

  it.each(DOC_SLUGS)("de/%s follows the English page: the same sections, lists, <AiOnly> blocks and links", (slug) => {
    const [en, de] = [source(slug, "en"), source(slug, "de")]
    expect(outline(de)).toEqual(outline(en))
    expect(headings(de)).toHaveLength(headings(en).length)
    expect(links(de).map((link) => link.href)).toEqual(links(en).map((link) => germanTarget(slug, link.href)))
    expect(de.match(/`[^`]+`/g)).toEqual(en.match(/`[^`]+`/g))
    expect(de.match(/\*\*/g)?.length).toBe(en.match(/\*\*/g)?.length)
  })

  it.each(PAGES)("$lang/$slug holds no internal paths, environment names, secrets or internal ids", ({ text }) => {
    expect(text, "internal docs").not.toMatch(/\bdocs\/(?:\d|_)|90_work|00_originals|_reference|open-questions|CLAUDE\.md|CONTEXT\.md/)
    expect(text, "repository path").not.toMatch(/\b(?:lib|app|components|scripts|dictionaries|content|e2e|workflows|emails|node_modules|public)\/[\w[\]().-]/)
    expect(text, "source file").not.toMatch(/\b[\w-]+\.(?:ts|tsx|mts|mjs|cjs|js|ya?ml)\b/)
    expect(text, "environment").not.toMatch(/\.env\b|process\.env|\b[A-Z][A-Z0-9]*_[A-Z0-9_]+\b/)
    expect(redactSecrets(text), "secret-looking string").toBe(text)
    expect(text, "decision, plan or requirement id").not.toMatch(/\b(?:D|R)-\d{2}\b|\b(?:PLAN|NOTE|QCT|ALG|SHARED)-/)
    expect(text, "web address").not.toMatch(/https?:\/\/|\bwww\.|localhost|vercel\.app/)
    expect(text, "placeholder").not.toMatch(/\b(?:TODO|TBD|FIXME|lorem)\b/i)
    for (const [address] of text.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g)) {
      expect([OPERATOR.emailAgent, OPERATOR.emailHuman], address).toContain(address)
    }
  })

  it.each(PAGES)("$lang/$slug has no invisible or control characters", ({ text }) => {
    expect(text).not.toMatch(/[\p{Cf}\p{Co}\p{Zl}\p{Zp}]|(?![\n\t])\p{Cc}|(?! )\p{Zs}/u)
  })
})

describe("Quick Check numbers in the docs match the engine", () => {
  const page = source("quick-check")
  const thousands = (value: number) => value.toLocaleString("en-US")
  const decimal = (value: number) => value.toFixed(1)

  it("states the default capacities and COPs of TBL-4 and TBL-5", () => {
    for (const [key, heating] of Object.entries(TBL_4.rows)) {
      const cooling = TBL_5.rows[key as keyof typeof TBL_5.rows]
      const heat = `heating ${thousands(heating.low)}, ${thousands(heating.medium)} and ${thousands(heating.high)} kWh/a, ${
        heating.cop === null ? "without heat pump" : `COP ${decimal(heating.cop)}`
      }`
      const cool =
        cooling.low === null || cooling.medium === null || cooling.high === null || cooling.cop === null
          ? "no cooling"
          : `cooling ${thousands(cooling.low)}, ${thousands(cooling.medium)} and ${thousands(cooling.high)} kWh/a, COP ${decimal(cooling.cop)}`
      expect(page).toContain(`- **${heating.label}**: ${heat}; ${cool}.`)
    }
  })

  it("states the economic parameters of TBL-6", () => {
    const raw = (key: string) => TBL_6.parameters.find((parameter) => parameter.key === key)!.raw
    const installation = (key: string) => (raw(key) === "-" ? "none, used as 0" : `${raw(key)} €`)
    const lines = [
      `- Heating base price: ${raw("heating_base_price")} €/m² per year`,
      `- Heating energy price: ${raw("heating_energy_price")} €/kWh`,
      `- Cooling base price: ${raw("cooling_base_price")} €/m² per year`,
      `- Cooling energy price: ${raw("cooling_energy_price")} €/kWh`,
      `- Connection fee: ${thousands(Number(raw("connection_fee")))} € per building`,
      `- Network construction costs, for pipes, materials, excavation and installation: ${raw("network_construction_costs")} €/m`,
      `- Installation costs per kWh/a of heating supply: geothermal ${installation("installation_costs_geothermal")}, waste heat ${installation(
        "installation_costs_waste_heat",
      )}, ground water ${installation("installation_costs_ground_water")}, surface water ${installation(
        "installation_costs_surface_water",
      )}, solar thermal ${installation("installation_costs_solar_thermal")}, ambient air ${installation("installation_costs_ambient_air")}`,
      `- Heat pump: ${raw("heat_pump")} € per building`,
      `- Electricity cost: ${raw("electricity_cost")} €/kWh`,
      `- PV cost reduction: ${raw("pv_cost_reduction")} %`,
      `- Depreciation period: ${raw("depreciation_period")} years`,
      `- Interest rate: ${raw("interest_rate")} %`,
    ]
    for (const line of lines) expect(page).toContain(line)
  })

  it("states the classes of TBL-7 to TBL-10 with the boundaries of the engine (OQ-20)", () => {
    const percent = (value: number) => Math.round(value * 100)
    const [feasible, conditional, limited] = COVERAGE_RULE.bands
    const coverage = TBL_7.classes.map((entry) => entry.interpretation)
    expect(page).toContain(`- **Feasible**: ${percent(feasible.min)} % or more. ${coverage[0]}`)
    expect(page).toContain(`- **Conditionally feasible**: from ${percent(conditional.min)} % to below ${percent(feasible.min)} %. ${coverage[1]}`)
    expect(page).toContain(`- **Limited feasibility**: from ${percent(limited.min)} % to below ${percent(conditional.min)} %. ${coverage[2]}`)
    expect(page).toContain(`- **Not feasible as the sole supply concept**: below ${percent(limited.min)} %. ${coverage[3]}`)

    for (const [rule, table, unit] of [
      [BUILDING_DENSITY_RULE, TBL_8, "buildings/ha"],
      [HEAT_DENSITY_RULE, TBL_9, "MWh/m"],
    ] as const) {
      const [high, medium] = rule.bands
      expect(high.inclusive).toBe(false)
      expect(medium.inclusive).toBe(true)
      const [highText, mediumText, lowText] = table.classes.map((entry) => entry.interpretation)
      expect(page).toContain(`- **High density**: above ${high.min} ${unit}. ${highText}`)
      expect(page).toContain(`- **Medium density**: from ${medium.min} to ${high.min} ${unit}. ${mediumText}`)
      expect(page).toContain(`- **Low density**: below ${medium.min} ${unit}. ${lowText}`)
    }

    const [balanced, partial] = CH_RATIO_RULE.bands
    const ratio = TBL_10.classes.map((entry) => entry.interpretation)
    expect(page).toContain(`- **Balanced**: ${balanced.min} or more. ${ratio[0]}`)
    expect(page).toContain(`- **Partially balanced**: from ${partial.min} to below ${balanced.min}. ${ratio[1]}`)
    expect(page).toContain(`- **Unbalanced**: below ${partial.min}. ${ratio[2]}`)
  })

  it("states the economic thresholds of OQ-21", () => {
    const [favorable, unclear] = ECONOMIC_RULE.bands
    expect(page).toContain(`- **Favorable**: E is ${decimal(favorable.min)} or more.`)
    expect(page).toContain(`- **Unclear**: E is ${unclear.min} or more, but below ${decimal(favorable.min)}.`)
    expect(page).toContain(`- **Clearly unfavorable**: E is below ${unclear.min}.`)
  })
})

/**
 * The same numbers on the German page, in German number format (1.000 and 4,5). The meaning of a
 * class is quoted as the German results show it, once `dictionaries/de/quick-check.json` has it.
 */
describe("Quick Check numbers in the German docs match the engine", () => {
  const page = source("quick-check", "de")
  const results = (
    JSON.parse(readFileSync(path.join(ROOT, "dictionaries/de/quick-check.json"), "utf8")) as {
      results?: { classes?: Record<string, Record<string, { interpretation?: string } | undefined> | undefined> }
    }
  ).results
  /** The German interpretation of a class in the results, or "" while German has none. */
  const meaning = (indicator: string, key: string) => results?.classes?.[indicator]?.[key]?.interpretation ?? ""
  const thousands = (value: number) => value.toLocaleString("de-DE")
  const decimal = (value: number) => value.toFixed(1).replace(".", ",")
  const number = (value: number) => value.toLocaleString("de-DE")
  /** A table value as written in the methodology (`15,000`, `0.20`), in German format. */
  const german = (raw: string) => raw.replace(/[.,]/g, (mark) => (mark === "." ? "," : "."))
  const SOURCES: Record<keyof typeof TBL_4.rows, string> = {
    geothermal: "Geothermie",
    waste_heat: "Abwärme",
    ground_water: "Grundwasser",
    surface_water: "Oberflächenwasser",
    solar_thermal: "Solarthermie",
    ambient_air: "Umgebungsluft",
  }

  it("states the default capacities and COPs of TBL-4 and TBL-5", () => {
    expect(Object.keys(SOURCES)).toEqual(Object.keys(TBL_4.rows))
    for (const [key, heating] of Object.entries(TBL_4.rows)) {
      const cooling = TBL_5.rows[key as keyof typeof TBL_5.rows]
      const heat = `Wärme ${thousands(heating.low)}, ${thousands(heating.medium)} und ${thousands(heating.high)} kWh/a, ${
        heating.cop === null ? "ohne Wärmepumpe" : `COP ${decimal(heating.cop)}`
      }`
      const cool =
        cooling.low === null || cooling.medium === null || cooling.high === null || cooling.cop === null
          ? "keine Kälte"
          : `Kälte ${thousands(cooling.low)}, ${thousands(cooling.medium)} und ${thousands(cooling.high)} kWh/a, COP ${decimal(cooling.cop)}`
      expect(page).toContain(`- **${SOURCES[key as keyof typeof SOURCES]}**: ${heat}; ${cool}.`)
    }
  })

  it("states the economic parameters of TBL-6", () => {
    const raw = (key: string) => TBL_6.parameters.find((parameter) => parameter.key === key)!.raw
    const installation = (key: string) => (raw(key) === "-" ? "keine, verwendet als 0" : `${german(raw(key))} €`)
    const lines = [
      `- Grundpreis Wärme: ${german(raw("heating_base_price"))} €/m² pro Jahr`,
      `- Arbeitspreis Wärme: ${german(raw("heating_energy_price"))} €/kWh`,
      `- Grundpreis Kälte: ${german(raw("cooling_base_price"))} €/m² pro Jahr`,
      `- Arbeitspreis Kälte: ${german(raw("cooling_energy_price"))} €/kWh`,
      `- Anschlussgebühr: ${thousands(Number(raw("connection_fee")))} € pro Gebäude`,
      `- Netzbaukosten, für Rohre, Material, Erdarbeiten und Montage: ${german(raw("network_construction_costs"))} €/m`,
      `- Installationskosten pro kWh/a Wärmeangebot: ${SOURCES.geothermal} ${installation("installation_costs_geothermal")}, ${
        SOURCES.waste_heat
      } ${installation("installation_costs_waste_heat")}, ${SOURCES.ground_water} ${installation("installation_costs_ground_water")}, ${
        SOURCES.surface_water
      } ${installation("installation_costs_surface_water")}, ${SOURCES.solar_thermal} ${installation("installation_costs_solar_thermal")}, ${
        SOURCES.ambient_air
      } ${installation("installation_costs_ambient_air")}`,
      `- Wärmepumpe: ${german(raw("heat_pump"))} € pro Gebäude`,
      `- Strompreis: ${german(raw("electricity_cost"))} €/kWh`,
      `- PV-Kostenreduktion: ${german(raw("pv_cost_reduction"))} %`,
      `- Abschreibungsdauer: ${german(raw("depreciation_period"))} Jahre`,
      `- Zinssatz: ${german(raw("interest_rate"))} %`,
    ]
    for (const line of lines) expect(page).toContain(line)
  })

  it("states the classes of TBL-7 to TBL-10 with the boundaries of the engine (OQ-20)", () => {
    const percent = (value: number) => Math.round(value * 100)
    const [feasible, conditional, limited] = COVERAGE_RULE.bands
    const coverage = (key: string) => meaning("coverage", key)
    expect(page).toContain(`- **Machbar**: ${percent(feasible.min)} % oder mehr. ${coverage("feasible")}`)
    expect(page).toContain(`- **Bedingt machbar**: von ${percent(conditional.min)} % bis unter ${percent(feasible.min)} %. ${coverage("conditionally_feasible")}`)
    expect(page).toContain(`- **Eingeschränkt machbar**: von ${percent(limited.min)} % bis unter ${percent(conditional.min)} %. ${coverage("limited_feasibility")}`)
    expect(page).toContain(`- **Als alleiniges Versorgungskonzept nicht machbar**: unter ${percent(limited.min)} %. ${coverage("not_feasible")}`)

    for (const [rule, indicator, unit] of [
      [BUILDING_DENSITY_RULE, "buildingDensity", "Gebäude/ha"],
      [HEAT_DENSITY_RULE, "heatDensity", "MWh/m"],
    ] as const) {
      const [high, medium] = rule.bands
      expect(page).toContain(`- **Hohe Dichte**: über ${number(high.min)} ${unit}. ${meaning(indicator, "high")}`)
      expect(page).toContain(`- **Mittlere Dichte**: von ${number(medium.min)} bis ${number(high.min)} ${unit}. ${meaning(indicator, "medium")}`)
      expect(page).toContain(`- **Geringe Dichte**: unter ${number(medium.min)} ${unit}. ${meaning(indicator, "low")}`)
    }

    const [balanced, partial] = CH_RATIO_RULE.bands
    const ratio = (key: string) => meaning("chRatio", key)
    expect(page).toContain(`- **Ausgeglichen**: ${number(balanced.min)} oder mehr. ${ratio("balanced")}`)
    expect(page).toContain(`- **Teilweise ausgeglichen**: von ${number(partial.min)} bis unter ${number(balanced.min)}. ${ratio("partially_balanced")}`)
    expect(page).toContain(`- **Unausgeglichen**: unter ${number(partial.min)}. ${ratio("unbalanced")}`)
  })

  it("states the economic thresholds of OQ-21", () => {
    const [favorable, unclear] = ECONOMIC_RULE.bands
    const economic = (key: string) => meaning("economic", key)
    expect(page).toContain(`- **Günstig**: E ist ${decimal(favorable.min)} oder mehr. ${economic("favorable")}`)
    expect(page).toContain(`- **Unklar**: E ist ${number(unclear.min)} oder mehr, aber unter ${decimal(favorable.min)}. ${economic("unclear")}`)
    expect(page).toContain(`- **Deutlich ungünstig**: E ist unter ${number(unclear.min)}. ${economic("clearly_unfavorable")}`)
  })
})
