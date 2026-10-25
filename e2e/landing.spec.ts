import { expect, test } from "@playwright/test"

import { text, type Lang } from "./support/dictionary"

/**
 * PLAN-LANDING-FIX-00: the landing after the visual fix. The AI Plan Score chapter sits between
 * the Business Plan's next move and the methodology, plays its example run when it scrolls into
 * view and links the dashboard route and the docs page; the story links go one step at a time;
 * the header holds five entries on one line from 1024 px; nothing scrolls sideways.
 */

const WIDTHS = [1024, 1280, 1440]

for (const lang of ["en", "de"] as Lang[]) {
  test(`the AI Plan Score chapter follows the Business Plan and links the route and the docs (${lang})`, async ({ page }) => {
    const t = (key: string) => text(lang, "landing", key)
    await page.goto(`/${lang}`)
    const chapter = page.locator("#ai-score")
    await expect(page.locator("#implementation + #ai-score")).toHaveCount(1)
    await expect(page.locator("#ai-score + #methodology")).toHaveCount(1)
    await expect(page.locator("#implementation").getByRole("link", { name: t("businessModels.implementation.link") })).toHaveAttribute("href", "#ai-score")

    await chapter.scrollIntoViewIfNeeded()
    await expect(chapter.getByRole("link", { name: t("aiScore.primary") })).toHaveAttribute("href", `/${lang}/dashboard/ai-score`)
    await expect(chapter.getByRole("link", { name: t("aiScore.secondary") })).toHaveAttribute("href", `/${lang}/docs/ai-plan-score`)
    await expect(chapter.getByRole("link", { name: t("aiScore.link") })).toHaveAttribute("href", "#methodology")

    // The example run plays to its score once in view.
    const console_ = chapter.locator(".ai-console")
    await expect(console_).toHaveAttribute("data-step", "5", { timeout: 15_000 })
    await expect(console_.locator(".ai-result__number")).toHaveText("60", { timeout: 5_000 })
    await expect(console_.locator(".ai-result__level")).toHaveText(t("aiScore.console.levels.promising"))
    // Replay starts over.
    await chapter.getByRole("button", { name: t("aiScore.console.replay") }).click()
    await expect(console_).toHaveAttribute("data-step", "0")
    await expect(console_).toHaveAttribute("data-step", "5", { timeout: 15_000 })
  })
}

test("the header nav names every chapter on one line from 1024 px, and nothing scrolls sideways", async ({ page }) => {
  // Three loads of the 3D scene under headless software GL, each scrolled through once.
  test.setTimeout(120_000)
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/en")
    const links = page.locator(".main-nav a")
    await expect(links).toHaveCount(5)
    await expect(links.nth(3)).toHaveAttribute("href", "#ai-score")
    const tops = await links.evaluateAll((elements) => elements.map((element) => Math.round(element.getBoundingClientRect().top)))
    expect(new Set(tops).size, `nav entries share one line at ${width}px`).toBe(1)
    const heights = await links.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height))
    for (const height of heights) expect(height, `no wrapped entry at ${width}px`).toBeLessThan(50)

    // Every [data-reveal] block becomes visible on the way down, so the check covers the revealed layout.
    const overflow = await page.evaluate(async () => {
      const total = document.documentElement.scrollHeight
      for (let y = 0; y < total; y += 600) {
        window.scrollTo(0, y)
        await new Promise((resolve) => setTimeout(resolve, 30))
      }
      return document.documentElement.scrollWidth - document.documentElement.clientWidth
    })
    expect(overflow, `horizontal overflow at ${width}px`).toBe(0)
  }
})

test("the hero callouts sit on the district's nodes and leave with the hero", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/en")
  const callouts = page.locator(".scene-callout")
  await expect(callouts).toHaveCount(2)
  // Once the WebGL scene draws, both are on and placed in the scene's half of the viewport.
  await expect(callouts.first()).toHaveAttribute("data-on", "true", { timeout: 15_000 })
  for (const callout of await callouts.all()) {
    const x = Number.parseFloat(await callout.evaluate((element) => element.style.getPropertyValue("--anchor-x")))
    expect(x).toBeGreaterThan(1440 * 0.6)
  }
  await page.evaluate(() => window.scrollTo(0, 500))
  await expect(callouts.first()).toHaveAttribute("data-on", "false")
  await expect(callouts.last()).toHaveAttribute("data-on", "false")
})

test("with reduced motion the example run shows its final state at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/en")
  const chapter = page.locator("#ai-score")
  await chapter.scrollIntoViewIfNeeded()
  await expect(chapter.locator(".ai-console")).toHaveAttribute("data-step", "5", { timeout: 5_000 })
  await expect(chapter.locator(".ai-result__number")).toHaveText("60")
})

test("the use-case switcher and the implementation steps carry no link arrows", async ({ page }) => {
  await page.goto("/en")
  await expect(page.locator(".use-case-switcher button svg")).toHaveCount(0)
  await expect(page.locator(".implementation-path li svg")).toHaveCount(0)
  await expect(page.locator(".business-inputs li")).toHaveCount(8)
})
