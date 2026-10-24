// @vitest-environment node
import { describe, expect, it } from "vitest"
import * as storage from "./index"

describe("lib/storage barrel", () => {
  it("exposes what the UI needs", () => {
    for (const name of [
      "downloadFile",
      "buildExport",
      "readImportFile",
      "parseImportText",
      "isFileLinkSupported",
      "exportFileName",
      "IMPORT_ERROR_CODES",
      "SAVE_ERROR_CODES",
      "STORAGE_WARNINGS",
      "SNAPSHOT_REASONS",
      "FILE_LINK_ERROR_CODES",
      "IMPORT_MAX_MEGABYTES",
    ]) {
      expect(storage).toHaveProperty(name)
    }
  })
})
