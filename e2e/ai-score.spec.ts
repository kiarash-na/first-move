import path from "node:path"

import { expect, test, type Page } from "@playwright/test"

import { axeViolations } from "./support/axe"
import { text } from "./support/dictionary"
import { openExample, settle } from "./support/session"
import { current, entry, nav, sidebar } from "./support/sidebar"

/**
 * PLAN-AI-SCORE-00 step 6 (D-71): the AI Plan Score page. It opens from the last Business Plan
 * entry, says first that it is a separate AI opinion, asks for a Gateway key that stays in memory,
 * and shows a saved score from an imported project. No request leaves the browser here: the
 * fixture was scored by the engine with the mock Jev and the mock text model
 * (`e2e/fixtures/ai-score.firstmove.json`, checked by `test-utils/e2e-fixture.test.ts`).
 */

const FIXTURE = path.join(process.cwd(), "e2e", "fixtures", "ai-score.firstmove.json")
const FIXTURE_NAME = "AI Plan Score fixture"
const ai = (key: string) => text("en", "ai-score", key)

async function openFromSidebar(page: Page) {
  const link = entry(page, nav("items.businessPlan.aiScore"))
  await link.click()
  await expect(page).toHaveURL(/\/en\/dashboard\/ai-score$/)
  await settle(page)
}

test.describe("AI Plan Score (D-71)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
  })

  test("opens from the last Business Plan entry, says it is separate and asks for a key", async ({ page }) => {
    await openExample(page, "en")
    const links = sidebar(page).getByRole("navigation", { name: nav("label") }).getByRole("link")
    await expect(links.last()).toHaveAccessibleName(nav("items.businessPlan.aiScore"))
    await openFromSidebar(page)
    await expect(current(page)).toHaveAccessibleName(nav("items.businessPlan.aiScore"))

    await expect(page.getByRole("heading", { level: 1, name: ai("title") })).toBeVisible()
    const notice = page.getByRole("complementary", { name: ai("intro.title") })
    await expect(notice).toContainText(ai("intro.points.calculation"))
    await expect(notice).toContainText(ai("intro.points.verdict"))
    await expect(notice.getByRole("link", { name: ai("intro.docs") })).toHaveAttribute("href", "/en/docs/ai-plan-score")

    const key = page.getByLabel(ai("setup.key.label"))
    await expect(key).toHaveAttribute("type", "password")
    await expect(key).toHaveAttribute("autocomplete", "off")
    await expect(page.getByRole("button", { name: ai("run.start") })).toBeDisabled()
    await expect(page.locator("[data-slot='decision-flow']")).toHaveAttribute("data-mode", "idle")
    await expect(page.locator("[data-slot='ai-score-results']")).toHaveCount(0)
  })

  for (const theme of ["dark", "light"] as const) {
    test(`axe finds nothing on the page (${theme})`, async ({ page }) => {
      await openExample(page, "en", theme)
      await openFromSidebar(page)
      expect(await axeViolations(page)).toEqual([])
    })
  }

  test("shows a saved score and its decision flow after importing a scored project", async ({ page }) => {
    await page.goto("/en/dashboard")
    await page.locator('input[type="file"]').first().setInputFiles(FIXTURE)
    await expect(page.getByText(text("en", "shell", "importFlow.done").replace("{name}", FIXTURE_NAME))).toBeVisible()
    await openFromSidebar(page)

    const results = page.locator("[data-slot='ai-score-results']")
    // The result view itself is tested with its component; here: the saved score reaches it and shows.
    await expect(results).toBeVisible()
    await expect(results).toHaveAttribute("data-score", /^\d+(\.\d+)?$/)
    const flow = page.locator("[data-slot='decision-flow']")
    await expect(flow).toHaveAttribute("data-mode", "saved")
    await expect(flow.locator("[data-flow-node='signal:quick-check']")).toBeVisible()
    await expect(flow.locator("[data-flow-node^='gate:']").first()).toBeVisible()
    await expect(page.getByRole("button", { name: ai("run.again") })).toBeDisabled()

    // A node opens its details, and Escape closes them again.
    await flow.locator("[data-flow-node='judgement:financing']").click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).toHaveCount(0)

    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
    expect(await axeViolations(page)).toEqual([])
  })
})
