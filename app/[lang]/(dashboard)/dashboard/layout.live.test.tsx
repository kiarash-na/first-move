// @vitest-environment node
import { describe, expect, it, vi } from "vitest"
import assistantDe from "@/dictionaries/de/assistant.json"
import DashboardLayout from "./layout"

// The go-live state of the AI assistant; `layout.test.tsx` covers the switch off.
vi.mock("@/lib/legal/ai", async (original) => ({ ...(await original<typeof import("@/lib/legal/ai")>()), AI_FEATURES_LIVE: true }))

const props = (lang: string) => ({ params: Promise.resolve({ lang }), children: "page" }) as unknown as LayoutProps<"/[lang]/dashboard">

describe("dashboard layout with the AI assistant live", () => {
  it("also hands over the assistant's copy", async () => {
    const tree = await DashboardLayout(props("de"))
    expect(Object.keys(tree.props.dictionaries).sort()).toEqual(["assistant", "business-plan", "calc", "common", "quick-check", "shell"])
    expect(tree.props.dictionaries.assistant.launcher.open).toBe(assistantDe.launcher.open)
  })
})
