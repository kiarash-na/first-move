import { describe, expect, it } from "vitest"
import { BRANCHES, FOLLOW_UP_GATE_IDS } from "@/lib/ai/plan-score/branches"
import { GATES } from "@/lib/ai/plan-score/gates"
import type { AiScore } from "@/lib/project"
import { CAP_LEVELS, followUpOf, gateInfo, openedBy } from "./gate-info"

const score = (branches: AiScore["branches"]) => ({ branches }) as AiScore

describe("gateInfo", () => {
  it("knows every plain and follow-up check of the engine", () => {
    for (const id of [...GATES.map((gate) => gate.id), ...FOLLOW_UP_GATE_IDS]) expect(gateInfo(id), id).not.toBeNull()
    expect(gateInfo("nope")).toBeNull()
  })

  it("reads a plain check from GATES", () => {
    expect(gateInfo("boundary")).toEqual({ id: "boundary", turn: 2, dimension: "governance", effect: { kind: "cap", level: 2 }, conditional: false, branch: null })
    expect(gateInfo("heat-density")?.conditional).toBe(true)
  })

  it("reads a follow-up check from its branch", () => {
    const branch = BRANCHES.find((entry) => entry.id === "source-type")!
    expect(gateInfo("water-permit")).toMatchObject({ turn: branch.followUpTurn, dimension: branch.followUpDimension, branch: "source-type", effect: { kind: "cap", level: 2 } })
    expect(gateInfo("owner-community")).toMatchObject({ branch: "ownership", effect: { kind: "flag" } })
  })
})

describe("openedBy and followUpOf", () => {
  it("finds the decision that asked a follow-up check", () => {
    const decided = score([
      { id: "anchor-type", choice: "residential", probabilities: {} },
      { id: "source-type", choice: "borehole", probabilities: {} },
    ])
    expect(openedBy(decided, "water-permit")).toEqual({ branch: "source-type", option: "borehole" })
    expect(openedBy(decided, "anchor-residential")).toEqual({ branch: "anchor-type", option: "residential" })
    expect(openedBy(decided, "anchor-public")).toBeNull()
    expect(openedBy(decided, "boundary")).toBeNull()
  })

  it("names the follow-up an option asks", () => {
    expect(followUpOf("source-type", "groundwater")).toBe("water-permit")
    expect(followUpOf("source-type", "unclear")).toBeNull()
    expect(followUpOf("nope", "x")).toBeNull()
  })

  it("lists the cap levels of the engine, lowest first", () => {
    const levels = new Set(GATES.flatMap((gate) => (gate.effect.kind === "cap" ? [gate.effect.level] : [])))
    expect(CAP_LEVELS).toEqual([...levels].sort((a, b) => a - b))
  })
})
