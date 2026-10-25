import { readFileSync } from "node:fs"
import path from "node:path"

import { expect, test, type Page } from "@playwright/test"

import { axeViolations } from "./support/axe"
import { text, type Lang } from "./support/dictionary"

/**
 * PLAN-PRESENTATION-00: the ten-slide presentation at /{lang}/presentation, its keyboard and
 * deep links, the footer links to it, accessibility at desktop and phone width, and the QR code.
 */

const LANGS: Lang[] = ["en", "de"]
const COUNT = 10
const JSQR = readFileSync(path.join(process.cwd(), "node_modules/jsqr/dist/jsQR.js"), "utf8")
const OUTCOME = (JSON.parse(readFileSync(path.join(process.cwd(), "dictionaries/en/presentation.json"), "utf8")) as { slides: { aiEngine: { outcome: { text: string }[] } } }).slides.aiEngine.outcome

/** The deck on screen: after a client-side language switch the previous route stays mounted, hidden. */
const deck = (page: Page) => page.locator(".deck:visible")
const slide = (page: Page, number: number) => deck(page).locator(`.deck-slide[data-number="${number}"]`)

/** Opens a URL and waits until the deck has hydrated: then every slide but the current one is inert. */
async function open(page: Page, url: string) {
  const response = await page.goto(url)
  await expect(deck(page).locator(".deck-slide[inert]")).toHaveCount(COUNT - 1)
  return response
}

async function expectOnSlide(page: Page, number: number) {
  await expect(page).toHaveURL(new RegExp(`#${number}$`))
  await expect(slide(page, number)).toHaveAttribute("data-state", "active")
  await expect(slide(page, number)).toBeVisible()
}

async function overflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
}

test.use({ reducedMotion: "reduce" })

for (const lang of LANGS) {
  test(`/${lang}/presentation has ten slides, its own title and shows one slide at a time`, async ({ page }) => {
    const response = await open(page, `/${lang}/presentation`)
    expect(response?.status()).toBe(200)
    await expect(page.locator("html")).toHaveAttribute("lang", lang)
    await expect(page).toHaveTitle(`${text(lang, "presentation", "meta.title")} · First Move`)
    await expect(deck(page).locator(`section[aria-roledescription="${text(lang, "presentation", "deck.slide")}"]`)).toHaveCount(COUNT)
    await expect(slide(page, 1)).toBeVisible()
    for (let number = 2; number <= COUNT; number++) await expect(slide(page, number)).toBeHidden()
    await expect(page.getByRole("heading", { level: 2, name: new RegExp(text(lang, "presentation", "slides.why.headline")) })).toBeVisible()
  })
}

test("the keyboard moves through the deck and the live region names each slide", async ({ page }) => {
  await open(page, "/en/presentation")
  await page.keyboard.press("ArrowRight")
  await expectOnSlide(page, 2)
  await expect(deck(page).locator("[aria-live='polite'].sr-only")).toHaveText(`Slide 2 of 10: ${text("en", "presentation", "slides.challenge.title")}`)
  await page.keyboard.press("Space")
  await expectOnSlide(page, 3)
  await page.keyboard.press("Shift+Space")
  await expectOnSlide(page, 2)
  await page.keyboard.press("PageDown")
  await expectOnSlide(page, 3)
  await page.keyboard.press("End")
  await expectOnSlide(page, 10)
  await page.keyboard.press("ArrowRight")
  await expectOnSlide(page, 10)
  await page.keyboard.press("Home")
  await expectOnSlide(page, 1)
  await page.getByRole("button", { name: text("en", "presentation", "deck.next") }).click()
  await expectOnSlide(page, 2)
  await page.getByRole("button", { name: "Slide 9: Next moves" }).click()
  await expectOnSlide(page, 9)
  await expect(slide(page, 9)).toBeFocused()
})

