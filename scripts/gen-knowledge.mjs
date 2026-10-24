#!/usr/bin/env node
/**
 * `pnpm gen:knowledge` (PLAN-AGENT-03 step 3): the only knowledge both agents answer from (D-57).
 *
 * Reads the public docs (`content/docs/<lang>/*.mdx`, written in phase A04) and an allow-list of
 * public app copy (the plain-language "How we calculate" texts, the result explanations and the
 * field help of both modules), strips MDX and JSX, splits at `##`, cuts chunks to at most 1,200
 * characters and writes `lib/ai/knowledge/generated/<lang>.json`. Internal docs (`docs/`) are
 * never read. A language holds only its own texts; the loader falls back to English per source.
 *
 * `node scripts/gen-knowledge.mjs --check` exits with 1 when a generated file is out of date.
 * `scripts/gen-knowledge.test.ts` runs the same check in `pnpm test`.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

export const LANGS = ["en", "de"]
export const KNOWLEDGE_OUT = "lib/ai/knowledge/generated"
export const DOCS_DIR = "content/docs"
export const MAX_CHUNK = 1200

/** The dictionary areas whose texts may become knowledge (titles also use `shell` labels). */
export const DICTIONARY_AREAS = ["calc", "quick-check", "business-plan"]

/** Where a chunk's text may come from. A test checks every chunk against this list. */
export const ALLOWED_SOURCES = [
  `${DOCS_DIR}/`,
  ...LANGS.flatMap((lang) => DICTIONARY_AREAS.map((area) => `dictionaries/${lang}/${area}.json#`)),
]

/**
 * The step whose page shows a field, by the longest matching id prefix. A test compares it with
 * the field registry, so a moved or new field cannot get a wrong link.
 */
export const FIELD_STEPS = {
  "quick-check": {
    "buildings.total": "area",
    "buildings.areaM2": "area",
    "buildings.shares": "buildings",
    "sources.potentials": "sources",
    "sources.pv": "options",
    "quickCheck.manualDemand": "options",
    "quickCheck.networkLengthM": "options",
    "quickCheck.overrides": "assumptions",
  },
  "business-plan": {
    site: "opportunity",
    "businessPlan.scenarioId": "opportunity",
    "businessPlan.opportunity": "opportunity",
    "businessPlan.canvas": "business-logic",
    "businessPlan.allocation": "business-logic",
    "businessPlan.assumptions": "reality-check",
    "businessPlan.criticalAssumptions": "reality-check",
    "businessPlan.risks": "reality-check",
    "businessPlan.refinements": "implementation",
    "businessPlan.scalability": "implementation",
    "businessPlan.nextSteps": "implementation",
  },
}

const MODULES = { "quick-check": "quickCheck", "business-plan": "businessPlan" }

/**
 * Names of the results that have no figure label, as the UI names them next to their value
 * (formula names, indicators, parameters). A test checks that every result gets a name.
 */
export const RESULT_TITLES = {
  buildingDensity: ["quick-check", "ui.results.indicators.buildingDensity"],
  densityCategory: ["quick-check", "derived.densityCategory.label"],
  heatDensityMwhPerM: ["quick-check", "ui.results.indicators.heatDensity"],
  chRatio: ["quick-check", "ui.results.indicators.chRatio"],
  heatingCoverage: ["calc", "formulas.eq-03-06a"],
  coolingCoverage: ["calc", "formulas.eq-03-06b"],
  heatingRevenue: ["calc", "formulas.eq-03-09a"],
  coolingRevenue: ["calc", "formulas.eq-03-09b"],
  connectionFeeRevenue: ["quick-check", "parameters.connection_fee.label"],
  networkInvestment: ["calc", "formulas.eq-03-10a"],
  supplyInvestment: ["calc", "formulas.eq-03-10c"],
  heatPumpInvestment: ["quick-check", "parameters.heat_pump.label"],
  annuityFactor: ["calc", "formulas.eq-03-10e"],
  economicRatio: ["calc", "formulas.oq-21"],
  level: ["quick-check", "ui.results.overall"],
}

export function stepOf(area, id) {
  const prefixes = Object.keys(FIELD_STEPS[area]).filter((prefix) => id === prefix || id.startsWith(`${prefix}.`))
  const prefix = prefixes.sort((a, b) => b.length - a.length)[0]
  return prefix ? FIELD_STEPS[area][prefix] : null
}

function readJson(root, file) {
  const full = path.join(root, file)
  return existsSync(full) ? JSON.parse(readFileSync(full, "utf8")) : {}
}

const at = (node, dotted) => dotted.split(".").reduce((value, key) => (value && typeof value === "object" ? value[key] : undefined), node)
const text = (node, dotted) => {
  const value = at(node, dotted)
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null
}

