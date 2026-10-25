import { expect, test, type Page } from "@playwright/test"

import { axeViolations } from "./support/axe"
import { text, type Lang } from "./support/dictionary"

/**
 * PLAN-LANDING-MOBILE-00: below 1024 px the landing is the separate phone and tablet version. The
 * desktop tree leaves the DOM after hydration and its 3D scene never loads; from 1024 px it is the
 * other way round. The calls to action lead to the dashboard and the docs, the menu reaches the
 * chapters, the example run plays, every tap target is 44 px, nothing scrolls sideways, axe finds
 * nothing.
 */

const PHONE = { width: 390, height: 844 }
const NARROW = { width: 320, height: 640 }
const TABLET = { width: 768, height: 1024 }
const DESKTOP = [
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
]

/** Scrolls through the page once (every block reveals) and reports the sideways overflow. */
async function overflow(page: Page) {
  return page.evaluate(async () => {
    const total = document.documentElement.scrollHeight
    for (let y = 0; y < total; y += 500) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 30))
    }
    return document.documentElement.scrollWidth - document.documentElement.clientWidth
  })
}

/** Collects the URLs of scripts that carry three.js (its renderer's name) as they load. */
function watchForThree(page: Page) {
  const hits: string[] = []
  page.on("response", async (response) => {
    if (response.request().resourceType() !== "script") return
    const body = await response.text().catch(() => "")
    if (body.includes("WebGLRenderer")) hits.push(response.url())
  })
  return hits
}

for (const lang of ["en", "de"] as Lang[]) {
  for (const viewport of [PHONE, TABLET]) {
    test(`at ${viewport.width} px the mobile landing shows, the desktop tree is gone and the actions work (${lang})`, async ({ page }) => {
      const t = (key: string) => text(lang, "landing", key)
      await page.setViewportSize(viewport)
      const three = watchForThree(page)
      await page.goto(`/${lang}`)

      // The switch: the mobile tree stays, the desktop tree leaves, nothing of the 3D scene loads.
      await expect(page.locator(".landing-mobile")).toHaveAttribute("data-variant", "mobile")
      await expect(page.locator(".m-landing")).toBeVisible()
      await expect(page.locator(".site-shell")).toHaveCount(0)
      await expect(page.locator(".landing-desktop")).toBeHidden()
      await expect(page.locator("canvas")).toHaveCount(0)
      await expect(page.getByRole("main")).toHaveCount(1)
      await expect(page.getByRole("heading", { level: 1, name: t("hero.titleLabel") })).toBeVisible()

      // The header: Get Started leads to the dashboard, the menu reaches the five chapters.
      const header = page.locator(".m-header")
      await expect(header.getByRole("link", { name: t("header.getStarted") })).toHaveAttribute("href", `/${lang}/dashboard`)
      await header.getByRole("button", { name: t("header.openMenu") }).click()
      const menu = page.getByRole("navigation", { name: t("header.mobileNav") })
      await expect(menu).toBeVisible()
      for (const [key, id] of [["system", "m-system"], ["quickCheck", "m-quick-check"], ["businessModels", "m-business-models"], ["aiScore", "m-ai-score"], ["methodology", "m-methodology"]]) {
        await expect(menu.getByRole("link", { name: t(`header.nav.${key}`) })).toHaveAttribute("href", `#${id}`)
      }
      await menu.getByRole("link", { name: t("header.nav.aiScore") }).click()
      await expect(menu).toBeHidden()
      await expect(page.locator("#m-ai-score")).toBeInViewport()

      // The example run plays to its score once in view (on a phone it sits below the chapter's copy), and replays.
      const console_ = page.locator("#m-ai-score .m-ai")
      await console_.scrollIntoViewIfNeeded()
      await expect(console_).toHaveAttribute("data-step", "5", { timeout: 15_000 })
      await expect(console_.locator(".m-ai-score__number")).toHaveText("60", { timeout: 5_000 })
      await expect(console_.locator(".m-ai-score__level")).toHaveText(t("aiScore.console.levels.promising"))
      await console_.getByRole("button", { name: t("aiScore.console.replay") }).click()
      await expect(console_).toHaveAttribute("data-step", "0")
      await expect(console_).toHaveAttribute("data-step", "5", { timeout: 15_000 })

      // The calls to action.
      const chapter = page.locator("#m-ai-score")
      await expect(chapter.getByRole("link", { name: t("aiScore.primary") })).toHaveAttribute("href", `/${lang}/dashboard/ai-score`)
      await expect(chapter.getByRole("link", { name: t("aiScore.secondary") })).toHaveAttribute("href", `/${lang}/docs/ai-plan-score`)
      const closing = page.locator("#m-get-started")
      await expect(closing.getByRole("link", { name: t("closing.getStarted.primary") })).toHaveAttribute("href", `/${lang}/dashboard`)
      await expect(closing.getByRole("link", { name: t("closing.getStarted.secondary") })).toHaveAttribute("href", `/${lang}/docs`)
      const legal = page.getByRole("navigation", { name: t("closing.footer.legal.nav") })
      await expect(legal.getByRole("link")).toHaveCount(8)
      await expect(legal.getByRole("link", { name: t("presentation.footer"), exact: true })).toHaveAttribute("href", `/${lang}/presentation`)

      // Nothing scrolls sideways once everything is revealed; three.js never arrived.
      expect(await overflow(page), `sideways overflow at ${viewport.width}px`).toBe(0)
      expect(three).toEqual([])
    })
  }
}

