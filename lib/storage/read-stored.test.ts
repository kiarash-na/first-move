// @vitest-environment node
import { describe, expect, it } from "vitest"
import { readStored } from "./read-stored"
import { testId, testProject } from "./test-utils/projects"

describe("readStored", () => {
  it("accepts a valid copy filed under its id", () => {
    const project = testProject(1)
    expect(readStored(project, testId(1))).toEqual({ ok: true, project, migrated: false })
  })

  it("rejects a copy filed under another id, an invalid copy and a newer schema", () => {
    expect(readStored(testProject(1), testId(2))).toEqual({ ok: false, code: "id-mismatch" })
    expect(readStored({ meta: { schemaVersion: 1 } }, testId(1))).toEqual({ ok: false, code: "invalid" })
    expect(readStored({ meta: { schemaVersion: 99 } }, testId(1))).toEqual({ ok: false, code: "newer-version" })
    expect(readStored("text", testId(1))).toEqual({ ok: false, code: "not-object" })
  })
})
