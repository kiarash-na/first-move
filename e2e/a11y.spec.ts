import { readFileSync } from "node:fs"
import path from "node:path"

import { expect, test, type Page } from "@playwright/test"

import { text, type Lang } from "./support/dictionary"
import { openExample, PROJECT_PAGES, settle } from "./support/session"

/**
 * PLAN-DASH-11 step 2, accessibility: axe (WCAG 2.2 AA, which includes the 4.5:1 contrast rule)
 * on every page in both themes, the keyboard path, visible focus and reduced motion.
 */

const AXE = readFileSync(path.join(process.cwd(), "node_modules/axe-core/axe.min.js"), "utf8")
const RULES = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]

interface Violation {
  id: string
  nodes: { target: string[]; failureSummary?: string }[]
}

async function violations(page: Page): Promise<string[]> {
  await page.addScriptTag({ content: AXE })
  const found = await page.evaluate(async (tags) => {
    const axe = (window as unknown as { axe: { run: (context: Document, options: object) => Promise<{ violations: Violation[] }> } }).axe
    return (await axe.run(document, { runOnly: tags })).violations
  }, RULES)
  return found.flatMap((violation) => violation.nodes.map((node) => `${violation.id}: ${node.target.join(" ")}`))
}

for (const theme of ["dark", "light"] as const) {
  for (const width of [375, 1440]) {
    test(`axe finds nothing on any dashboard page (${theme}, ${width}px)`, async ({ page }) => {
      test.setTimeout(240_000)
      await page.setViewportSize({ width, height: 900 })
      await openExample(page, "en", theme)
      for (const route of PROJECT_PAGES) {
        await page.goto(`/en/dashboard/${route}`)
        await settle(page)
        expect(await violations(page), route).toEqual([])
      }
      await page.goto("/en/dashboard")
      await settle(page)
      expect(await violations(page), "start screen").toEqual([])
    })
  }
}

test("axe finds nothing on the German overview and the public pages", async ({ page }) => {
  await openExample(page, "de")
  await settle(page)
  expect(await violations(page), "de overview").toEqual([])
  await page.goto("/de/docs")
  expect(await violations(page), "docs").toEqual([])
  await page.goto("/en/does-not-exist")
  expect(await violations(page), "404").toEqual([])
})

test.describe("keyboard", () => {
  for (const lang of ["en", "de"] as Lang[]) {
    test(`the first tab stop skips to the content, and every stop shows focus (${lang})`, async ({ page }) => {
      await openExample(page, lang)
      await settle(page)

      // A fresh load, so the tab order starts at the top of the page.
      await page.goto(page.url())
      await settle(page)
      await page.keyboard.press("Tab")
      const skip = page.getByRole("link", { name: text(lang, "shell", "skipToContent") })
      await expect(skip).toBeFocused()
      await expect(skip).toBeVisible()
      await page.keyboard.press("Enter")
      await expect(page.locator("#main")).toBeFocused()

      // Walk the first 40 tab stops from the top: each one has a visible focus indicator.
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
      for (let stop = 0; stop < 40; stop++) {
        await page.keyboard.press("Tab")
        const outline = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null
          if (!el || el === document.body) return null
          const style = getComputedStyle(el)
          const inside = el.closest("[data-slot], label, div")
          const inner = inside ? getComputedStyle(inside) : null
          const box = style.boxShadow !== "none" ? style.boxShadow : ""
          return {
            name: `${el.tagName.toLowerCase()} ${el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 30) ?? ""}`,
            width: parseFloat(style.outlineWidth),
            style: style.outlineStyle,
            box,
            wrapper: inner ? `${inner.outlineStyle} ${inner.outlineWidth}` : "",
            sr: el.matches(".sr-only"),
          }
        })
        if (!outline || outline.sr) continue
        const visible = (outline.style !== "none" && outline.width >= 2) || outline.box !== "" || /solid [1-9]/.test(outline.wrapper)
        expect(visible, `focus indicator on ${outline.name}`).toBe(true)
      }
    })
  }

  test("a dialog traps focus and Escape returns it to the menu button (project menu, rename)", async ({ page }) => {
    await openExample(page, "en")
    await settle(page)
    const trigger = page.getByRole("button", { name: new RegExp(`^${text("en", "shell", "projectMenu.label")}`) })
    await trigger.focus()
    await page.keyboard.press("Enter")
    await page.getByRole("menuitem", { name: text("en", "shell", "projectMenu.rename"), exact: true }).click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab")
      const where = await dialog.evaluate((node) => ({ inside: node.contains(document.activeElement), active: document.activeElement?.outerHTML.slice(0, 120) }))
      expect(where.inside, `Tab ${i + 1}: ${where.active}`).toBe(true)
    }
    await page.keyboard.press("Escape")
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
})

test.describe("every field has a name", () => {
  for (const route of PROJECT_PAGES) {
    test(`inputs, buttons and links on ${route} have an accessible name`, async ({ page }) => {
      await openExample(page, "en")
      await page.goto(`/en/dashboard/${route}`)
      await settle(page)
      const unnamed = await page.evaluate(() => {
        const bad: string[] = []
        for (const el of document.querySelectorAll<HTMLElement>("main input, main textarea, main select, main button, main a[href]")) {
          if (el.closest("[hidden], [inert], [aria-hidden='true']") || el.offsetParent === null) continue
          const labelled = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || (el as HTMLInputElement).labels?.length || el.textContent?.trim()
          if (!labelled) bad.push(el.outerHTML.slice(0, 120))
        }
        return bad
      })
      expect(unnamed).toEqual([])
    })
  }
})

test.describe("reduced motion", () => {
  test.use({ colorScheme: "dark", reducedMotion: "reduce" })

  test("transitions and animations are switched off and the charts draw at once", async ({ page }) => {
    await openExample(page, "en")
    await settle(page)
    const durations = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("main button, main a, main [data-slot]")].slice(0, 60).map((el) => {
        const style = getComputedStyle(el)
        return [style.transitionDuration, style.animationDuration].flatMap((value) => value.split(",").map((part) => parseFloat(part)))
      }),
    )
    for (const values of durations) for (const value of values) expect(value).toBeLessThan(0.01)

    // Recharts animates in JavaScript: with reduced motion its bars are in their final place on first paint.
    const bars = page.locator('[data-chart] .recharts-bar-rectangle path, [data-chart] .recharts-rectangle').first()
    await expect(bars).toBeVisible()
    const early = await bars.getAttribute("width")
    await page.waitForTimeout(1800)
    expect(await bars.getAttribute("width")).toBe(early)
  })
})