/** Splits lines into chunks of at most `MAX_CHUNK` characters (a longer line is cut at a word). */
export function packLines(lines) {
  const chunks = []
  let current = ""
  for (const raw of lines) {
    let line = raw
    while (line.length > MAX_CHUNK) {
      const cut = line.lastIndexOf(" ", MAX_CHUNK) > 0 ? line.lastIndexOf(" ", MAX_CHUNK) : MAX_CHUNK
      if (current) chunks.push(current)
      chunks.push(line.slice(0, cut).trim())
      current = ""
      line = line.slice(cut).trim()
    }
    if (current && current.length + 1 + line.length > MAX_CHUNK) {
      chunks.push(current)
      current = ""
    }
    current = current ? `${current}\n${line}` : line
  }
  if (current) chunks.push(current)
  return chunks
}

function chunksOf({ id, lang, title, url, lines, source }) {
  return packLines(lines.filter(Boolean)).map((body, index, all) => ({
    id: all.length > 1 ? `${id}-${index + 1}` : id,
    lang,
    title,
    url,
    text: body,
    source,
  }))
}

/** Every `fields` entry with a label and a help text: `[id, label, help]`. */
function fieldEntries(fields, prefix = []) {
  if (!fields || typeof fields !== "object") return []
  return Object.entries(fields).flatMap(([key, node]) => {
    const own = typeof node?.label === "string" && typeof node?.help === "string" && node.help.trim() ? [[[...prefix, key].join("."), node.label.trim(), node.help.trim()]] : []
    return [...own, ...fieldEntries(node, [...prefix, key])]
  })
}

/** Chunks from the allow-listed dictionary texts of one language. */
export function dictionaryChunks(root, lang) {
  const dict = Object.fromEntries([...DICTIONARY_AREAS, "shell"].map((area) => [area, readJson(root, `dictionaries/${lang}/${area}.json`)]))
  const en = Object.fromEntries([...DICTIONARY_AREAS, "shell"].map((area) => [area, readJson(root, `dictionaries/en/${area}.json`)]))
  // Titles may fall back to English labels; texts never do (each language holds its own texts).
  const label = (area, key) => text(dict[area], key) ?? text(en[area], key) ?? key
  const source = (area, key) => `dictionaries/${lang}/${area}.json#${key}`
  const page = (module, step) => (step === "assumptions" ? `/${lang}/dashboard/assumptions` : `/${lang}/dashboard/${module}/${step}`)
  const how = label("calc", "ui.title")
  const qc = label("shell", "nav.sections.quickCheck")
  const chunks = []

  for (const [step, body] of Object.entries(at(dict.calc, "steps") ?? {})) {
    const stepLabel = step === "assumptions" ? label("shell", "nav.items.assumptions") : label("shell", `nav.items.quickCheck.${step}`)
    chunks.push(...chunksOf({ id: `calc:steps.${step}`, lang, title: `${how} · ${qc} · ${stepLabel}`, url: page("quick-check", step), lines: [body], source: source("calc", `steps.${step}`) }))
  }

  for (const key of Object.keys(at(dict.calc, "results") ?? {})) {
    const lines = [text(dict.calc, `results.${key}.text`), text(dict.calc, `results.${key}.manual`)]
    const [titleArea, titleKey] = RESULT_TITLES[key] ?? ["quick-check", `ui.results.figures.${key}`]
    const name = label(titleArea, titleKey)
    chunks.push(...chunksOf({ id: `calc:results.${key}`, lang, title: `${how} · ${name}`, url: page("quick-check", "results"), lines, source: source("calc", `results.${key}`) }))
  }

  const qcText = dict["quick-check"]
  const levels = Object.keys(at(qcText, "results.levels") ?? {}).map((level) => {
    const name = text(qcText, `results.levels.${level}.label`)
    const description = text(qcText, `results.levels.${level}.description`)
    return name && description ? `${name}: ${description}` : null
  })
  chunks.push(...chunksOf({ id: "quick-check:results.levels", lang, title: `${qc} · ${label("quick-check", "ui.results.overall")}`, url: page("quick-check", "results"), lines: levels, source: source("quick-check", "results.levels") }))

  for (const [indicator, classes] of Object.entries(at(qcText, "results.classes") ?? {})) {
    const lines = Object.keys(classes ?? {}).map((key) => {
      const name = text(qcText, `results.classes.${indicator}.${key}.label`)
      const meaning = text(qcText, `results.classes.${indicator}.${key}.interpretation`)
      return name && meaning ? `${name}: ${meaning}` : null
    })
    const name = indicator === "coverage" ? label("quick-check", "ui.results.coverage.title") : label("quick-check", `ui.results.indicators.${indicator}`)
    chunks.push(...chunksOf({ id: `quick-check:results.classes.${indicator}`, lang, title: `${qc} · ${name}`, url: page("quick-check", "results"), lines, source: source("quick-check", `results.classes.${indicator}`) }))
  }

  const screening = [text(qcText, "ui.results.screening.body")]
  chunks.push(...chunksOf({ id: "quick-check:ui.results.screening", lang, title: `${qc} · ${label("quick-check", "ui.results.screening.title")}`, url: page("quick-check", "results"), lines: screening, source: source("quick-check", "ui.results.screening") }))

  for (const area of ["quick-check", "business-plan"]) {
    const moduleKey = MODULES[area]
    const byStep = new Map()
    for (const [id, name, help] of fieldEntries(at(dict[area], "fields"))) {
      const step = stepOf(area, id)
      if (!step) continue
      byStep.set(step, [...(byStep.get(step) ?? []), `${name}: ${help}`])
    }
    for (const [step, lines] of byStep) {
      const stepLabel = step === "assumptions" ? label("shell", "nav.items.assumptions") : label("shell", `nav.items.${moduleKey}.${step}`)
      const title = `${label("shell", `nav.sections.${moduleKey}`)} · ${stepLabel}`
      chunks.push(...chunksOf({ id: `${area}:fields.${step}`, lang, title, url: page(area, step), lines, source: source(area, "fields") }))
    }
  }
  return chunks.filter((chunk) => chunk.text)
}

