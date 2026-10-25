// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest"
import { MessageSection } from "@/emails/components/message-section"
import { renderText } from "@/emails/render/text"
import { run } from "@/lib/quick-check"
import { bpSummarySection } from "./results-bp"
import { projectWith, QUICK_CHECK_ANSWERS } from "./test-utils/project"
import { loadTexts, type MailTexts } from "./texts"

let t: MailTexts
beforeAll(async () => {
  t = await loadTexts("en")
})

const plan = projectWith({
  "meta.modules.businessPlan": true,
  "site.name": "Sonnenhof",
  "businessPlan.opportunity.needs": "Space heating and hot water for 42 homes.",
  "businessPlan.risks": [
    { id: "r1", title: "Low connection rate", description: "Too few households connect.", dealBreaker: true, validation: "Survey" },
    { id: "r2", title: "Drilling permit", description: "", dealBreaker: false, validation: "" },
  ],
})

describe("bpSummarySection", () => {
  it("shows the filled fields per step in the person's words, risks marked, in orange", () => {
    const section = bpSummarySection(plan, null, t, { updated: false })
    expect(section.accent).toBe("hot")
    const text = renderText(<MessageSection section={section} />)
    expect(text).toContain("Define the opportunity")
    expect(text).toContain("Space heating and hot water for 42 homes.")
    expect(text).toContain("Risks · Entry 1\nPotential deal-breaker  Low connection rate · Too few households connect. · Yes · Survey")
    expect(text).toContain("Pitch completeness (unofficial)")
    expect(text).not.toContain("From the Quick Check")
  })

  it("says when nothing is filled in yet", () => {
    const text = renderText(<MessageSection section={bpSummarySection(projectWith({}), null, t, { updated: false })} />)
    expect(text).toContain("Nothing filled in yet.")
  })

  it("adds the Quick Check's main numbers read-only when both modules are on", () => {
    const both = projectWith({ ...QUICK_CHECK_ANSWERS, "meta.modules.businessPlan": true })
    const text = renderText(<MessageSection section={bpSummarySection(both, run(both), t, { updated: true })} />)
    expect(text).toContain("Updated with your latest values.")
    expect(text).toContain("From the Quick Check (read-only)")
    expect(text).toContain("Heating coverage")
  })
})
