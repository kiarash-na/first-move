import { expect, test, type Locator } from "@playwright/test"

import { hitAtCentre } from "./support/hit"
import { openExample, settle } from "./support/session"
import { IMPLEMENTATION, collapse, current, entry, nav, scroller, toggle } from "./support/sidebar"

/**
 * PLAN-AGENT-02 (D-59): in the 64px rail the navigation still overflows at laptop heights. Where
 * the browser draws classic scrollbars (Chrome and Edge on Windows), a scrollbar would take a
 * quarter of the rail and push its icons off the line of the others, so the rail hides it and
 * still scrolls. The expanded sidebar keeps its scrollbar.
 */

// Headless Chromium hides scrollbars; without that switch it draws classic 15px ones. It is a
// launch option, so Playwright allows it only for a whole file (a worker of its own).
test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } })

/** Width the scroller's scrollbar takes from its content. */
const gutter = (locator: Locator) => locator.evaluate((el) => (el as HTMLElement).offsetWidth - el.clientWidth)

const centreX = async (locator: Locator) => {
  const box = (await locator.boundingBox())!
  return box.x + box.width / 2
}

test("at 1366 × 768 the rail's navigation scrolls without a scrollbar, its icons in line with the toggle", async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 1366, height: 768 })
  await openExample(page, "en")
  await page.goto(IMPLEMENTATION)
  await settle(page)
  // Expanded, the navigation keeps its scrollbar: this browser does draw classic ones.
  expect(await gutter(scroller(page)), "expanded").toBeGreaterThan(0)

  await collapse(page)
  await page.reload()
  await settle(page)
  await expect(toggle(page, "expand")).toHaveAttribute("aria-expanded", "false")
  const rail = scroller(page)
  expect(await rail.evaluate((el) => el.scrollHeight - el.clientHeight), "the rail's list overflows").toBeGreaterThan(0)
  expect(await gutter(rail), "collapsed").toBe(0)
  // revealActiveLink still scrolls the current page into view.
  await expect.poll(() => hitAtCentre(current(page))).toBe(true)
  // Every entry spans the rail, its icon in line with the toggle (a scrollbar shifted them by about 8px).
  const line = await centreX(toggle(page, "expand"))
  for (const link of await rail.getByRole("link").all()) {
    expect((await link.boundingBox())!.width).toBe(63)
    expect(Math.abs((await centreX(link.locator("svg"))) - line)).toBeLessThanOrEqual(1)
  }

  // The wheel scrolls it.
  await rail.evaluate((el) => (el.scrollTop = 0))
  await entry(page, nav("start")).hover()
  await page.mouse.wheel(0, 400)
  await expect.poll(() => rail.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)

  // So does the keyboard: tabbing to the entry below the fold brings it into view.
  await entry(page, nav("items.businessPlan.reality-check")).evaluate((el) => (el as HTMLElement).focus({ preventScroll: true }))
  await rail.evaluate((el) => (el.scrollTop = 0))
  expect(await hitAtCentre(current(page)), "below the fold").toBe(false)
  await page.keyboard.press("Tab")
  await expect(current(page)).toBeFocused()
  await expect.poll(() => hitAtCentre(current(page))).toBe(true)
})
