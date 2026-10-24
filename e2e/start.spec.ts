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

    await page.locator('[data-example="housing-cooperatives"]').getByRole("button", { name: /Open a copy/ }).click()
    await expect(page).toHaveURL(/\/en\/dashboard\/overview$/)
    await expect(page.getByRole("status").filter({ hasText: /Saved/ })).toBeVisible()

    await page.reload()
    await expect(page.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible()

    await page.goto("/en/dashboard")
    const card = page.getByRole("region", { name: "Housing cooperatives with mixed ownership" })
    await expect(card).toBeVisible()
    await card.getByRole("button", { name: "Continue" }).click()
    await expect(page).toHaveURL(/\/en\/dashboard\/overview$/)
    await expect(page.getByRole("link", { name: "Reality check" }).first()).toBeVisible()
    expect(problems).toEqual([])
  })

  test("an unknown step shows the localized 404", async ({ page }) => {
    await page.goto("/de/dashboard/quick-check/nope")
    await expect(page.getByRole("heading", { level: 1, name: "Seite nicht gefunden" })).toBeVisible()
  })
})
