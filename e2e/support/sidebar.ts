import { expect, type Page } from "@playwright/test"

import { text } from "./dictionary"

/** The last entry: with both modules on, it sits below the fold of the expanded sidebar at 1440 × 900. */
export const IMPLEMENTATION = "/en/dashboard/business-plan/implementation"

/** A `shell.nav.*` text in English. */
export const nav = (key: string) => text("en", "shell", `nav.${key}`)

/** The desktop sidebar landmark. */
export const sidebar = (page: Page) => page.getByRole("complementary", { name: nav("sidebar") })
/** The rail toggle, named by what it does next. */
export const toggle = (page: Page, action: "collapse" | "expand") => sidebar(page).getByRole("button", { name: nav(`rail.${action}`) })
/** A sidebar entry by its label. */
export const entry = (page: Page, name: string) => sidebar(page).getByRole("link", { name, exact: true })
/** The current page's entry. */
export const current = (page: Page) => sidebar(page).locator('nav a[aria-current="page"]')
/** The sidebar's own scroller around the navigation. */
export const scroller = (page: Page) => sidebar(page).getByRole("navigation", { name: nav("label") }).locator("..")

/** Collapses the expanded sidebar with its toggle and waits until React reports the rail. */
export async function collapse(page: Page) {
  await toggle(page, "collapse").click()
  await expect(page.locator("html")).toHaveAttribute("data-sidebar", "collapsed")
  await expect(toggle(page, "expand")).toHaveAttribute("aria-expanded", "false")
}
