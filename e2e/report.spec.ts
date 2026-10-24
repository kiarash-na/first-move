import { expect, test } from "@playwright/test"

import { text } from "./support/dictionary"
import { openExample, settle } from "./support/session"

/**
 * D-09, D-70: the Report button opens a light, printable report of the open project; the
 * browser's print dialog saves it as a PDF. On paper only the sheet prints.
 */

const report = (key: string, lang: "en" | "de" = "en") => text(lang, "report", key)

test("the Report button opens the report of the open project", async ({ page }) => {
  await openExample(page, "en")
  await page.getByRole("toolbar", { name: text("en", "shell", "topBar.label") }).getByRole("link", { name: text("en", "shell", "topBar.report") }).click()
  await expect(page).toHaveURL(/\/en\/dashboard\/report$/)
  await settle(page)
  const sheet = page.locator("[data-slot=report]")
  await expect(sheet).toHaveAttribute("data-theme", "light")
  await expect(sheet.getByRole("heading", { level: 1 })).toBeVisible()
  for (const key of ["sections.quickCheck", "sections.inputs", "sections.parameters", "sections.calculation", "sections.businessPlan", "sections.readiness"]) {
    await expect(sheet.getByRole("region", { name: report(key) })).toBeVisible()
  }
  await expect(sheet.locator("math").first()).toBeAttached()
  await expect(page.getByRole("button", { name: report("toolbar.print") })).toBeVisible()
})

test("on paper only the sheet prints: no sidebar, top bar, toolbar or info buttons", async ({ page }) => {
  await openExample(page, "en")
  await page.goto("/en/dashboard/report")
  await settle(page)
  await page.emulateMedia({ media: "print" })
  await expect(page.locator("[data-slot=sidebar]")).toBeHidden()
  await expect(page.getByRole("toolbar", { name: text("en", "shell", "topBar.label") })).toBeHidden()
  await expect(page.getByRole("toolbar", { name: report("toolbar.label") })).toBeHidden()
  await expect(page.locator("[data-slot=report]")).toBeVisible()
  await expect(page.locator("[data-slot=report] button[aria-label^='" + text("en", "calc", "ui.info") + "']").first()).toBeHidden()
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe("light")
})

test("the report saves as a multi-page A4 PDF", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "page.pdf() is Chromium only")
  await openExample(page, "en")
  await page.goto("/en/dashboard/report")
  await settle(page)
  const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true })
  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-")
  const pages = pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []
  expect(pages.length).toBeGreaterThan(3)
})

test("German: the report follows the page language", async ({ page }) => {
  await openExample(page, "de")
  await page.goto("/de/dashboard/report")
  await settle(page)
  await expect(page.locator("html")).toHaveAttribute("lang", "de")
  await expect(page.getByRole("button", { name: report("toolbar.print", "de") })).toBeVisible()
})

test("without an open project, Report is disabled and the report page says no project is open", async ({ page }) => {
  await page.goto("/en/dashboard")
  await expect(page.getByRole("toolbar", { name: text("en", "shell", "topBar.label") }).getByRole("button", { name: text("en", "shell", "topBar.report") })).toBeDisabled()
  await page.goto("/en/dashboard/report")
  await expect(page.getByRole("heading", { name: text("en", "shell", "gate.noProject.title") })).toBeVisible()
  await expect(page.locator("[data-slot=report]")).toHaveCount(0)
})
