// @vitest-environment node
import { describe, expect, it } from "vitest"
import { testConfig, testEmail } from "../gates/test-utils/context"
import { fakeTransport } from "../inbound/test-utils/fake-transport"
import { createMemoryStore } from "../store/memory-store"
import { alertOncePerDay, excerptOf, MAX_ALERTS_PER_DAY, sendAlert } from "./alert"

const now = Date.UTC(2026, 9, 24, 12, 5)
const DAY = 86_400_000

function setup() {
  const fake = fakeTransport()
  return { fake, deps: { config: testConfig(), store: createMemoryStore(), transport: fake.transport } }
}

const blockAlert = (id = "email-1") => ({
  kind: "block" as const,
  email: testEmail({ id, subject: "Free money", text: `Click https://evil.example.com/win now ${"x".repeat(400)}` }),
  category: "malicious",
  scores: { injection: 0.02, harassment: 0.01, malicious: 0.97 },
})

describe("admin alerts", () => {
  it("tell the admin only what happened, with a defanged excerpt", async () => {
    const { fake, deps } = setup()
    expect(await sendAlert(deps, blockAlert(), now)).toBe("sent")
    expect(fake.sent).toHaveLength(1)
    const [alert] = fake.sent
    expect(alert).toMatchObject({
      from: '"First Move assistant (AI)" <agent@mail.firstmove.energy>',
      to: "owner@example.org",
      subject: "First Move assistant: sender blocked",
      headers: { "Auto-Submitted": "auto-generated", "X-Auto-Response-Suppress": "All" },
      idempotencyKey: "alert/email-1/block",
    })
    expect(alert.text).toContain("Category: malicious")
    expect(alert.text).toContain("Scores: injection 0.02 · harassment 0.01 · malicious 0.97")
    expect(alert.text).toContain("When: 24 Oct 2026, 12:05 UTC")
    expect(alert.text).toContain("From: jane@example.org")
    expect(alert.text).toContain("Email id: email-1")
    expect(alert.text).toContain("evil[.]example[.]com/win")
    expect(alert.text).not.toContain("https://evil")
  })

  it("cut the excerpt at 300 characters", () => {
    expect([...excerptOf("y".repeat(1_000))]).toHaveLength(300)
  })

  it("stop after 20 a day with one line that more were held back", async () => {
    const { fake, deps } = setup()
    for (let index = 0; index < MAX_ALERTS_PER_DAY; index++) expect(await sendAlert(deps, blockAlert(`e${index}`), now)).toBe("sent")
    expect(await sendAlert(deps, blockAlert("e20"), now)).toBe("more")
    expect(await sendAlert(deps, blockAlert("e21"), now)).toBe("held")
    expect(fake.sent).toHaveLength(MAX_ALERTS_PER_DAY + 1)
    expect(fake.sent.at(-1)?.text).toBe("More alerts today were not sent (at most 20 a day).")
    expect(await sendAlert(deps, blockAlert("e22"), now + DAY)).toBe("sent")
  })

  it("leave sender data out of alerts about the agent as a whole", async () => {
    const { fake, deps } = setup()
    await sendAlert(deps, { kind: "budget" }, now)
    expect(fake.sent[0].subject).toBe("First Move assistant: daily budget spent")
    expect(fake.sent[0].text).toContain("Today's model budget of 2.00 USD is spent.")
    expect(fake.sent[0].text).not.toMatch(/From:|Subject:|jane/)
  })

  it("send a daily alert once, also when a step repeats", async () => {
    const { fake, deps } = setup()
    await alertOncePerDay(deps, "rate-global", "e1", now)
    await alertOncePerDay(deps, "rate-global", "e2", now)
    await alertOncePerDay(deps, "rate-global", "e1", now)
    expect(fake.sent).toHaveLength(1)
    expect(fake.sent[0].text).toContain("The daily limit of 500 emails")
    await alertOncePerDay(deps, "rate-global", "e3", now + DAY)
    expect(fake.sent).toHaveLength(2)
  })
})
