import { expect, test, type Page } from "@playwright/test"

import { PARTNER_CONTACT_URL, PARTNER_PLACEHOLDERS } from "../lib/landing/partners"
import { axeViolations } from "./support/axe"
import { text, type Lang } from "./support/dictionary"

/**
 * D-69: "Brought to you by" on the landing page, right below the methodology's screening
 * boundary. A slowly sliding row of placeholders; each opens a dialog with a link to the owner's
 * contact page. Moving cards are never "stable" for Playwright, so mouse clicks pause the strip
 * first, the way a person's pointer does by hovering it.
 */

const p = (lang: Lang, key: string) => text(lang, "landing", `closing.partners.${key}`)
const region = (page: Page, lang: Lang) => page.getByRole("region", { name: p(lang, "label") })
const cards = (page: Page, lang: Lang) => region(page, lang).getByRole("button", { name: `${p(lang, "placeholder")} ${p(lang, "cta")}` })

for (const lang of ["en", "de"] as Lang[]) {
  test(`the strip sits under the screening boundary and slides (${lang})`, async ({ page }) => {
    await page.goto(`/${lang}`)
    const strip = region(page, lang)
    await strip.scrollIntoViewIfNeeded()
    await expect(page.locator(".screening-boundary + .partners")).toHaveCount(1)
    await expect(cards(page, lang)).toHaveCount(PARTNER_PLACEHOLDERS)
    const track = strip.locator(".partners__track")
    await expect(track).toHaveCSS("animation-play-state", "running")
    await strip.getByRole("button", { name: p(lang, "pause") }).click()
    await expect(track).toHaveAttribute("data-paused", "true")
    // Away from the strip (no hover, no focus inside), Pause alone keeps it still.
    await page.mouse.move(0, 0)
    await page.locator("body").evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    await expect(track).toHaveCSS("animation-play-state", "paused")
    await strip.getByRole("button", { name: p(lang, "play") }).click()
    await page.mouse.move(0, 0)
    await page.locator("body").evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    await expect(track).toHaveCSS("animation-play-state", "running")
  })
}

test("a click on a card opens the partner dialog with the contact link, in a new tab", async ({ page }) => {
  await page.goto("/en")
  const strip = region(page, "en")
  await strip.scrollIntoViewIfNeeded()
  await strip.getByRole("button", { name: p("en", "pause") }).click()
  // Click the card nearest the row's middle, not a point measured once: Pause can be retried while
  // the strip still reveals, which re-aligns the page, and the middle can fall in the 16 px gap
  // between two cards.
  const all = strip.locator(".partner-card")
  const nearest = await all.evaluateAll((list) => {
    const row = list[0].closest(".partners__viewport")!.getBoundingClientRect()
    const middle = row.left + row.width / 2
    const distance = (card: Element) => {
      const box = card.getBoundingClientRect()
      return Math.abs(box.left + box.width / 2 - middle)
    }
    return list.reduce((best, card, index) => (distance(card) < distance(list[best]) ? index : best), 0)
  })
  await all.nth(nearest).click()

  const dialog = page.getByRole("dialog", { name: p("en", "dialog.title") })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText(p("en", "dialog.body"))
  const contact = dialog.getByRole("link", { name: `${p("en", "dialog.contact")} ${p("en", "dialog.newTab")}` })
  await expect(contact).toHaveAttribute("href", PARTNER_CONTACT_URL)
  await expect(contact).toHaveAttribute("target", "_blank")
  await expect(contact).toHaveAttribute("rel", "noopener noreferrer")
  expect(await axeViolations(page, { include: "[role=dialog]" }), "dialog open").toEqual([])

  await dialog.getByRole("button", { name: p("en", "dialog.close") }).click()
  await expect(dialog).toHaveCount(0)
})

test("by keyboard: the row goes back to its start, a card opens the dialog, Escape returns focus", async ({ page }) => {
  await page.goto("/en")
  const strip = region(page, "en")
  await strip.scrollIntoViewIfNeeded()
  await strip.getByRole("button", { name: p("en", "pause") }).focus()
  await page.keyboard.press("Tab")
  const first = cards(page, "en").first()
  await expect(first).toBeFocused()
  await expect(strip.locator(".partners__track")).toHaveCSS("animation-name", "none")
  await expect(first).toBeInViewport({ ratio: 1 })

  await page.keyboard.press("Enter")
  await expect(page.getByRole("dialog", { name: p("en", "dialog.title") })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(first).toBeFocused()
})

test("with reduced motion the strip stands still: one row of placeholders, no copies, no Pause", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/en")
  const strip = region(page, "en")
  await strip.scrollIntoViewIfNeeded()
  await expect(strip.locator(".partners__track")).toHaveCSS("animation-name", "none")
  await expect(strip.locator(".partner-card:visible")).toHaveCount(PARTNER_PLACEHOLDERS)
  await expect(strip.getByRole("button", { name: p("en", "pause") })).toBeHidden()
  await cards(page, "en").first().click()
  await expect(page.getByRole("dialog", { name: p("en", "dialog.title") })).toBeVisible()
})

test("axe finds nothing on the landing page, the strip included", async ({ page }) => {
  await page.goto("/en")
  await region(page, "en").scrollIntoViewIfNeeded()
  await region(page, "en").getByRole("button", { name: p("en", "pause") }).click()
  // A revealed block fades in over 700 ms; axe reads a block mid-fade as low-contrast text, so wait until every one has settled.
  await expect
    .poll(() => page.evaluate(() => [...document.querySelectorAll<HTMLElement>("[data-reveal].is-visible")].every((element) => getComputedStyle(element).opacity === "1")))
    .toBe(true)
  expect(await axeViolations(page)).toEqual([])
})
