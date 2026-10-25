import { readFileSync } from "node:fs"
import path from "node:path"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import aiScoreDe from "@/dictionaries/de/ai-score.json"
import aiScoreEn from "@/dictionaries/en/ai-score.json"
import de from "@/dictionaries/de/presentation.json"
import en from "@/dictionaries/en/presentation.json"
import { headingId } from "@/lib/docs/heading-id"
import { isDocSlug } from "@/lib/docs/pages"
import { REFERENCES } from "@/lib/docs/references"
import { blindSummary } from "@/lib/presentation/blind-test/summary"
import { KNOWN_OUTCOME } from "@/lib/presentation/blind-test/geblergasse-2017"
import { AiEngineSlide, blindView, sourcesHref } from "./ai-engine-slide"

describe("blindView", () => {
  it("formats the recorded run in German and names everything with the app's own labels", () => {
    const view = blindView("de", blindSummary("de"), de.slides.aiEngine, aiScoreDe.labels)
    expect(view.input).toContain("30. Oktober 2017")
    expect(view.decided).toMatch(/^Entschieden in \d+,\d\s?s$/)
    expect(view.levelName).toBe(aiScoreDe.labels.scoreLevels.promising.name)
    expect(view.seats).toHaveLength(7)
    expect(view.seats.map((seat) => seat.name)).not.toContain("value")
    expect(view.mustHave.length).toBeGreaterThan(0)
    expect(view.tryHref).toBe("/de/dashboard/ai-score")
  })

  it("counts every gate the run checked, the follow-up gates of its branches included", () => {
    const summary = blindSummary("en")
    const view = blindView("en", summary, en.slides.aiEngine, aiScoreEn.labels)
    const total = summary.gates.pass + summary.gates.fail + summary.gates.unclear
    expect(total).toBeGreaterThan(summary.engine.gates)
    const { pass, fail, unclear } = aiScoreEn.labels.outcomes
    expect(view.gates).toBe(`${total} gates: ${summary.gates.pass} ${pass} · ${summary.gates.fail} ${fail} · ${summary.gates.unclear} ${unclear}`)
  })

  it("links every outcome to its own source", () => {
    const view = blindView("en", blindSummary("en"), en.slides.aiEngine, aiScoreEn.labels)
    expect(view.outcome.map((item) => item.url)).toEqual([KNOWN_OUTCOME.sources.built, KNOWN_OUTCOME.sources.running, KNOWN_OUTCOME.sources.award])
  })
})

describe("AiEngineSlide", () => {
  it("links the sources of the method page and starts with the blind test, without a wall of numbers", () => {
    render(<AiEngineSlide number={5} lang="en" copy={en.slides.aiEngine} labels={aiScoreEn.labels} summary={blindSummary("en")} />)
    expect(screen.getByRole("link", { name: en.slides.aiEngine.sources })).toHaveAttribute("href", "/en/docs/ai-plan-score#sources")
    expect(screen.getByRole("button", { name: en.slides.aiEngine.run })).toBeInTheDocument()
    expect(screen.queryByRole("term")).not.toBeInTheDocument()
  })

  it("links the docs section that lists and links every source, in both languages", () => {
    for (const [lang, copy, anchor] of [["en", en, "sources"], ["de", de, "quellen"]] as const) {
      const { unmount } = render(<AiEngineSlide number={5} lang={lang} copy={copy.slides.aiEngine} labels={aiScoreEn.labels} summary={blindSummary(lang)} />)
      const href = screen.getByRole("link", { name: copy.slides.aiEngine.sources }).getAttribute("href")!
      expect(href).toBe(sourcesHref(lang, copy.slides.aiEngine))
      const [pathname, hash] = href.split("#")
      expect(hash).toBe(anchor)
      const slug = pathname.split("/").pop()
      expect(isDocSlug(slug)).toBe(true)
      const page = readFileSync(path.join(process.cwd(), "content/docs", lang, `${slug}.mdx`), "utf8")
      // The anchor is the id the docs page gives one of its `##` headings (`mdx-h2.tsx`).
      const sections = page.split(/^## /m).slice(1)
      const section = sections.find((entry) => headingId(entry.split("\n")[0]) === hash)
      expect(section, `${lang}: no "## " heading with the id ${hash}`).toBeDefined()
      for (const reference of REFERENCES) expect(section, `${lang}: ${reference.id}`).toContain(`](${reference.url})`)
      unmount()
    }
  })
})
