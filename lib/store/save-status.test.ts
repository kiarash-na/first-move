// @vitest-environment node
import { describe, expect, it } from "vitest"
import { testProject } from "@/lib/storage/test-utils/projects"
import { selectSaveStatus } from "./save-status"
import { INITIAL_STATE, type ProjectStoreState } from "./state"

const AT = "2026-10-24T08:00:00.000Z"

function state(patch: Partial<ProjectStoreState>): ProjectStoreState {
  return { ...INITIAL_STATE, active: testProject(1), ...patch }
}

describe("selectSaveStatus", () => {
  it("is idle without an open project", () => {
    expect(selectSaveStatus(INITIAL_STATE)).toEqual({ kind: "idle" })
  })

  it("shows error first, then saving, then a storage warning, then saved at", () => {
    const save = { state: "saved" as const, savedAt: AT, error: null, mirrored: false }
    const warn = { ...INITIAL_STATE.health, warning: "not-persisted" as const }
    expect(selectSaveStatus(state({ save: { ...save, state: "error", error: "quota-exceeded", mirrored: true }, health: warn }))).toEqual({
      kind: "error",
      code: "quota-exceeded",
      mirrored: true,
    })
    expect(selectSaveStatus(state({ save: { ...save, state: "saving" }, health: warn }))).toEqual({ kind: "saving" })
    expect(selectSaveStatus(state({ save, health: warn }))).toEqual({ kind: "storage-warning", warning: "not-persisted", at: AT })
    expect(selectSaveStatus(state({ save }))).toEqual({ kind: "saved", at: AT })
    expect(selectSaveStatus(state({ save: { ...save, savedAt: null } }))).toEqual({ kind: "idle" })
    expect(selectSaveStatus(state({ save: { ...save, state: "error", error: null } }))).toMatchObject({ code: "write-failed" })
  })

  it("returns the same object for the same inputs (stable selector)", () => {
    const current = state({ save: { state: "saved", savedAt: AT, error: null, mirrored: false } })
    const first = selectSaveStatus(current)
    expect(selectSaveStatus({ ...current, active: testProject(2) })).toBe(first)
  })
})
