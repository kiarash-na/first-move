import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import shell from "@/dictionaries/en/shell.json"
import { lookup } from "@/lib/i18n/lookup"
import { localizeExample, getExample } from "@/lib/examples"
import { parseImportText } from "@/lib/storage"
import type { ImportFailure, ImportSuccess } from "@/lib/storage"
import { importFailureText, importSuccessNotes } from "./import-messages"

const label = (ref: { area: string; key: string }) => (ref.area === "quick-check" ? lookup(quickCheck, `${ref.key}.label`) : null)

function failure(text: string): ImportFailure {
  const result = parseImportText(text)
  if (result.ok) throw new Error("expected a failure")
  return result
}

describe("importFailureText", () => {
  it("explains a file that is not JSON", () => {
    expect(importFailureText(failure("{oops"), shell, "en", label)).toEqual({ message: shell.storage.import.error["not-json"], fields: [] })
  })

  it("fills the size limit", () => {
    const text = importFailureText({ ok: false, code: "too-large", params: { maxMegabytes: 5 }, errors: [], moreErrors: 0 }, shell, "de", label)
    expect(text.message).toBe("This file is larger than 5 MB.")
  })

  it("lists bad fields with their labels and the rest as a count", () => {
    const project = localizeExample(getExample("new-build-quarter")!, "en")
    const broken = { ...project, buildings: { ...project.buildings, total: -3 } }
    const text = importFailureText(failure(JSON.stringify(broken)), shell, "en", label)
    expect(text.message).toBe(shell.storage.import.error.invalid)
    expect(text.fields[0]).toBe(`${quickCheck.fields.buildings.total.label}: Enter 1 or more.`)

    const many: ImportFailure = {
      ok: false,
      code: "invalid",
      params: {},
      errors: [{ path: "meta.unknown", code: "unknown-field", message: "", text: null }],
      moreErrors: 4,
    }
    expect(importFailureText(many, shell, "en", label).fields).toEqual([
      `meta.unknown: ${shell.validation["unknown-field"]}`,
      "and 4 more",
    ])
  })
})

describe("importSuccessNotes", () => {
  it("mentions migrations and a changed methodology", () => {
    const base = { ok: true, project: {} as ImportSuccess["project"], fromVersion: 1 } as const
    expect(importSuccessNotes({ ...base, migrated: false, methodology: { file: "1.0.0", current: "1.0.0", changed: false } }, shell)).toEqual([])
    expect(importSuccessNotes({ ...base, migrated: true, methodology: { file: "0.9.0", current: "1.0.0", changed: true } }, shell)).toEqual([
      shell.storage.import.migrated,
      "Results are recalculated with methodology 1.0.0. The file was saved with 0.9.0.",
    ])
  })
})
