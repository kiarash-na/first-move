import { expect, test } from "@playwright/test"

import { openExample, PROJECT_PAGES, settle } from "./support/session"

/**
 * PLAN-DASH-11 step 2, responsive: no page scrolls sideways, nothing is cut off by the viewport
 * and the top bar stays usable at 375, 768, 1024 and 1440px, in both languages and both themes.
 */

const WIDTHS = [375, 768, 1024, 1440]

for (const width of WIDTHS) {
  for (const [lang, theme] of [["en", "dark"], ["de", "light"]] as const) {
    test(`no horizontal overflow on any page at ${width}px (${lang}, ${theme})`, async ({ page }) => {
      test.setTimeout(180_000)
      await page.setViewportSize({ width, height: 900 })
      await openExample(page, lang, theme)
      for (const route of [...PROJECT_PAGES, ""]) {
        await page.goto(`/${lang}/dashboard${route ? `/${route}` : ""}`)
        await settle(page)
        const wide = await page.evaluate(() => {
          const viewport = document.documentElement.clientWidth
          const offenders: string[] = []
          for (const el of document.querySelectorAll<HTMLElement>("body *")) {
            const box = el.getBoundingClientRect()
            if (box.width === 0 || box.right <= viewport + 1) continue
            // Content inside a scroller (wide tables, formulas) may extend; the scroller itself may not.
            let parent: HTMLElement | null = el.parentElement
            let scrolled = false
            while (parent) {
              const overflow = getComputedStyle(parent).overflowX
              if (overflow === "auto" || overflow === "scroll" || overflow === "hidden" || overflow === "clip") {
                scrolled = true
                break
              }
              parent = parent.parentElement
            }
            if (!scrolled && getComputedStyle(el).position !== "fixed") offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`)
          }
          return { scroll: document.documentElement.scrollWidth - viewport, offenders: offenders.slice(0, 5) }
        })
        expect(wide, `${route || "start"} at ${width}px`).toEqual({ scroll: 0, offenders: [] })
      }
    })
  }
}

test("the top bar keeps its actions reachable at every width", async ({ page }) => {
  await openExample(page, "en")
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 })
    await settle(page)
    const status = page.locator("[data-status]").first()
    await expect(status).toBeVisible()
    // From 640px Export and Import are in the bar; below they are in the project menu.
    const menu = page.getByRole("button", { name: /^Project menu/ })
    await expect(menu).toBeVisible()
    const box = await menu.boundingBox()
    expect(box && box.x + box.width <= width && box.width >= 44 && box.height >= 44, `project menu fits at ${width}px`).toBe(true)
  }
})

test("the navigation is a sheet below 900px and a sidebar from there", async ({ page }) => {
  await openExample(page, "en")
  await page.setViewportSize({ width: 899, height: 900 })
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible()
  await expect(page.getByRole("complementary", { name: "Project sidebar" })).toBeHidden()
  await page.setViewportSize({ width: 900, height: 900 })
  await expect(page.getByRole("complementary", { name: "Project sidebar" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeHidden()
})
