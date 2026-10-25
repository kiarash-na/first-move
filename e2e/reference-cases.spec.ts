import { expect, test } from "@playwright/test"

import { headingId } from "../lib/docs/heading-id"
import { REFERENCE_CASE_CATALOG } from "../lib/examples/reference-cases/catalog"
import { text, type Lang } from "./support/dictionary"

/**
 * D-76: the reference cases from Vienna sit at the very bottom of the start screen, collapsed.
 * Each card links to its section of the public docs page, and opening one creates a copy that is
 * marked as an example. Both languages.
 */
const name = (lang: Lang, index: number) => {
  const card = REFERENCE_CASE_CATALOG[index]
  return card.name[lang] ?? card.name.en
}

for (const lang of ["en", "de"] as Lang[]) {
  const copy = (key: string) => text(lang, "start", `referenceCases.${key}`)

  test(`the reference cases come last and collapsed, and open as a copy (${lang})`, async ({ page }) => {
    const problems: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(message.text())
    })

    await page.goto(`/${lang}/dashboard`)
    const section = page.locator('[data-slot="reference-cases-gallery"]')
    await expect(section.getByRole("heading", { name: copy("title") })).toBeVisible()
    // The very last section of the start screen, after the examples.
    await expect(page.locator('[data-slot="examples-gallery"] ~ [data-slot="reference-cases-gallery"]')).toHaveCount(1)
    await expect(page.locator('[data-slot="reference-cases-gallery"] ~ *')).toHaveCount(0)
    await expect(section.getByRole("article")).toHaveCount(0)

    await section.getByRole("button", { name: copy("show").replace("{count}", "6") }).click()
    await expect(section.getByRole("article")).toHaveCount(6)
    await expect(section.locator('[data-kind="fictional"]').getByText(copy("disclaimer"))).toHaveCount(3)
    await expect(section.locator('[data-kind="real"]').getByText(copy("disclaimer"))).toHaveCount(0)

    const strongFictional = section.getByRole("article", { name: name(lang, 3) })
    await strongFictional.getByRole("button", { name: copy("open") }).click()
    await expect(page).toHaveURL(new RegExp(`/${lang}/dashboard/overview$`))
    await expect(page.getByRole("heading", { level: 1, name: name(lang, 3) })).toBeVisible()
    await expect(page.locator('[data-slot="illustrative"]').first()).toBeVisible()
    expect(problems).toEqual([])
  })

  test(`a reference card links to its section of the docs page (${lang})`, async ({ page }) => {
    await page.goto(`/${lang}/dashboard`)
    const section = page.locator('[data-slot="reference-cases-gallery"]')
    await section.getByRole("button", { name: copy("show").replace("{count}", "6") }).click()
    const card = section.getByRole("article", { name: name(lang, 0) })
    await card.getByRole("link", { name: copy("sources") }).click()
    await expect(page).toHaveURL(new RegExp(`/${lang}/docs/reference-cases#${headingId(name(lang, 0))}$`))
    await expect(page.getByRole("heading", { level: 2, name: name(lang, 0) })).toBeVisible()
  })
}
