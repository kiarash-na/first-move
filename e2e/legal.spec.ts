import { expect, test, type Page } from "@playwright/test"

import { axeViolations } from "./support/axe"
import { text, type Lang } from "./support/dictionary"
import { NOTICE_ACK_KEY } from "./support/notice"

/**
 * PLAN-DASH-12: the six legal pages, the footers that link them and the cookie notice.
 * The suites start with the notice dismissed (playwright.config.ts); the notice tests opt out.
 */

const SLUGS = ["terms", "privacy", "cookies", "imprint", "ai", "license"] as const
const LANGS: Lang[] = ["en", "de"]
const THEME_KEY = "first-move:theme"

const label = (lang: Lang, slug: (typeof SLUGS)[number]) => text(lang, "legal", `docs.${slug}`)

async function overflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
}

for (const lang of LANGS) {
  test.describe(`legal pages (${lang})`, () => {
    for (const slug of SLUGS) {
      test(`/${lang}/${slug} loads with its title, the footer and the page language`, async ({ page }) => {
        const response = await page.goto(`/${lang}/${slug}`)
        expect(response?.status()).toBe(200)
        await expect(page.locator("html")).toHaveAttribute("lang", lang)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(text(lang, slug, "title"))
        const footer = page.getByRole("contentinfo")
        for (const other of SLUGS) {
          await expect(footer.getByRole("link", { name: label(lang, other), exact: true })).toHaveAttribute("href", `/${lang}/${other}`)
        }
        await expect(footer.getByRole("link", { name: text(lang, "legal", "footer.source") })).toHaveAttribute(
          "href",
          "https://github.com/kiarash-na/first-move",
        )
        const body = await page.locator("main").innerText()
        expect(body).not.toMatch(/\{\{|undefined|\[object/)
      })
    }

    test("the Imprint names the provider, the P.O. box, the VAT ID and both mailboxes", async ({ page }) => {
      await page.goto(`/${lang}/imprint`)
      const main = page.locator("main")
      for (const fact of ["Kiarash N.A.", "Postfach 13 02 66", "20102 Hamburg", "DE365576746", "human@mail.firstmove.energy", "agent@mail.firstmove.energy"]) {
        await expect(main).toContainText(fact)
      }
      await expect(main).toContainText(lang === "de" ? "Deutschland" : "Germany")
    })

    test("the AI page says the AI features are available (AI_FEATURES_LIVE, D-82)", async ({ page }) => {
      await page.goto(`/${lang}/ai`)
      await expect(page.getByRole("note").first()).toContainText(text(lang, "ai", "status.live"))
      await expect(page.locator("#plan-score")).toBeAttached()
      await page.goto(`/${lang}/privacy`)
      await expect(page.locator("#ai-plan-score")).toBeAttached()
    })

    test("the Licence page lists the packages, and the Cookie Policy lists every storage name", async ({ page }) => {
      await page.goto(`/${lang}/license`)
      await expect(page.getByRole("link", { name: "next", exact: true })).toBeVisible()
      await expect(page.getByRole("cell", { name: "OFL-1.1" }).first()).toBeVisible()
      await page.goto(`/${lang}/cookies`)
      const main = page.locator("main")
      for (const name of ["NEXT_LOCALE", "first-move:theme", "first-move:sidebar", "first-move:notice-ack", "first-move:active-project", "first-move:storage"]) {
        await expect(main).toContainText(name)
      }
    })

    test("a legal page makes no request to any other server", async ({ page }) => {
      const foreign: string[] = []
      page.on("request", (request) => {
        const url = new URL(request.url())
        if (url.protocol.startsWith("http") && url.hostname !== "localhost") foreign.push(request.url())
      })
      for (const slug of SLUGS) await page.goto(`/${lang}/${slug}`, { waitUntil: "networkidle" })
      expect(foreign).toEqual([])
    })
  })
}

for (const width of [375, 768, 1440]) {
  test(`no legal page scrolls sideways at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const lang of LANGS) {
      for (const slug of SLUGS) {
        await page.goto(`/${lang}/${slug}`)
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
        expect(await overflow(page), `${lang}/${slug} at ${width}px`).toBe(0)
      }
    }
  })
}

for (const theme of ["dark", "light"] as const) {
  for (const width of [375, 1440]) {
    test(`axe finds nothing on the legal pages (${theme}, ${width}px)`, async ({ page }) => {
      test.setTimeout(180_000)
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [THEME_KEY, theme])
      for (const lang of LANGS) {
        for (const slug of SLUGS) {
          await page.goto(`/${lang}/${slug}`)
          await expect(page.locator("html")).toHaveAttribute("data-theme", theme)
          expect(await axeViolations(page), `${lang}/${slug}`).toEqual([])
        }
      }
    })
  }
}

test.describe("footers", () => {
  for (const width of [375, 1440]) {
    test(`the landing footer links the legal pages at ${width}px (EN and DE)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const lang of LANGS) {
        await page.goto(`/${lang}`)
        const nav = page.getByRole("navigation", { name: text(lang, "landing", "closing.footer.legal.nav") })
        for (const slug of SLUGS) {
          await expect(nav.getByRole("link", { name: label(lang, slug), exact: true })).toHaveAttribute("href", `/${lang}/${slug}`)
        }
        await expect(nav.getByRole("link", { name: text(lang, "landing", "closing.footer.legal.source") })).toBeVisible()
      }
    })
  }

  test("the legal links lead to working pages from the landing footer", async ({ page }) => {
    await page.goto("/en")
    await page.getByRole("navigation", { name: "Legal" }).getByRole("link", { name: label("en", "imprint"), exact: true }).click()
    await expect(page).toHaveURL(/\/en\/imprint$/)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Imprint")
  })
})

