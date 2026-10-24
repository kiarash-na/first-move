import { expect, type Page } from "@playwright/test"

import type { Lang } from "./dictionary"

export const EXAMPLE_ID = "housing-cooperatives"

/** Every dashboard page that needs an open project, as the sidebar lists them. */
export const PROJECT_PAGES = [
  "overview",
  "quick-check/area",
  "quick-check/buildings",
  "quick-check/sources",
  "quick-check/options",
  "quick-check/results",
  "assumptions",
  "business-plan/opportunity",
  "business-plan/business-logic",
  "business-plan/reality-check",
  "business-plan/implementation",
  "report",
] as const

/** localStorage key of the theme choice (lib/theme/theme.ts). */
const THEME_KEY = "first-move:theme"

/** Opens the start screen in the given theme and opens a copy of an example, ending on its overview. */
export async function openExample(page: Page, lang: Lang, theme: "dark" | "light" = "dark") {
  await page.goto(`/${lang}/dashboard`)
  if (theme === "light") {
    await page.evaluate((key) => localStorage.setItem(key, "light"), THEME_KEY)
    await page.reload()
  }
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme)
  await page.locator(`[data-example="${EXAMPLE_ID}"]`).getByRole("button").first().click()
  await expect(page).toHaveURL(new RegExp(`/${lang}/dashboard/overview$`))
}

/** Waits until the page's data is drawn (the gate's skeleton is gone) and the web fonts are in. */
export async function settle(page: Page) {
  await expect(page.locator("main [aria-busy='true']")).toHaveCount(0)
  await page.evaluate(() => document.fonts.ready)
}