/** An anchor id for a heading: lower case, letters and digits, hyphens between words. */
export function slugify(heading) {
  return heading
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
}

/** Markdown and MDX to plain text: no frontmatter, imports, JSX tags, code fences, link targets or emphasis. */
export function mdxToText(source) {
  return source
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/^(?:import|export)\s.*$/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<\/?[A-Za-z][^>]*>/g, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__|\*|_|`)(.+?)\1/g, "$2")
    .replace(/^>\s?/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/** The frontmatter `title:` of an MDX page, else its first `# ` heading. */
function pageTitle(source, fallback) {
  const front = /^---\n([\s\S]*?)\n---\n/.exec(source)?.[1] ?? ""
  const title = /^title:\s*["']?(.+?)["']?\s*$/m.exec(front)?.[1] ?? /^#\s+(.+)$/m.exec(source)?.[1]
  return (title ?? fallback).trim()
}

/** One page's sections, split at `##`: `{ heading, anchor, text }`; text before the first is the intro. */
export function mdxSections(source) {
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, "")
  const parts = body.split(/^##\s+/m)
  return parts
    .map((part, index) => {
      if (index === 0) return { heading: null, anchor: null, text: mdxToText(part.replace(/^#\s+.+$/m, "")) }
      const [heading, ...rest] = part.split("\n")
      return { heading: heading.trim(), anchor: slugify(heading), text: mdxToText(rest.join("\n")) }
    })
    .filter((section) => section.text)
}

/** Chunks from the public docs of one language. */
export function docsChunks(root, lang) {
  const dir = path.join(root, DOCS_DIR, lang)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .sort()
    .flatMap((file) => {
      const slug = file.replace(/\.mdx$/, "")
      const source = readFileSync(path.join(dir, file), "utf8")
      const title = pageTitle(source, slug)
      const url = slug === "index" ? `/${lang}/docs` : `/${lang}/docs/${slug}`
      return mdxSections(source).flatMap(({ heading, anchor, text: body }) =>
        chunksOf({
          id: `docs:${slug}${anchor ? `#${anchor}` : ""}`,
          lang,
          title: heading ? `${title} · ${heading}` : title,
          url: anchor ? `${url}#${anchor}` : url,
          lines: body.split(/\n{2,}/),
          source: `${DOCS_DIR}/${lang}/${file}${anchor ? `#${anchor}` : ""}`,
        }),
      )
    })
}

/** The generated files: `{ path, content }` per language. */
export function generateKnowledge(root = ROOT) {
  return LANGS.map((lang) => ({
    path: `${KNOWLEDGE_OUT}/${lang}.json`,
    content: `${JSON.stringify([...docsChunks(root, lang), ...dictionaryChunks(root, lang)], null, 2)}\n`,
  }))
}

export function outdatedFiles(root, files) {
  return files.filter((file) => {
    const full = path.join(root, file.path)
    return !existsSync(full) || readFileSync(full, "utf8") !== file.content
  }).map((file) => file.path)
}

function main() {
  const files = generateKnowledge()
  if (process.argv.includes("--check")) {
    const outdated = outdatedFiles(ROOT, files)
    if (outdated.length > 0) {
      console.error(`Out of date (run \`pnpm gen:knowledge\`):\n${outdated.join("\n")}`)
      process.exit(1)
    }
    return
  }
  mkdirSync(path.join(ROOT, KNOWLEDGE_OUT), { recursive: true })
  for (const file of files) writeFileSync(path.join(ROOT, file.path), file.content)
  console.log(`Wrote ${files.map((file) => file.path).join(", ")}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
