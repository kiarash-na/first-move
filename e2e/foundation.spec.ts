import { expect, test } from "@playwright/test"

test.describe("locale routing (PLAN-DASH-01)", () => {
  test("/ redirects to /en by default and stores the choice", async ({ page, context }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    const cookies = await context.cookies()
    expect(cookies.find((c) => c.name === "NEXT_LOCALE")?.value).toBe("en")
  })

  test("/ follows the browser language", async ({ browser }) => {
    const context = await browser.newContext({ locale: "de-DE" })
    const page = await context.newPage()
    await page.goto("/")
    await expect(page).toHaveURL(/\/de$/)
    await context.close()
  })

  test("/de renders the landing in dark", async ({ page }) => {
    await page.goto("/de")
    await expect(page.locator("html")).toHaveAttribute("lang", "de")
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
    await expect(page.locator(".site-shell")).toBeVisible()
  })

  test("unknown URLs show the global 404", async ({ page }) => {
    const response = await page.goto("/en/does-not-exist")
    expect(response?.status()).toBe(404)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })
})

test.describe("dashboard shell", () => {
  test("renders in dark and switches to light, and the choice survives a reload", async ({ page }) => {
    await page.goto("/en/dashboard")
    const html = page.locator("html")
    await expect(html).toHaveAttribute("data-theme", "dark")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()

    await page.getByRole("button", { name: "Switch to light theme" }).click()
    await expect(html).toHaveAttribute("data-theme", "light")

    await page.reload()
    await expect(html).toHaveAttribute("data-theme", "light")
    await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible()
  })

  test("the language switch keeps the page and sets NEXT_LOCALE", async ({ page, context }) => {
    await page.goto("/en/dashboard")
    await page.getByRole("link", { name: "Deutsch" }).click()
    await expect(page).toHaveURL(/\/de\/dashboard$/)
    await expect(page.locator("html")).toHaveAttribute("lang", "de")
    const cookies = await context.cookies()
    expect(cookies.find((c) => c.name === "NEXT_LOCALE")?.value).toBe("de")
  })
})

test.describe("docs", () => {
  test("the index shows the coming-soon page", async ({ page }) => {
    await page.goto("/de/docs")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  // The status is 200 on the first request for an unlisted param (the static shell has
  // already streamed) and 404 once cached, so assert the UI and noindex instead.
  test("an unknown slug shows the localized 404", async ({ page }) => {
    await page.goto("/de/docs/missing")
    await expect(page.getByRole("heading", { level: 1, name: "Seite nicht gefunden" })).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex")
  })
})
