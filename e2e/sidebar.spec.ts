import { expect, test, type Locator, type Page } from "@playwright/test"

import { axeViolations } from "./support/axe"
import { text } from "./support/dictionary"
import { hitAtCentre } from "./support/hit"
import { openExample, settle } from "./support/session"
import { IMPLEMENTATION, collapse, current, entry, nav, sidebar, toggle } from "./support/sidebar"

/**
 * PLAN-AGENT-02 (D-59): on desktop the sidebar collapses into an icon rail. The choice is kept in
 * `first-move:sidebar` and drawn before first paint; the mobile sheet stays as it is. The rail
 * where the browser draws classic scrollbars: `sidebar-scrollbars.spec.ts`.
 */

const KEY = "first-move:sidebar"
const BUILDINGS = "/en/dashboard/quick-check/buildings"
/** The open tooltip (a closing one stays in the DOM while it fades out). */
const tooltip = (page: Page) => page.locator('[role="tooltip"]:not([data-state="closed"])')

/**
 * Moves the pointer off the sidebar in steps, as a hand does: an open tooltip closes once the
 * pointer leaves the corridor to its content, which a single jump never reports.
 */
const moveAway = (page: Page) => page.mouse.move(800, 450, { steps: 5 })

/** Width of the desktop sidebar column, border included. */
const sidebarWidth = (page: Page) =>
  page.evaluate(() => document.querySelector("[data-slot=sidebar]")!.parentElement!.getBoundingClientRect().width)

async function openBuildings(page: Page, theme: "dark" | "light" = "dark") {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openExample(page, "en", theme)
  await page.goto(BUILDINGS)
  await settle(page)
}

