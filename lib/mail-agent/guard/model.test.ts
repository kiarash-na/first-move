// @vitest-environment node
import { describe, expect, it } from "vitest"
import { testConfig } from "../gates/test-utils/context"
import { decisionModel } from "./model"

describe("decision model", () => {
  it("is the configured Jev version on the AI Gateway", () => {
    const model = decisionModel(testConfig())
    expect(typeof model).toBe("object")
    expect(model).toMatchObject({ specificationVersion: "v4", modelId: "typesafe-ai/jev-1.14.0" })
    expect(decisionModel(testConfig({ EMAIL_AGENT_DECISION_MODEL: "typesafe-ai/jev-1.13.0" }))).toMatchObject({ modelId: "typesafe-ai/jev-1.13.0" })
  })
})
