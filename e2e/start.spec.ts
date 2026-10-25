import { expect, test } from "@playwright/test"

test.describe("start screen (PLAN-DASH-07 verification)", () => {
  test("open an example, reload, land on the start screen and continue", async ({ page }) => {
    const problems: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(message.text())
    })

    await page.goto("/en")
    await page.getByRole("link", { name: /Get Started/ }).first().click()
    await expect(page).toHaveURL(/\/en\/dashboard$/)
    await expect(page.getByRole("heading", { name: "Welcome to First Move" })).toBeVisible()

    await page.getByRole("button", { name: /Show 6 examples/ }).click()
    await page.locator('[data-example="housing-cooperatives"]').getByRole("button", { name: /Open a copy/ }).click()
    await expect(page).toHaveURL(/\/en\/dashboard\/overview$/)
    await expect(page.getByRole("status").filter({ hasText: /Saved/ })).toBeVisible()

    await page.reload()
    await expect(page.getByRole("heading", { level: 1, name: "Housing cooperatives with mixed ownership" })).toBeVisible()
    await expect(page.getByRole("region", { name: "Key numbers" })).toBeVisible()

    await page.goto("/en/dashboard")
    const card = page.getByRole("region", { name: "Housing cooperatives with mixed ownership" })
    await expect(card).toBeVisible()
    await card.getByRole("button", { name: "Continue" }).click()
    await expect(page).toHaveURL(/\/en\/dashboard\/overview$/)
    await expect(page.getByRole("link", { name: "Reality check" }).first()).toBeVisible()
    expect(problems).toEqual([])
  })

  // `ensureStatic = "navigation"` makes the first request wait for the page, so even the
  // first visit to an unknown step answers 404 (not a 200 App Shell).
  for (const area of ["quick-check", "business-plan"]) {
    test(`an unknown ${area} step shows the localized 404`, async ({ page }) => {
      const response = await page.goto(`/de/dashboard/${area}/nope-${Date.now()}`)
      expect(response?.status()).toBe(404)
      await expect(page.getByRole("heading", { level: 1, name: "Seite nicht gefunden" })).toBeVisible()
    })
  }
})
