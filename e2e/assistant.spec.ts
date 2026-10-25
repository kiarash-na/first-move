import { expect, test, type Page, type Route } from "@playwright/test"

import { AI_FEATURES_LIVE } from "../lib/legal/ai"
import { axeViolations } from "./support/axe"
import { text } from "./support/dictionary"
import { openExample, settle } from "./support/session"

/**
 * PLAN-AGENT-05 (A05): the in-app AI assistant. A 48px Bot launcher bottom right on dashboard
 * pages, a side sheet (full screen on phones), key setup with the required spending-limit and
 * expiry notice, and a chat whose proposals apply only from a review card. The provider is
 * mocked with `page.route`, so no request leaves the machine. The launcher exists only while
 * `AI_FEATURES_LIVE` is on; until A08 flips it, only the first test runs (A09 runs the rest).
 */

const t = (key: string) => text("en", "assistant", key)
const OPENROUTER_KEY = `sk-or-v1-${"5e".repeat(32)}`
const launcher = (page: Page) => page.locator("[data-slot='agent-launcher']")
const panel = (page: Page) => page.getByRole("dialog", { name: t("panel.title") })

/** One OpenAI-compatible stream chunk, as OpenRouter sends it. */
const chunk = (delta: object, finish: string | null = null) =>
  `data: ${JSON.stringify({ id: "gen-e2e", object: "chat.completion.chunk", created: 1792900000, model: "openrouter/auto", choices: [{ index: 0, delta, finish_reason: finish }] })}\n\n`
/** The browser calls OpenRouter cross-origin, so the mocked answers carry CORS headers, preflights included. */
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET, POST, OPTIONS" }
const preflight = (route: Route) => route.request().method() === "OPTIONS" && route.fulfill({ status: 204, headers: CORS })
const sse = (route: Route, events: string[]) =>
  route.fulfill({ status: 200, headers: { ...CORS, "content-type": "text/event-stream" }, body: events.join("") + "data: [DONE]\n\n" })

/** OpenRouter mocked: the key check, then a proposal for `buildings.total`, then a short answer. */
async function mockOpenRouter(page: Page, total: number) {
  const bodies: Record<string, unknown>[] = []
  await page.route("https://openrouter.ai/api/v1/key", async (route) => {
    if (await preflight(route)) return
    await route.fulfill({ headers: CORS, json: { data: { limit: 5, limit_remaining: 5, limit_reset: "monthly", usage: 0, expires_at: "2026-12-31T00:00:00Z" } } })
  })
  await page.route("https://openrouter.ai/api/v1/chat/completions", async (route) => {
    if (await preflight(route)) return
    bodies.push(route.request().postDataJSON() as Record<string, unknown>)
    if (bodies.length === 1) {
      const call = { index: 0, id: "call_e2e", type: "function", function: { name: "propose_values", arguments: JSON.stringify({ values: [{ field: "buildings.total", value: total, quote: `${total} buildings` }] }) } }
      return sse(route, [chunk({ tool_calls: [call] }), chunk({}, "tool_calls")])
    }
    return sse(route, [chunk({ content: `I prepared **${total} buildings** for your review.` }), chunk({}, "stop")])
  })
  return bodies
}

async function connectOpenRouter(page: Page) {
  await launcher(page).click()
  await expect(panel(page)).toBeVisible()
  await panel(page).getByRole("radio", { name: new RegExp(t("providers.openrouter")) }).check()
  await panel(page).getByLabel(t("setup.key.label")).fill(OPENROUTER_KEY)
  await expect(panel(page).getByRole("button", { name: t("setup.use") })).toBeDisabled()
  await panel(page).getByRole("checkbox", { name: t("notice.ack") }).check()
  await panel(page).getByRole("button", { name: t("setup.use") }).click()
  await expect(panel(page).getByText(t("setup.active").split(":")[0])).toBeVisible()
  await panel(page).getByRole("button", { name: t("panel.back") }).click()
}

