import { expect, test } from "@playwright/test"

import { AI_DOC_SLUGS, docHref, visibleDocs } from "../lib/docs/pages"
import { axeViolations } from "./support/axe"
import { text, type Lang } from "./support/dictionary"

/**
 * PLAN-AGENT-04: the public docs. Every visible page answers in both languages, each in its own
 * language (D-32); the AI pages answer 404 and are never linked while the AI features
 * are off (`AI_FEATURES_LIVE`). The lists come from `lib/docs/pages.ts`, so the AI pages join
 * these tests by themselves when the flag flips (A08).
 */

const THEME_KEY = "first-move:theme"
const visible = visibleDocs()
const hidden = AI_DOC_SLUGS.filter((slug) => !visible.includes(slug))

for (const lang of ["en", "de"] as Lang[]) {
  test(`every visible docs page loads in ${lang}, with the page list and no link to a hidden page`, async ({ page }) => {
    for (const slug of visible) {
      const response = await page.goto(docHref(lang, slug))
      expect(response?.status(), slug).toBe(200)
      await expect(page.locator("html")).toHaveAttribute("lang", lang)
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(text(lang, "docs", `pages.${slug}.title`))
      const nav = page.getByRole("navigation", { name: text(lang, "docs", "nav.label") })
      await expect(nav.getByRole("link")).toHaveCount(visible.length)
      for (const other of hidden) await expect(page.locator(`a[href$="/docs/${other}"]`), `${slug} links ${other}`).toHaveCount(0)
      expect(await page.locator("main").innerText(), slug).not.toMatch(/\{\{|undefined|\[object|<AiOnly/)
    }
  })

  test(`the AI docs pages answer 404 in ${lang} while the AI features are off`, async ({ page }) => {
    test.skip(hidden.length === 0, "the AI features are live")
    for (const slug of hidden) expect((await page.goto(docHref(lang, slug)))?.status(), slug).toBe(404)
  })
}

test("a German docs page shows the German page, without the English-only note", async ({ page }) => {
  await page.goto("/de/docs/data-and-privacy")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(text("de", "docs", "pages.data-and-privacy.title"))
  await expect(page.getByRole("note").filter({ hasText: text("de", "docs", "page.englishOnly") })).toHaveCount(0)
  await expect(page.getByRole("heading", { level: 1 }).locator("xpath=..")).not.toHaveAttribute("lang", "en")
})

for (const theme of ["dark", "light"] as const) {
  test(`axe finds nothing on two docs pages (${theme})`, async ({ page }) => {
    await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [THEME_KEY, theme])
    for (const path of ["/en/docs", "/de/docs/quick-check"]) {
      await page.goto(path)
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme)
      expect(await axeViolations(page), path).toEqual([])
    }
  })
}
