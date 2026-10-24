// @vitest-environment node
import { describe, expect, it } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { NOTICE_KINDS } from "@/lib/store/state"
import { SAVE_STATUS_KINDS } from "@/lib/store/save-status"
import { FILE_LINK_ERROR_CODES } from "./file-link"
import { IMPORT_ERROR_CODES } from "./import"
import { STORAGE_WARNINGS } from "./persist"
import { SAVE_ERROR_CODES } from "./save-error"
import { SNAPSHOT_REASONS } from "./types"

const copy = shell.storage as unknown as Record<string, Record<string, unknown>>

function expectCopy(node: Record<string, unknown>, keys: readonly string[]) {
  for (const key of keys) {
    expect(typeof node[key], key).toBe("string")
    expect((node[key] as string).trim().length, key).toBeGreaterThan(0)
  }
}

describe("storage copy (shell.storage, EN)", () => {
  it("has a text for every code the storage layer reports", () => {
    expectCopy(copy.saveStatus, SAVE_STATUS_KINDS)
    expectCopy(copy.saveError, [...SAVE_ERROR_CODES, "mirrored"])
    expectCopy(copy.warning, STORAGE_WARNINGS)
    expectCopy(copy.notice, NOTICE_KINDS)
    expectCopy(copy.snapshotReason, SNAPSHOT_REASONS)
    expectCopy((copy.import as Record<string, Record<string, unknown>>).error, IMPORT_ERROR_CODES)
    expectCopy((copy.fileLink as Record<string, Record<string, unknown>>).error, FILE_LINK_ERROR_CODES)
    expectCopy((copy.fileLink as Record<string, Record<string, unknown>>).status, ["off", "on", "needs-permission", "error"])
  })

  it("uses the placeholders the UI fills", () => {
    expect(copy.saveStatus.saved).toContain("{time}")
    expect((copy.import as Record<string, Record<string, string>>).error["too-large"]).toContain("{max}")
    expect(copy.notice.recovered).toContain("{count}")
  })
})
