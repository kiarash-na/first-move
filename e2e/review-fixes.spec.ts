import { expect, test, type Page } from "@playwright/test"

import { hitAtCentre } from "./support/hit"
import { openExample, settle } from "./support/session"

/**
 * Final review fixes (phase 11 note): focused share cells are never hidden under the sticky sum
 * bar (WCAG 2.2 2.4.11), the sidebar shows the current page, clearing shares asks first (D-02)
 * and a rejected number never leaves its typed prefix in the project.
 */

/** True when the focused element is what the user sees at its centre (not covered by another layer). */
async function focusedIsVisible(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el) return false
    const box = el.getBoundingClientRect()
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
    return hit !== null && (hit === el || el.contains(hit))
  })
}

for (const [width, height] of [
  [375, 740],
  [1440, 900],
] as const) {
  test(`every focused share cell is visible above the sum bar at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000)
    await page.setViewportSize({ width, height })
    await openExample(page, "en")
    await page.goto("/en/dashboard/quick-check/buildings")
    await settle(page)
    const cells = page.locator("[data-slot=share-grid] input")
    await expect(cells).toHaveCount(25)
    // Start above the grid, then tab through it as a keyboard user does.
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.locator("[data-slot=share-grid] h2").click()
    const seen: string[] = []
    for (let step = 0; step < 60 && seen.length < 25; step++) {
      await page.keyboard.press("Tab")
      const inGrid = await page.evaluate(() => Boolean(document.activeElement?.closest("[data-slot=share-grid]")) && document.activeElement?.tagName === "INPUT")
      if (!inGrid) continue
      const name = await page.evaluate(() => document.activeElement?.getAttribute("id") ?? "")
      seen.push(name)
      await expect.poll(() => focusedIsVisible(page), { message: `share cell ${seen.length} visible`, timeout: 2_000 }).toBe(true)
    }
    expect(seen).toHaveLength(25)
  })
}

test("the sidebar scrolls the current page into view at 1440 × 900", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openExample(page, "en")
  for (const route of ["business-plan/reality-check", "business-plan/implementation"]) {
    await page.goto(`/en/dashboard/${route}`)
    await settle(page)
    const link = page.locator(`aside nav a[aria-current="page"]`).first()
    await expect(link).toHaveAttribute("href", `/en/dashboard/${route}`)
    await expect.poll(() => hitAtCentre(link), { message: route }).toBe(true)
  }
})

test("clearing all shares asks first (D-02)", async ({ page }) => {
  await openExample(page, "en")
  await page.goto("/en/dashboard/quick-check/buildings")
  await settle(page)
  const sum = page.locator("[data-slot=share-sum]")
  await expect(sum).toHaveAttribute("data-state", "exact")
  await page.getByRole("button", { name: "Clear all shares" }).click()
  const dialog = page.getByRole("alertdialog", { name: "Clear all shares?" })
  await expect(dialog).toBeVisible()
  await dialog.getByRole("button", { name: "Keep them" }).click()
  await expect(sum).toHaveAttribute("data-state", "exact")
  await page.getByRole("button", { name: "Clear all shares" }).click()
  await page.getByRole("alertdialog").getByRole("button", { name: "Clear shares" }).click()
  await expect(sum).toHaveAttribute("data-state", "empty")
})

test("a rejected number keeps the value from before the edit, not its typed prefix", async ({ page }) => {
  await openExample(page, "en")
  await page.goto("/en/dashboard/quick-check/area")
  await settle(page)
  const total = page.locator("[data-field='buildings.total'] input")
  const density = page.locator("[data-slot=density-preview]")
  const before = await total.inputValue()
  const densityBefore = (await density.textContent()) ?? ""
  await total.fill("")
  await total.pressSequentially("100001")
  await expect(page.locator("[data-field='buildings.total'] [role=alert]")).toBeVisible()
  // The live density still uses the old total, not 10000 (the prefix typed on the way).
  await expect(density).toHaveText(densityBefore)
  await total.blur()
  // Away and back inside the app (client navigation, the same open project).
  await page.locator(`aside nav a[href="/en/dashboard/quick-check/buildings"]`).click()
  await expect(page).toHaveURL(/quick-check\/buildings$/)
  await page.locator(`aside nav a[href="/en/dashboard/quick-check/area"]`).click()
  await settle(page)
  await expect(density).toHaveText(densityBefore)
  await page.reload()
  await settle(page)
  await expect(total).toHaveValue(before)
})