test("a deep link opens its slide, survives a reload and the language switch keeps it", async ({ page }) => {
  await open(page, "/en/presentation#5")
  await expectOnSlide(page, 5)
  await expect(slide(page, 1)).toBeHidden()
  await page.reload()
  await expectOnSlide(page, 5)
  await page.getByRole("link", { name: "DE, Deutsch" }).click()
  await expect(page).toHaveURL(/\/de\/presentation#5$/)
  await expect(page.locator("html")).toHaveAttribute("lang", "de")
  await expect(slide(page, 5)).toHaveAttribute("aria-label", /^5 von 10/)
  await expectOnSlide(page, 5)
})

test("the jury criteria jump to the slide that answers them", async ({ page }) => {
  await open(page, "/en/presentation#2")
  await page.getByRole("button", { name: /Risks and validation/ }).click()
  await page.getByRole("button", { name: "Go to slide 5" }).click()
  await expectOnSlide(page, 5)
})

test("the blind test replays the recorded run and then reveals the known outcome with sources", async ({ page }) => {
  await open(page, "/en/presentation#5")
  const current = slide(page, 5)
  await expect(current.getByText(OUTCOME[0].text)).toHaveCount(0)
  await current.getByRole("button", { name: text("en", "presentation", "slides.aiEngine.run") }).click()
  await current.getByRole("button", { name: text("en", "presentation", "slides.aiEngine.reveal") }).click()
  for (const item of OUTCOME) await expect(current.getByText(item.text)).toBeVisible()
  const sources = current.getByRole("link", { name: text("en", "presentation", "slides.aiEngine.sourceLink"), exact: true })
  await expect(sources).toHaveCount(OUTCOME.length)
  for (const source of await sources.all()) await expect(source).toHaveAttribute("rel", "noopener noreferrer")
  await expect(current).toContainText(text("en", "presentation", "slides.aiEngine.caveat"))
})

test("the QR code on the last slide decodes to exactly the owner's link", async ({ page }) => {
  await open(page, "/en/presentation#10")
  await page.addScriptTag({ content: JSQR })
  const decoded = await page.evaluate(async () => {
    const svg = document.querySelector<SVGSVGElement>(".qr")
    if (!svg) return null
    const clone = svg.cloneNode(true) as SVGSVGElement
    const drawn = svg.querySelectorAll("rect, path")
    clone.querySelectorAll("rect, path").forEach((element, index) => element.setAttribute("fill", getComputedStyle(drawn[index]).fill))
    const size = 480
    clone.setAttribute("width", String(size))
    clone.setAttribute("height", String(size))
    const image = new Image()
    await new Promise((resolve, reject) => {
      image.onload = resolve
      image.onerror = reject
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`
    })
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext("2d")
    if (!context) return null
    context.drawImage(image, 0, 0, size, size)
    const pixels = context.getImageData(0, 0, size, size)
    const jsQR = (window as unknown as { jsQR: (data: Uint8ClampedArray, width: number, height: number) => { data: string } | null }).jsQR
    return jsQR(pixels.data, size, size)?.data ?? null
  })
  expect(decoded).toBe("https://kiarash.online/link")
  const slash = slide(page, 10).getByRole("link", { name: "/1Slash" })
  await expect(slash).toHaveAttribute("href", "https://1sla.sh/")
  await expect(slash).toHaveAttribute("rel", "noopener noreferrer")
})

for (const lang of LANGS) {
  test(`the landing footer and the site footer link the presentation (${lang})`, async ({ page }) => {
    await page.goto(`/${lang}/imprint`)
    await expect(page.getByRole("contentinfo").getByRole("link", { name: text(lang, "legal", "presentation"), exact: true })).toHaveAttribute(
      "href",
      `/${lang}/presentation`,
    )
    await page.goto(`/${lang}`)
    const link = page.locator("footer.site-footer").getByRole("link", { name: text(lang, "landing", "presentation.footer"), exact: true })
    await expect(link).toHaveAttribute("href", `/${lang}/presentation`)
    await link.click()
    await expect(page).toHaveURL(new RegExp(`/${lang}/presentation$`))
    await expect(slide(page, 1)).toBeVisible()
  })
}

test("at phone width the select is the index and no slide scrolls sideways", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await open(page, "/en/presentation")
  const select = page.getByRole("combobox", { name: text("en", "presentation", "deck.index") })
  await expect(select).toBeVisible()
  await expect(page.locator(".deck-dots")).toBeHidden()
  for (let number = 1; number <= COUNT; number++) {
    await select.selectOption(String(number - 1))
    await expectOnSlide(page, number)
    expect(await overflow(page), `slide ${number}`).toBe(0)
    expect(await slide(page, number).evaluate((element) => element.scrollWidth - element.clientWidth), `slide ${number}`).toBe(0)
  }
})

for (const width of [1440, 390]) {
  test(`axe finds nothing on any slide (${width}px)`, async ({ page }) => {
    test.setTimeout(180_000)
    await page.setViewportSize({ width, height: width > 500 ? 900 : 844 })
    for (let number = 1; number <= COUNT; number++) {
      await open(page, `/en/presentation#${number}`)
      await expectOnSlide(page, number)
      expect(await axeViolations(page), `slide ${number}`).toEqual([])
    }
  })
}

test("axe finds nothing in the German deck after the interactions", async ({ page }) => {
  test.setTimeout(120_000)
  await open(page, "/de/presentation#5")
  const current = slide(page, 5)
  await current.getByRole("button", { name: text("de", "presentation", "slides.aiEngine.run") }).click()
  expect(await axeViolations(page), "scored").toEqual([])
  await current.getByRole("button", { name: text("de", "presentation", "slides.aiEngine.reveal") }).click()
  expect(await axeViolations(page), "revealed").toEqual([])
  await open(page, "/de/presentation#7")
  await slide(page, 7).locator(".guard__sample").nth(1).click()
  expect(await axeViolations(page), "guard").toEqual([])
})
