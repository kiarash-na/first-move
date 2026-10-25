import { readFileSync } from "node:fs"
import path from "node:path"

import { expect, test } from "@playwright/test"

import { text, type Lang } from "./support/dictionary"

/**
 * PLAN-LANDING-FIX-00 and PLAN-LANDING-POLISH-00: the landing after the visual fix and the polish.
 * The AI Plan Score chapter sits between the Business Plan's next move and the methodology, replays
 * the recorded blind test when it scrolls into view and links the dashboard route, the docs page
 * and the blind test on slide 5; the story links go one step at a time; the header holds the five
 * chapters and the docs link on one line from 1024 px; the footer reaches the docs; nothing is
 * italic; nothing scrolls sideways.
 */

const WIDTHS = [1024, 1280, 1440]

/** The recorded run the chapter replays: its numbers are read, never typed (PLAN-LANDING-POLISH-00 step f). */
const RECORDED = JSON.parse(readFileSync(path.join(process.cwd(), "lib/presentation/blind-test/result.json"), "utf8")) as {
  score: { shown: number; level: string }
}
const SCORE = String(RECORDED.score.shown)

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

    // The recorded run plays to its score once in view, and names the way to the blind test.
    const console_ = chapter.locator(".ai-console")
    await expect(console_).toHaveAttribute("data-step", "5", { timeout: 15_000 })
    await expect(console_.locator(".ai-result__number")).toHaveText(SCORE, { timeout: 5_000 })
    await expect(console_.locator(".ai-result__level")).toHaveText(t(`aiScore.console.levels.${RECORDED.score.level}`))
    await expect(console_.locator(".ai-console__title")).toHaveText(t("aiScore.console.title"))
    await expect(console_.getByRole("link", { name: t("aiScore.console.link") })).toHaveAttribute("href", `/${lang}/presentation#5`)
    // Replay starts over.
    await chapter.getByRole("button", { name: t("aiScore.console.replay") }).click()
    await expect(console_).toHaveAttribute("data-step", "0")
    await expect(console_).toHaveAttribute("data-step", "5", { timeout: 15_000 })
  })
}

test("the header nav names every chapter and the docs on one line from 1024 px, and nothing scrolls sideways", async ({ page }) => {
  // Three loads of the 3D scene under headless software GL, each scrolled through once.
  test.setTimeout(120_000)
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/en")
    const links = page.locator(".main-nav a")
    await expect(links).toHaveCount(6)
    await expect(links.nth(3)).toHaveAttribute("href", "#ai-score")
    await expect(links.last()).toHaveAttribute("href", "/en/docs")
    // The nav ends before the actions begin.
    const navRight = await page.locator(".main-nav").evaluate((element) => element.getBoundingClientRect().right)
    const actionsLeft = await page.locator(".header-actions").evaluate((element) => element.getBoundingClientRect().left)
    expect(navRight, `nav clear of the actions at ${width}px`).toBeLessThanOrEqual(actionsLeft)
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

test("with reduced motion the recorded run shows its final state at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/en")
  const chapter = page.locator("#ai-score")
  await chapter.scrollIntoViewIfNeeded()
  await expect(chapter.locator(".ai-console")).toHaveAttribute("data-step", "5", { timeout: 5_000 })
  await expect(chapter.locator(".ai-result__number")).toHaveText(SCORE)
})

for (const lang of ["en", "de"] as Lang[]) {
  test(`the footer reaches the docs pages of the modules and the docs index, at every desktop width (${lang})`, async ({ page }) => {
    const t = (key: string) => text(lang, "landing", key)
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`/${lang}`)
      const nav = page.locator("footer.site-footer").getByRole("navigation", { name: t("closing.footer.nav") })
      await nav.scrollIntoViewIfNeeded()
      await expect(nav.getByRole("link", { name: t("closing.footer.quickCheck"), exact: true })).toHaveAttribute("href", `/${lang}/docs/quick-check`)
      await expect(nav.getByRole("link", { name: t("closing.footer.businessModels"), exact: true })).toHaveAttribute("href", `/${lang}/docs/business-plan`)
      await expect(nav.getByRole("link", { name: t("closing.footer.docs"), exact: true })).toHaveAttribute("href", `/${lang}/docs`)
      const tops = await nav.getByRole("link").evaluateAll((elements) => elements.map((element) => Math.round(element.getBoundingClientRect().top)))
      expect(new Set(tops).size, `footer links share one line at ${width}px`).toBe(1)
      await expect(nav.getByRole("link", { name: t("closing.footer.docs"), exact: true })).toBeVisible()
    }
    await page.locator("footer.site-footer").getByRole("link", { name: t("closing.footer.docs"), exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/${lang}/docs$`))
  })
}

test("nothing on the landing is italic: the emphasised words share the title's style (D-LP-1)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/en")
  const italic = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".site-shell *")]
      .filter((element) => element.getClientRects().length > 0 && (element.textContent ?? "").trim().length > 0 && getComputedStyle(element).fontStyle === "italic")
      .map((element) => `${element.tagName.toLowerCase()}: ${(element.textContent ?? "").trim().slice(0, 40)}`),
  )
  expect(italic).toEqual([])
  const accent = page.locator(".hero__title .title-line--accent")
  const styles = await page.locator(".hero__title .title-line").evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element)
      return [style.fontStyle, style.fontWeight, style.fontStretch, style.textTransform].join(" ")
    }),
  )
  await expect(accent).toBeVisible()
  expect(new Set(styles).size, "the three title lines share one style").toBe(1)
})

test("the use-case switcher and the implementation steps carry no link arrows", async ({ page }) => {
  await page.goto("/en")
  await expect(page.locator(".use-case-switcher button svg")).toHaveCount(0)
  await expect(page.locator(".implementation-path li svg")).toHaveCount(0)
  await expect(page.locator(".business-inputs li")).toHaveCount(8)
})
