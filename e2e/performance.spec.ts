import { readFileSync } from "node:fs"
import path from "node:path"

import { expect, test } from "@playwright/test"

import { openExample, PROJECT_PAGES, settle } from "./support/session"

/**
 * PLAN-DASH-11 step 3: first-load JavaScript per route, lazy charts, no layout shift and no
 * hydration warnings. The bundle numbers come from the production build
 * (`.next/diagnostics/route-bundle-stats.json`).
 */

interface RouteStats {
  route: string
  firstLoadUncompressedJsBytes: number
  firstLoadChunkPaths: string[]
}

const stats = (): RouteStats[] =>
  JSON.parse(readFileSync(path.join(process.cwd(), ".next/diagnostics/route-bundle-stats.json"), "utf8")) as RouteStats[]

const chunk = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8")

test.describe("first-load JavaScript", () => {
  test("charts and the 3D scene never ship with a dashboard route", () => {
    for (const { route, firstLoadChunkPaths } of stats()) {
      if (!route.includes("/dashboard")) continue
      for (const file of firstLoadChunkPaths) {
        const code = chunk(file)
        expect(code, `${route} ${file}`).not.toContain("recharts-wrapper")
        expect(code, `${route} ${file}`).not.toContain("WebGLRenderer")
      }
    }
  })

  test("the landing's 3D scene and the formula MathML load lazily, never with the first load", () => {
    for (const { route, firstLoadChunkPaths } of stats()) {
      for (const file of firstLoadChunkPaths) {
        const code = chunk(file)
        // three.js loads after hydration (DistrictScene → districtWorld).
        expect(code, `${route} ${file}`).not.toContain("WebGLRenderer")
        // The MathML loads when a "How we calculate" opens (lazy-calc-explanation.tsx).
        expect(code, `${route} ${file}`).not.toContain('<annotation encoding="application/x-tex">')
      }
    }
  })

  test("no math library ships to the client (D-33): equations are pre-rendered MathML", () => {
    for (const { route, firstLoadChunkPaths } of stats()) {
      for (const file of firstLoadChunkPaths) {
        expect(chunk(file), `${route} ${file}`).not.toMatch(/katex\.renderToString|ParseError.*KaTeX|KaTeX parse error/)
      }
    }
  })

  test("the overview stays within its first-load budget", () => {
    const overview = stats().find((entry) => entry.route === "/[lang]/dashboard/overview")
    expect(overview).toBeDefined()
    // Uncompressed JS of the first load; about 300 kB over the wire (gzip). Raise only with a note.
    expect(overview!.firstLoadUncompressedJsBytes).toBeLessThan(1_150_000)
  })
})

test.describe("layout shift and hydration", () => {
  for (const width of [375, 1440]) {
    test(`cumulative layout shift stays under 0.1 on every page at ${width}px`, async ({ page }) => {
      test.setTimeout(180_000)
      await page.setViewportSize({ width, height: 900 })
      const problems: string[] = []
      page.on("console", (message) => {
        if ((message.type() === "error" || message.type() === "warning") && !/GL Driver|WebGL/.test(message.text())) problems.push(message.text())
      })
      page.on("pageerror", (error) => problems.push(error.message))
      await page.addInitScript(() => {
        const state = window as unknown as { __cls: number }
        state.__cls = 0
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
            if (!entry.hadRecentInput) state.__cls += entry.value
          }
        }).observe({ type: "layout-shift", buffered: true })
      })

      await openExample(page, "en")
      const worst: string[] = []
      for (const route of [...PROJECT_PAGES, ""]) {
        await page.goto(`/en/dashboard${route ? `/${route}` : ""}`)
        await settle(page)
        await page.waitForTimeout(1200)
        const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls)
        if (cls >= 0.1) worst.push(`${route || "start"}: ${cls.toFixed(3)}`)
      }
      expect(worst).toEqual([])
      expect(problems, "console errors, warnings and hydration messages").toEqual([])
    })
  }

  test("the charts load as their own request after the page, not with it", async ({ page }) => {
    await openExample(page, "en")
    const scripts: string[] = []
    page.on("response", (response) => {
      if (response.url().endsWith(".js")) scripts.push(response.url())
    })
    const html = await page.request.get("/en/dashboard/overview").then((response) => response.text())
    const inHtml = [...html.matchAll(/static\/chunks\/([\w-]+\.js)/g)].map((match) => match[1])
    await page.goto("/en/dashboard/overview")
    await expect(page.locator("[data-chart]").first()).toBeVisible()
    const charts = scripts.filter((url) => chunk(`.next/static/chunks/${url.split("/").pop()}`).includes("recharts-wrapper"))
    expect(charts.length).toBeGreaterThan(0)
    for (const url of charts) expect(inHtml).not.toContain(url.split("/").pop())
  })
})
