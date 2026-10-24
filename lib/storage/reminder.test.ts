// @vitest-environment node
import { describe, expect, it } from "vitest"
import { emptyBackup, recordEdit, recordExport, recordReminder, shouldRemind } from "./reminder"

const rules = { edits: 3, days: 2, snoozeHours: 24 }
const day = (n: number, hour = 8) => new Date(Date.UTC(2026, 9, 24 + n, hour))

describe("export reminder", () => {
  it("counts edits and remembers when unexported work began", () => {
    const state = recordEdit(recordEdit(emptyBackup("p"), day(0)), day(1))
    expect(state).toMatchObject({ editsSinceExport: 2, pendingSince: day(0).toISOString() })
  })

  it("does not remind without unexported edits", () => {
    expect(shouldRemind(emptyBackup("p"), day(30), rules)).toBe(false)
    const exported = recordExport(recordEdit(emptyBackup("p"), day(0)), day(5))
    expect(exported).toMatchObject({ editsSinceExport: 0, pendingSince: null, exportedAt: day(5).toISOString() })
    expect(shouldRemind(exported, day(30), rules)).toBe(false)
  })

  it("reminds after N edits", () => {
    let state = emptyBackup("p")
    for (let edit = 0; edit < 2; edit++) state = recordEdit(state, day(0))
    expect(shouldRemind(state, day(0), rules)).toBe(false)
    state = recordEdit(state, day(0))
    expect(shouldRemind(state, day(0), rules)).toBe(true)
  })

  it("reminds after N days with unexported edits", () => {
    const state = recordEdit(emptyBackup("p"), day(0))
    expect(shouldRemind(state, day(1), rules)).toBe(false)
    expect(shouldRemind(state, day(2), rules)).toBe(true)
  })

  it("pauses after a reminder", () => {
    let state = emptyBackup("p")
    for (let edit = 0; edit < 5; edit++) state = recordEdit(state, day(0))
    state = recordReminder(state, day(0, 8))
    expect(shouldRemind(state, day(0, 20), rules)).toBe(false)
    expect(shouldRemind(state, day(1, 9), rules)).toBe(true)
  })
})