test.describe("collapsible sidebar (D-59)", () => {
  test("the toggle collapses the sidebar into a 64px icon rail and back, and stores exactly that", async ({ page }) => {
    await openBuildings(page)
    expect(await sidebarWidth(page)).toBe(288)
    await expect(toggle(page, "collapse")).toHaveAttribute("aria-expanded", "true")
    await expect(toggle(page, "collapse")).toHaveAttribute("aria-controls", (await sidebar(page).getAttribute("id"))!)

    await collapse(page)
    expect(await sidebarWidth(page)).toBe(64)
    expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe("collapsed")
    // Icons only; the labels stay for screen readers, and the current page keeps its indicator.
    const buildings = entry(page, nav("items.quickCheck.buildings"))
    await expect(buildings).toHaveAttribute("aria-current", "page")
    expect((await buildings.boundingBox())!.width).toBe(63)
    await expect(buildings.locator("svg")).toBeVisible()
    await expect(sidebar(page).locator("#nav-section-quickCheck")).toHaveCSS("position", "absolute")
    await expect(sidebar(page).getByRole("list", { name: nav("sections.quickCheck") })).toBeVisible()

    await toggle(page, "expand").click()
    await expect(page.locator("html")).not.toHaveAttribute("data-sidebar")
    expect(await sidebarWidth(page)).toBe(288)
    expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBeNull()
    await expect(toggle(page, "collapse")).toBeFocused()
  })

  test("the toggle is a 44px button in the footer row above the privacy note, at the same x in both states", async ({ page }) => {
    await openBuildings(page)
    const privacy = sidebar(page).getByText(nav("privacy"))
    const expanded = (await toggle(page, "collapse").boundingBox())!
    expect(expanded.y + expanded.height).toBeLessThanOrEqual((await privacy.boundingBox())!.y)
    await collapse(page)
    const collapsed = (await toggle(page, "expand").boundingBox())!
    const shield = (await sidebar(page).getByRole("button", { name: nav("rail.privacy") }).boundingBox())!
    expect(collapsed.y + collapsed.height).toBeLessThanOrEqual(shield.y)
    expect(collapsed.x).toBe(expanded.x)
    expect([collapsed.width, collapsed.height, expanded.width, expanded.height]).toEqual([44, 44, 44, 44])
  })

  test("a reload keeps the rail at the same width from the first paint, with no layout shift", async ({ page }) => {
    await openBuildings(page)
    await collapse(page)
    await page.addInitScript(() => {
      const state = window as unknown as { __firstWidth?: number; __cls: number }
      state.__cls = 0
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
          if (!entry.hadRecentInput) state.__cls += entry.value
        }
      }).observe({ type: "layout-shift", buffered: true })
      // The frame that first paints the sidebar: rAF runs right before it, after the stylesheet is in.
      new MutationObserver((_, observer) => {
        const aside = document.querySelector("[data-slot=sidebar]")
        if (!aside) return
        observer.disconnect()
        requestAnimationFrame(() => {
          state.__firstWidth = aside.parentElement!.getBoundingClientRect().width
        })
      }).observe(document, { childList: true, subtree: true })
    })
    await page.reload()
    await settle(page)
    await page.waitForTimeout(800)
    const result = await page.evaluate(() => {
      const state = window as unknown as { __firstWidth?: number; __cls: number }
      return { first: state.__firstWidth, cls: state.__cls }
    })
    expect(result.first).toBe(64)
    expect(await sidebarWidth(page)).toBe(64)
    expect(result.cls).toBeLessThan(0.01)
    await expect(toggle(page, "expand")).toHaveAttribute("aria-expanded", "false")
  })

  test("without any JavaScript chunk, the static HTML and the pre-paint script already draw the rail", async ({ page }) => {
    await openBuildings(page)
    await collapse(page)
    await page.route(/\/_next\/static\/.+\.js(\?.*)?$/, (route) => route.abort())
    await page.reload()
    await expect(page.locator("html")).toHaveAttribute("data-sidebar", "collapsed")
    expect(await sidebarWidth(page)).toBe(64)
    await expect(sidebar(page).getByRole("link", { name: nav("start") }).locator("svg")).toBeVisible()
  })

  test("tooltips name the section and page on hover and on keyboard focus, only while collapsed", async ({ page }) => {
    await openBuildings(page)
    // Expanded: the labels are visible, so no tooltip.
    await entry(page, nav("items.quickCheck.sources")).hover()
    await page.waitForTimeout(400)
    await expect(tooltip(page)).toHaveCount(0)

    await collapse(page)
    await entry(page, nav("items.quickCheck.sources")).hover()
    await expect(tooltip(page)).toHaveText("Quick Check · Energy sources")
    const box = (await tooltip(page).boundingBox())!
    expect(box.x).toBeGreaterThanOrEqual(64)

    await moveAway(page)
    await expect(tooltip(page)).toHaveCount(0)
    await entry(page, nav("start")).focus()
    await page.keyboard.press("Tab")
    await expect(entry(page, nav("items.overview"))).toBeFocused()
    await expect(tooltip(page)).toHaveText("Project · Overview")
    await page.keyboard.press("Tab")
    await expect(tooltip(page)).toHaveText("Project · Assumptions")
  })

  test("the project and the privacy note become icons whose tooltips carry their text", async ({ page }) => {
    await openBuildings(page)
    await collapse(page)
    const project = sidebar(page).getByRole("button", { name: new RegExp(`^${nav("currentProject")}: `) })
    await project.hover()
    await expect(tooltip(page)).toHaveText(/Housing cooperatives/)
    await moveAway(page)
    await expect(tooltip(page)).toHaveCount(0)
    await sidebar(page).getByRole("button", { name: nav("rail.privacy") }).hover()
    await expect(tooltip(page)).toHaveText(nav("privacy"))
    await expect(sidebar(page).getByText(nav("privacy"))).toHaveCSS("position", "absolute")

    // Pressing the project icon opens the sidebar on the project details.
    await project.focus()
    await page.keyboard.press("Enter")
    await expect(page.locator("html")).not.toHaveAttribute("data-sidebar")
    await expect(page.locator("[data-slot=sidebar-project]")).toBeFocused()
    await expect(page.locator("[data-slot=sidebar-project]")).toContainText("Housing cooperatives")
  })

  test("expanding the rail keeps the current page in view, by the toggle and by the project and privacy icons (phase 11 QA item 8)", async ({
    page,
  }) => {
    test.setTimeout(120_000)
    await page.setViewportSize({ width: 1440, height: 900 })
    await openExample(page, "en")
    await page.goto(IMPLEMENTATION)
    await settle(page)
    const expanders = {
      toggle: () => toggle(page, "expand"),
      project: () => sidebar(page).getByRole("button", { name: new RegExp(`^${nav("currentProject")}: `) }),
      privacy: () => sidebar(page).getByRole("button", { name: nav("rail.privacy") }),
    }
    for (const [name, expander] of Object.entries(expanders)) {
      // A reload draws the rail at its own scroll position; the expanded list is taller.
      await collapse(page)
      await page.reload()
      await settle(page)
      await expect(toggle(page, "expand")).toHaveAttribute("aria-expanded", "false")
      await expander().click()
      await expect(page.locator("html")).not.toHaveAttribute("data-sidebar")
      await expect(current(page)).toHaveAttribute("href", IMPLEMENTATION)
      await expect.poll(() => hitAtCentre(current(page)), { message: `expanded by the ${name}` }).toBe(true)
    }
  })

  for (const theme of ["dark", "light"] as const) {
    test(`axe finds nothing with the sidebar expanded or collapsed (${theme})`, async ({ page }) => {
      test.setTimeout(120_000)
      await openBuildings(page, theme)
      expect(await axeViolations(page), "expanded").toEqual([])
      await collapse(page)
      expect(await axeViolations(page), "collapsed").toEqual([])
      await entry(page, nav("items.quickCheck.buildings")).focus()
      await expect(tooltip(page)).toBeVisible()
      // Radix portals tooltips to <body>, outside the landmarks, as every tooltip in the app.
      expect(await axeViolations(page, { except: ["region"] }), "collapsed, tooltip open").toEqual([])
      await page.goto("/en/dashboard/overview")
      await settle(page)
      expect(await axeViolations(page), "collapsed overview").toEqual([])
    })
  }

  for (const width of [900, 1440]) {
    test(`no horizontal overflow at ${width}px, expanded or collapsed`, async ({ page }) => {
      test.setTimeout(120_000)
      await openBuildings(page)
      await page.setViewportSize({ width, height: 900 })
      for (const state of ["expanded", "collapsed"] as const) {
        if (state === "collapsed") await collapse(page)
        for (const route of ["overview", "quick-check/buildings", "business-plan/reality-check", ""]) {
          await page.goto(`/en/dashboard${route ? `/${route}` : ""}`)
          await settle(page)
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
          expect(overflow, `${route || "start"} ${state} at ${width}px`).toBe(0)
        }
        expect(await sidebarWidth(page)).toBe(state === "collapsed" ? 64 : 288)
      }
    })
  }

  test("the mobile sheet stays as it is while the desktop sidebar is collapsed", async ({ page }) => {
    await openBuildings(page)
    await page.setViewportSize({ width: 375, height: 800 })

    const box = async (locator: Locator) => {
      const { x, y, width, height } = (await locator.boundingBox())!
      return [x, y, width, height].map(Math.round)
    }
    const measure = async () => {
      await page.getByRole("button", { name: nav("open") }).click()
      const sheet = page.getByRole("dialog", { name: nav("title") })
      await expect(sheet).toBeVisible()
      // Wait until the sheet has slid in.
      await sheet.evaluate((node) => Promise.all(node.getAnimations({ subtree: true }).map((animation) => animation.finished)))
      const link = sheet.getByRole("link", { name: nav("items.quickCheck.buildings"), exact: true })
      const result = {
        sheet: await box(sheet),
        link: await box(link),
        label: await link.innerText(),
        title: await sheet.locator("#nav-section-quickCheck").isVisible(),
        railButtons: await sheet.getByRole("button", { name: new RegExp(`${nav("rail.collapse")}|${nav("rail.expand")}|${nav("rail.privacy")}`) }).count(),
      }
      await page.keyboard.press("Escape")
      await expect(sheet).toHaveCount(0)
      return result
    }

    const expanded = await measure()
    await page.evaluate((key) => localStorage.setItem(key, "collapsed"), KEY)
    await page.reload()
    await settle(page)
    await expect(page.locator("html")).toHaveAttribute("data-sidebar", "collapsed")
    const collapsed = await measure()
    expect(collapsed).toEqual(expanded)
    expect(collapsed.label).toContain(nav("items.quickCheck.buildings"))
    expect(collapsed.title).toBe(true)
    expect(collapsed.railButtons).toBe(0)
  })
})

test.describe("cookie notice next to the rail", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("sits past the sidebar at its current width, so it never covers the rail (D-59)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/en/dashboard")
    const notice = page.getByRole("region", { name: text("en", "legal", "cookieNotice.label"), exact: true })
    await expect(notice).toBeVisible()
    expect((await notice.boundingBox())!.x).toBe(304)
    await collapse(page)
    await expect.poll(async () => (await notice.boundingBox())!.x).toBe(80)
  })
})
