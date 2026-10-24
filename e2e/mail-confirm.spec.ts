import { expect, test } from "@playwright/test"

import { axeViolations } from "./support/axe"
import { text, type Lang } from "./support/dictionary"

/**
 * PLAN-AGENT-06 step 8: the consent page behind the confirm email's link, and the two mail
 * endpoints as the outside sees them. The agent stays off here (no configuration, or switched
 * off), so nothing reaches a workflow; the confirm request is answered by a stub where a test
 * needs a result.
 */

const THEME_KEY = "first-move:theme"
const TOKEN = "v1.AAAAAAAAAAAAAAAAAAAAAA.1999999999.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"

for (const lang of ["en", "de"] as Lang[]) {
  test(`/${lang}/mail/confirm asks for the link without a token, and stays out of search engines`, async ({ page }) => {
    const response = await page.goto(`/${lang}/mail/confirm`)
    expect(response?.status()).toBe(200)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(text(lang, "mail", "confirm.title"))
    await expect(page.getByText(text(lang, "mail", "confirm.missing"))).toBeVisible()
    await expect(page.getByRole("button", { name: text(lang, "mail", "confirm.button") })).toHaveCount(0)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow")
  })
}

test("opening the link confirms nothing; the box and the button do", async ({ page }) => {
  const posts: string[] = []
  await page.route("**/api/mail/confirm", async (route) => {
    posts.push(route.request().postData() ?? "")
    await route.fulfill({ status: 200 })
  })
  await page.goto(`/en/mail/confirm#t=${TOKEN}`)
  const button = page.getByRole("button", { name: text("en", "mail", "confirm.button") })
  await expect(button).toBeDisabled()
  expect(posts).toEqual([])

  await page.getByLabel(text("en", "mail", "confirm.accept")).check()
  await button.click()
  await expect(page.getByText(text("en", "mail", "confirm.result.confirmed"))).toBeVisible()
  expect(posts).toEqual([JSON.stringify({ token: TOKEN })])
  await expect(page.getByRole("link", { name: text("en", "mail", "confirm.terms") })).toHaveCount(0)
})

test("an answer from the real endpoint shows as copy, never as a raw error", async ({ page }) => {
  await page.goto(`/en/mail/confirm#t=${TOKEN}`)
  await page.getByLabel(text("en", "mail", "confirm.accept")).check()
  await page.getByRole("button", { name: text("en", "mail", "confirm.button") }).click()
  // Unconfigured (404) or switched off (503): both read as "try again later", and the form stays.
  await expect(page.getByText(text("en", "mail", "confirm.result.error"))).toBeVisible()
  await expect(page.getByRole("button", { name: text("en", "mail", "confirm.button") })).toBeVisible()
})

test("the mail endpoints take POST only and tell a stranger nothing", async ({ request }) => {
  for (const endpoint of ["/api/mail/inbound", "/api/mail/confirm"]) {
    expect((await request.get(endpoint)).status(), endpoint).toBe(405)
  }
  const inbound = await request.post("/api/mail/inbound", { data: { type: "inbox.email.received" } })
  expect([400, 404]).toContain(inbound.status())
  expect(await inbound.text()).toBe("")
  const confirm = await request.post("/api/mail/confirm", { data: { token: TOKEN } })
  expect([403, 404, 503]).toContain(confirm.status())
  expect(await confirm.text()).toBe("")
})

for (const theme of ["dark", "light"] as const) {
  test(`axe finds nothing on the confirm page (${theme})`, async ({ page }) => {
    await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [THEME_KEY, theme])
    await page.goto(`/en/mail/confirm#t=${TOKEN}`)
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme)
    await expect(page.getByRole("button", { name: text("en", "mail", "confirm.button") })).toBeVisible()
    expect(await axeViolations(page)).toEqual([])
  })
}