test("at 320 px every tap target is at least 44 px high and Get Started opens the dashboard", async ({ page }) => {
  await page.setViewportSize(NARROW)
  await page.goto("/en")
  await expect(page.locator(".landing-mobile")).toHaveAttribute("data-variant", "mobile")
  expect(await overflow(page)).toBe(0)
  const small = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".m-landing a[href], .m-landing button, .m-landing summary")]
      .filter((el) => !el.closest("[hidden]") && el.getClientRects().length > 0)
      .map((el) => ({ name: (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 30), height: el.getBoundingClientRect().height }))
      .filter((entry) => entry.height < 44),
  )
  expect(small).toEqual([])
  await page.locator(".m-header").getByRole("link", { name: text("en", "landing", "header.getStarted") }).click()
  await expect(page).toHaveURL(/\/en\/dashboard$/)
})

for (const viewport of DESKTOP) {
  test(`from ${viewport.width} px the desktop landing shows and the mobile tree is gone`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto("/en")
    await expect(page.locator(".landing-desktop")).toHaveAttribute("data-variant", "desktop")
    await expect(page.locator(".site-shell")).toBeVisible()
    await expect(page.locator(".m-landing")).toHaveCount(0)
    await expect(page.locator(".landing-mobile")).toBeHidden()
    await expect(page.locator(".main-nav a")).toHaveCount(5)
  })
}

test("a tablet turned to landscape gets the desktop landing, and back", async ({ page }) => {
  await page.setViewportSize(TABLET)
  await page.goto("/en")
  await expect(page.locator(".m-landing")).toBeVisible()
  await expect(page.locator(".site-shell")).toHaveCount(0)
  await page.setViewportSize({ width: 1024, height: 768 })
  await expect(page.locator(".site-shell")).toBeVisible()
  await expect(page.locator(".m-landing")).toHaveCount(0)
  await page.setViewportSize(TABLET)
  await expect(page.locator(".m-landing")).toBeVisible()
  await expect(page.locator(".site-shell")).toHaveCount(0)
})

test("with reduced motion every block is visible at once and the run shows its final state", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.setViewportSize(PHONE)
  await page.goto("/en")
  await expect(page.locator(".landing-mobile")).toHaveAttribute("data-variant", "mobile")
  await expect(page.locator(".m-landing")).not.toHaveAttribute("data-ready", "true")
  const blocks = page.locator("[data-m-reveal]")
  await expect(blocks.first()).toHaveClass(/is-in/)
  expect(await blocks.evaluateAll((elements) => elements.every((element) => element.classList.contains("is-in")))).toBe(true)
  await page.locator("#m-ai-score").scrollIntoViewIfNeeded()
  await expect(page.locator("#m-ai-score .m-ai")).toHaveAttribute("data-step", "5", { timeout: 5_000 })
  await expect(page.locator("#m-ai-score .m-ai-score__number")).toHaveText("60")
})

for (const lang of ["en", "de"] as Lang[]) {
  test(`axe finds nothing on the mobile landing, menu closed and open (${lang})`, async ({ page }) => {
    await page.setViewportSize(PHONE)
    await page.goto(`/${lang}`)
    await expect(page.locator(".landing-mobile")).toHaveAttribute("data-variant", "mobile")
    await overflow(page)
    expect(await axeViolations(page), "menu closed").toEqual([])
    await page.locator(".m-header").getByRole("button", { name: text(lang, "landing", "header.openMenu") }).click()
    expect(await axeViolations(page, { include: ".m-header" }), "menu open").toEqual([])
  })
}