test.describe("cookie notice", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  // Exact: the Cookie Policy has a section whose title ("The cookie notice") contains the notice's name.
  const region = (page: Page, lang: Lang) =>
    page.getByRole("region", { name: text(lang, "legal", "cookieNotice.label"), exact: true })

  test("shows bottom left on the landing page, and stays away once dismissed", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/en")
    const notice = region(page, "en")
    await expect(notice).toBeVisible()
    await expect(notice).toContainText(text("en", "legal", "cookieNotice.text"))
    const box = (await notice.boundingBox())!
    expect(box.x).toBeLessThan(40)
    expect(box.y + box.height).toBeGreaterThan(900 - 40)

    await page.getByRole("button", { name: text("en", "legal", "cookieNotice.dismiss") }).click()
    await expect(notice).toHaveCount(0)
    expect(await page.evaluate((key) => localStorage.getItem(key), NOTICE_ACK_KEY)).toBe("1")

    await page.reload()
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible()
    await expect(region(page, "en")).toHaveCount(0)
    await page.goto("/de/privacy")
    await expect(region(page, "de")).toHaveCount(0)
  })

  test("is in German on German pages and links both policies", async ({ page }) => {
    await page.goto("/de/terms")
    const notice = region(page, "de")
    await expect(notice).toBeVisible()
    await expect(notice.getByRole("link", { name: text("de", "legal", "cookieNotice.cookies") })).toHaveAttribute("href", "/de/cookies")
    await expect(notice.getByRole("link", { name: text("de", "legal", "cookieNotice.privacy") })).toHaveAttribute("href", "/de/privacy")
    await notice.getByRole("link", { name: text("de", "legal", "cookieNotice.cookies") }).click()
    await expect(page).toHaveURL(/\/de\/cookies$/)
  })

  test("can be dismissed with the keyboard", async ({ page }) => {
    await page.goto("/en/cookies")
    const button = page.getByRole("button", { name: text("en", "legal", "cookieNotice.dismiss") })
    await expect(button).toBeVisible()
    await button.focus()
    await page.keyboard.press("Enter")
    await expect(region(page, "en")).toHaveCount(0)
  })

  test("sits past the dashboard sidebar on desktop and at the left edge on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/en/dashboard")
    const desktop = (await region(page, "en").boundingBox())!
    expect(desktop.x).toBeGreaterThanOrEqual(288)

    await page.setViewportSize({ width: 375, height: 800 })
    const phone = (await region(page, "en").boundingBox())!
    expect(phone.x).toBeLessThan(40)
    expect(phone.x + phone.width).toBeLessThanOrEqual(375)
  })

  for (const theme of ["dark", "light"] as const) {
    test(`axe finds nothing with the notice open (${theme})`, async ({ page }) => {
      await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [THEME_KEY, theme])
      await page.goto("/en/privacy")
      await expect(region(page, "en")).toBeVisible()
      expect(await axeViolations(page)).toEqual([])
    })
  }
})
