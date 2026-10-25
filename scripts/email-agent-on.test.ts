import { describe, expect, it } from "vitest"
import { setSwitch, switchState } from "./email-agent-on.mjs"

describe("setSwitch", () => {
  it("flips an existing line and keeps the rest of the file untouched", () => {
    const content = "SITE_URL=https://localhost:3015\nEMAIL_AGENT_ENABLED=false\nRESEND_API_KEY=re_x\n"
    const result = setSwitch(content, "EMAIL_AGENT_ENABLED", "true")
    expect(result).toBe("SITE_URL=https://localhost:3015\nEMAIL_AGENT_ENABLED=true\nRESEND_API_KEY=re_x\n")
  })

  it("is idempotent when the switch is already on", () => {
    const content = "EMAIL_AGENT_ENABLED=true\n"
    expect(setSwitch(content, "EMAIL_AGENT_ENABLED", "true")).toBe(content)
  })

  it("appends a missing switch to a file, with exactly one trailing newline", () => {
    expect(setSwitch("SITE_URL=https://localhost:3015\n", "EMAIL_AGENT_ENABLED", "true")).toBe(
      "SITE_URL=https://localhost:3015\nEMAIL_AGENT_ENABLED=true\n",
    )
    expect(setSwitch("SITE_URL=https://localhost:3015", "EMAIL_AGENT_ENABLED", "true")).toBe(
      "SITE_URL=https://localhost:3015\nEMAIL_AGENT_ENABLED=true\n",
    )
  })

  it("replaces only the named switch, not a name that starts with it", () => {
    const content = "EMAIL_AGENT_ENABLED=false\nEMAIL_AGENT_ENABLED_EXTRA=false\n"
    const result = setSwitch(content, "EMAIL_AGENT_ENABLED", "true")
    expect(result).toBe("EMAIL_AGENT_ENABLED=true\nEMAIL_AGENT_ENABLED_EXTRA=false\n")
  })
})

describe("switchState", () => {
  it("reads true, false and missing", () => {
    expect(switchState("EMAIL_AGENT_ENABLED=true\n", "EMAIL_AGENT_ENABLED")).toBe("true")
    expect(switchState("EMAIL_AGENT_ENABLED=1\n", "EMAIL_AGENT_ENABLED")).toBe("true")
    expect(switchState("EMAIL_AGENT_ENABLED=false\n", "EMAIL_AGENT_ENABLED")).toBe("false")
    expect(switchState("SITE_URL=https://localhost:3015\n", "EMAIL_AGENT_ENABLED")).toBe("missing")
  })
})
