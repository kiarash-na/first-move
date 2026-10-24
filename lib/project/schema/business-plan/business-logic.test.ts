// @vitest-environment node
import { describe, expect, it } from "vitest"
import { CANVAS_BLOCKS } from "@/lib/project/catalog/canvas-blocks"
import { allocationSchema, canvasSchema } from "./business-logic"

const row = (id: string) => ({ id, stakeholder: "Municipality", investment: "Pipes", risk: "Permits", benefit: "Climate goals" })

describe("canvasSchema (BM-STEP-02.1)", () => {
  it("has one text block per canvas block", () => {
    expect(Object.keys(canvasSchema.shape)).toEqual([...CANVAS_BLOCKS])
  })
})

describe("allocationSchema (BM-STEP-02.2)", () => {
  it("takes rows of investment, risk and benefit per stakeholder", () => {
    expect(allocationSchema.safeParse([row("a"), row("b")]).success).toBe(true)
    expect(allocationSchema.safeParse([]).success).toBe(true)
  })

  it("rejects duplicate ids, missing cells and unknown cells", () => {
    expect(allocationSchema.safeParse([row("a"), row("a")]).success).toBe(false)
    const missing: Partial<ReturnType<typeof row>> = row("a")
    delete missing.benefit
    expect(allocationSchema.safeParse([missing]).success).toBe(false)
    expect(allocationSchema.safeParse([{ ...row("a"), share: 50 }]).success).toBe(false)
  })
})
