import { defineConfig, devices } from "@playwright/test"

/**
 * E2E against a production build (Playwright guide). Chromium comes preinstalled
 * (PLAYWRIGHT_BROWSERS_PATH); `@playwright/test` is pinned to match it.
 * Set E2E_PORT when several worktrees run e2e at once (D-35).
 */
const port = Number(process.env.E2E_PORT ?? 3100)
const baseURL = `http://localhost:${port}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm build && pnpm start --port ${port}`,
    url: baseURL + "/en",
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
})