test.describe("AI assistant (A05)", () => {
  test("stays dark while AI_FEATURES_LIVE is off", async ({ page }) => {
    test.skip(AI_FEATURES_LIVE, "The switch is on: the tests below cover the live assistant.")
    await openExample(page, "en")
    await settle(page)
    await expect(launcher(page)).toHaveCount(0)
    const requests: string[] = []
    page.on("request", (request) => requests.push(request.url()))
    await page.goto("/en/dashboard/quick-check/area")
    await settle(page)
    expect(requests.filter((url) => /openrouter\.ai|ai-gateway\.vercel\.sh/.test(url))).toEqual([])
  })

  test.describe("live", () => {
    test.skip(!AI_FEATURES_LIVE, "Runs once A08 sets AI_FEATURES_LIVE (A09).")

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
    })

    test("shows a 48px Bot launcher bottom right that opens a side sheet and closes with Esc", async ({ page }) => {
      await openExample(page, "en")
      await settle(page)
      const box = (await launcher(page).boundingBox())!
      expect(box.width).toBe(48)
      expect(box.height).toBe(48)
      expect(1440 - (box.x + box.width)).toBeLessThanOrEqual(24)
      expect(900 - (box.y + box.height)).toBeLessThanOrEqual(24)
      await expect(launcher(page)).toHaveAccessibleName(t("launcher.open"))

      await launcher(page).click()
      await expect(panel(page)).toBeVisible()
      const sheet = (await panel(page).boundingBox())!
      expect(sheet.width).toBeLessThanOrEqual(480)
      expect(sheet.x + sheet.width).toBeGreaterThanOrEqual(1439)
      await expect(panel(page).getByRole("region", { name: t("notice.title") })).toBeVisible()
      await page.keyboard.press("Escape")
      await expect(panel(page)).toBeHidden()
      await expect(launcher(page)).toBeFocused()
    })

    test("connects a key behind the notice, and applies a proposal only from the review card", async ({ page }) => {
      await openExample(page, "en")
      await page.goto("/en/dashboard/quick-check/area")
      await settle(page)
      const field = page.locator("[data-field='buildings.total'] input")
      const before = Number(await field.inputValue())
      const total = before + 7
      const bodies = await mockOpenRouter(page, total)
      await connectOpenRouter(page)

      const message = panel(page).getByLabel(t("chat.label"))
      await message.fill(`We now have ${total} buildings`)
      await message.press("Enter")
      const card = panel(page).getByRole("region", { name: t("review.title") })
      await expect(card).toBeVisible()
      await expect(panel(page).locator("li[data-ai-generated='true']")).toContainText(t("chat.aiLabel"))
      // With messages and a review card on screen: the log wraps the message list.
      await expect(panel(page).getByRole("log", { name: t("panel.title") }).getByRole("listitem").first()).toBeVisible()
      expect(await axeViolations(page)).toEqual([])
      expect(bodies[0]).toMatchObject({ model: "openrouter/auto", provider: { data_collection: "deny" } })
      await expect(field).toHaveValue(String(before))

      await card.getByRole("button", { name: t("review.apply") }).click()
      await expect(card.getByRole("status")).toContainText("1")
      await expect(field).toHaveValue(String(total))
    })

    test("fills the screen on a phone", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await openExample(page, "en")
      await settle(page)
      await launcher(page).click()
      const sheet = (await panel(page).boundingBox())!
      expect(sheet.width).toBe(390)
      expect(sheet.height).toBe(844)
      await panel(page).getByRole("button", { name: t("panel.close") }).click()
      await expect(launcher(page)).toBeFocused()
    })

    test("keeps Tab and Shift+Tab inside the full-screen panel on a phone", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await openExample(page, "en")
      await settle(page)
      await launcher(page).click()
      await expect(panel(page)).toHaveAttribute("aria-modal", "true")
      const inside = () => panel(page).evaluate((node) => node.contains(document.activeElement))
      for (const key of [...Array<string>(20).fill("Shift+Tab"), ...Array<string>(20).fill("Tab")]) {
        await page.keyboard.press(key)
        expect(await inside(), key).toBe(true)
      }
      await expect(launcher(page)).not.toBeFocused()
    })

    test("never moves focus to the launcher the open panel covers (desktop)", async ({ page }) => {
      await openExample(page, "en")
      await settle(page)
      await launcher(page).click()
      await expect(panel(page)).toHaveAttribute("aria-modal", "false")
      await panel(page).getByRole("button", { name: t("panel.close") }).focus()
      await page.keyboard.press("Shift+Tab")
      await expect(launcher(page)).not.toBeFocused()
      await panel(page).getByRole("button", { name: t("panel.close") }).focus()
      for (let step = 0; step < 20; step++) {
        await page.keyboard.press("Tab")
        await expect(launcher(page)).not.toBeFocused()
      }
    })

    for (const theme of ["dark", "light"] as const) {
      test(`axe finds nothing with the panel open (${theme})`, async ({ page }) => {
        await openExample(page, "en", theme)
        await settle(page)
        await launcher(page).click()
        await expect(panel(page)).toBeVisible()
        expect(await axeViolations(page)).toEqual([])
      })
    }
  })
})
