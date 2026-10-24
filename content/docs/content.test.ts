// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import docsCopy from "@/dictionaries/en/docs.json"
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
 * Guards the public docs (PLAN-AGENT-04, D-57): both agents answer from these pages, so they must
 * hold no internal paths, environment names, secrets or internal ids, link only to the site's
 * own pages, use only the Markdown the docs route renders, and state the methodology's numbers
 * exactly as the engine uses them.
 */

const ROOT = path.resolve(__dirname, "../..")
const source = (slug: DocSlug) => readFileSync(path.join(ROOT, "content/docs/en", `${slug}.mdx`), "utf8")
const PAGES = DOC_SLUGS.map((slug) => ({ slug, text: source(slug) }))

const headings = (text: string) => [...text.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim())
const anchors = (slug: DocSlug) => headings(source(slug)).map(headingId)
const links = (text: string) => [...text.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)].map((match) => ({ label: match[1], href: match[2], index: match.index }))

/** The `#…` section ids of a legal page, from its dictionary. */
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

/** Why a link target is not one of the site's pages or sections, or null when it is. */
function brokenTarget(slug: DocSlug, href: string): string | null {
  const [pathname, anchor] = href.split("#")
  if (pathname === "") return anchors(slug).includes(anchor) ? null : `no heading #${anchor} on this page`
  if (!pathname.startsWith("/") || pathname.startsWith("//")) return "not a site path"
  if (pathname === "/docs" || pathname.startsWith("/docs/")) {
    const target = pathname === "/docs" ? "index" : pathname.slice("/docs/".length)
    if (!isDocSlug(target)) return "no such docs page"
    return anchor === undefined || anchors(target).includes(anchor) ? null : `no heading #${anchor} on ${target}`
  }
  if (DASHBOARD_PATHS.has(pathname)) return anchor === undefined ? null : "dashboard pages have no anchors"
  const legal = pathname.slice(1)
  if (isLegalSlug(legal)) return anchor === undefined || legalSections(legal).includes(anchor) ? null : `no section #${anchor} on ${legal}`
  return "not a page of the site"
}

describe("public docs content (PLAN-AGENT-04)", () => {
  it("has exactly one English file per docs page, and no German pages yet (D-32)", () => {
    const english = readdirSync(path.join(ROOT, "content/docs/en")).filter((file) => file.endsWith(".mdx"))
    expect(english.sort()).toEqual(DOC_SLUGS.map((slug) => `${slug}.mdx`).sort())
    const german = existsSync(path.join(ROOT, "content/docs/de")) ? readdirSync(path.join(ROOT, "content/docs/de")) : []
    expect(german.filter((file) => file.endsWith(".mdx"))).toEqual([])
  })

  it.each(PAGES)("$slug starts with its title, the one level-1 heading", ({ slug, text }) => {
    expect(text.split("\n")[0]).toBe(`# ${docsCopy.pages[slug].title}`)
    expect(text.match(/^#\s/gm)).toHaveLength(1)
  })

  it.each(PAGES)("$slug uses only the Markdown the docs route renders", ({ text }) => {
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

  it.each(PAGES)("$slug has plain, unique section headings", ({ text }) => {
    const list = headings(text)
    expect(list.length).toBeGreaterThan(2)
    for (const heading of list) expect(heading, heading).toMatch(/^[\p{L}\p{N} ,:?()'.-]+$/u)
    const ids = list.map(headingId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(PAGES)("$slug links only to pages and sections of the site", ({ slug, text }) => {
    for (const { href } of links(text)) expect(brokenTarget(slug, href), href).toBeNull()
  })

  it("rejects targets outside the site in the link check", () => {
    expect(brokenTarget("index", "https://example.org")).toBe("not a site path")
    expect(brokenTarget("index", "/docs/missing")).toBe("no such docs page")
    expect(brokenTarget("index", "/docs/quick-check#missing")).toBe("no heading #missing on quick-check")
    expect(brokenTarget("index", "/privacy#missing")).toBe("no section #missing on privacy")
    expect(brokenTarget("index", "/somewhere")).toBe("not a page of the site")
    expect(brokenTarget("quick-check", "#supply")).toBeNull()
  })

  it("links to the AI pages only from the AI pages or inside <AiOnly>, so no link breaks while they are off", () => {
    for (const { slug, text } of PAGES) {
      if (AI_DOC_SLUGS.includes(slug)) continue
      const ranges = aiOnlyRanges(text)
      for (const { href, index } of links(text)) {
        const target = href.split("#")[0].replace(/^\/docs\//, "")
        if (!AI_DOC_SLUGS.includes(target as DocSlug)) continue
        expect(ranges.some(([start, end]) => index > start && index < end), `${slug}: ${href}`).toBe(true)
      }
    }
  })

  it.each(PAGES)("$slug holds no internal paths, environment names, secrets or internal ids", ({ text }) => {
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

  it.each(PAGES)("$slug has no invisible or control characters", ({ text }) => {
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
