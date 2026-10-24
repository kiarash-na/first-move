import { readFileSync } from "node:fs"

import { expect, test, type Page } from "@playwright/test"

import { literal, text, type Lang } from "./support/dictionary"

/**
 * PLAN-DASH-11 step 1: the whole journey in each language, and once more in the light theme.
 * start → open an example → overview → edit a Quick Check and a Business Plan field → export →
 * reload → delete the project → import the export. Texts come from the dictionaries (DE merged
 * over EN, D-32); fields are found by their registry id.
 */

const EXAMPLE = "housing-cooperatives"
const QC_FIELD = "buildings.total"
const BP_FIELD = "site.location"
const BP_VALUE = "Hafenviertel, Quartier 4"

interface Run {
  lang: Lang
  theme: "dark" | "light"
}

const RUNS: Run[] = [
  { lang: "en", theme: "dark" },
  { lang: "de", theme: "dark" },
  { lang: "en", theme: "light" },
]

const saved = /^(saved|storage-warning)$/

async function waitSaved(page: Page) {
  await expect(page.locator("[data-status]").first()).toHaveAttribute("data-status", saved)
}

/** Chromium's software GL (headless) reports performance warnings for the landing 3D scene; they are not app messages. */
const BROWSER_NOISE = /GL Driver Message|WebGL/

function expectNoProblems(problems: string[]) {
  expect(problems.filter((problem) => !BROWSER_NOISE.test(problem)), "console errors and warnings").toEqual([])
}

for (const { lang, theme } of RUNS) {
  test(`journey in ${lang.toUpperCase()}, ${theme} theme`, async ({ page }, testInfo) => {
    const t = (area: string, key: string) => text(lang, area, key)
    const problems: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") problems.push(`${message.type()}: ${message.text()}`)
    })
    page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`))

    // 1 · start: the landing page opens the dashboard.
    await page.goto(`/${lang}`)
    await expect(page.locator("html")).toHaveAttribute("lang", lang)
    await page.locator(`a[href="/${lang}/dashboard"]`).first().click()
    await expect(page).toHaveURL(new RegExp(`/${lang}/dashboard$`))
    await expect(page.getByRole("heading", { name: t("start", "continue.welcomeTitle") })).toBeVisible()
    // The theme is the stored preference: switch once on the dashboard, it then survives every step.
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
    if (theme === "light") {
      await page.getByRole("button", { name: t("common", "theme.switchToLight") }).click()
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light")
    }

    // 2 · open an example (a copy).
    await page.locator(`[data-example="${EXAMPLE}"]`).getByRole("button", { name: t("start", "examples.open") }).click()
    await expect(page).toHaveURL(new RegExp(`/${lang}/dashboard/overview$`))
    const name = await page.getByRole("heading", { level: 1 }).first().innerText()
    expect(name.length).toBeGreaterThan(3)

    // 3 · overview: verdict, key numbers, charts.
    await expect(page.locator("#overview-verdict")).toBeVisible()
    await expect(page.getByRole("region", { name: t("overview", "sections.kpis") })).toBeVisible()
    await expect(page.locator("[data-chart]").first()).toBeVisible()

    // 4a · edit a Quick Check field, then see the live result react.
    await page.getByRole("link", { name: t("shell", "nav.items.quickCheck.area"), exact: true }).first().click()
    await expect(page).toHaveURL(/quick-check\/area$/)
    const buildings = page.locator(`[data-field="${QC_FIELD}"] input`)
    await expect(buildings).toBeVisible()
    const before = await buildings.inputValue()
    const next = String(Number(before) + 1)
    await buildings.fill(next)
    await buildings.blur()
    await expect(buildings).toHaveValue(next)
    await waitSaved(page)

    // 4b · edit a Business Plan field.
    await page.getByRole("link", { name: t("shell", "nav.items.businessPlan.opportunity"), exact: true }).first().click()
    await expect(page).toHaveURL(/business-plan\/opportunity$/)
    const location = page.locator(`[id="field-${BP_FIELD}"]`)
    await location.fill(BP_VALUE)
    await expect(location).toHaveValue(BP_VALUE)
    await waitSaved(page)

    // The overview shows the changed number of buildings (the density card reads it).
    await page.getByRole("link", { name: t("shell", "nav.items.overview"), exact: true }).first().click()
    await expect(page).toHaveURL(/overview$/)

    // 5 · export: a .firstmove.json with the edited inputs and no results.
    const download = page.waitForEvent("download")
    await page.getByRole("button", { name: t("shell", "topBar.export"), exact: true }).click()
    const file = await download
    expect(file.suggestedFilename()).toMatch(/\.firstmove\.json$/)
    const exportPath = testInfo.outputPath("export.firstmove.json")
    await file.saveAs(exportPath)
    const exported = JSON.parse(readFileSync(exportPath, "utf8")) as {
      format: string
      project: { meta: { id: string; name: string }; buildings: { total: number }; site: { location: string } }
    }
    expect(exported.project.buildings.total).toBe(Number(next))
    expect(exported.project.site.location).toBe(BP_VALUE)
    expect(JSON.stringify(exported)).not.toMatch(/verdict|coverage/i)

    // 6 · reload: everything is still there.
    await page.reload()
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible()
    await page.goto(`/${lang}/dashboard/quick-check/area`)
    await expect(page.locator(`[data-field="${QC_FIELD}"] input`)).toHaveValue(next)
    await page.goto(`/${lang}/dashboard/business-plan/opportunity`)
    await expect(page.locator(`[id="field-${BP_FIELD}"]`)).toHaveValue(BP_VALUE)
    if (theme === "light") await expect(page.locator("html")).toHaveAttribute("data-theme", "light")

    // 7 · delete the project (confirm), then the start screen has no project card for it.
    await page.getByRole("button", { name: new RegExp(`^${literal(t("shell", "projectMenu.label"))}`) }).click()
    await page.getByRole("menuitem", { name: t("shell", "projectMenu.delete"), exact: true }).click()
    await page.getByRole("button", { name: t("shell", "delete.confirm"), exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/${lang}/dashboard$`))
    await expect(page.getByText(t("shell", "delete.done").replace("{name}", name))).toBeVisible()
    await expect(page.getByRole("region", { name })).toHaveCount(0)

    // 8 · import the export: the same data is back.
    await page.locator('input[type="file"]').first().setInputFiles(exportPath)
    await expect(page.getByText(t("shell", "importFlow.done").replace("{name}", name))).toBeVisible()
    await page.goto(`/${lang}/dashboard/quick-check/area`)
    await expect(page.locator(`[data-field="${QC_FIELD}"] input`)).toHaveValue(next)
    await page.goto(`/${lang}/dashboard/business-plan/opportunity`)
    await expect(page.locator(`[id="field-${BP_FIELD}"]`)).toHaveValue(BP_VALUE)
    await waitSaved(page)

    // The re-export carries the same inputs as the first one.
    await page.goto(`/${lang}/dashboard/overview`)
    const second = page.waitForEvent("download")
    await page.getByRole("button", { name: t("shell", "topBar.export"), exact: true }).click()
    const again = testInfo.outputPath("again.firstmove.json")
    await (await second).saveAs(again)
    const reexported = JSON.parse(readFileSync(again, "utf8")) as typeof exported
    expect(reexported.project.meta.name).toBe(exported.project.meta.name)
    expect(reexported.project.buildings).toEqual(exported.project.buildings)
    expect(reexported.project.site).toEqual(exported.project.site)

    expectNoProblems(problems)
  })
}
