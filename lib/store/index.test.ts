import { describe, expect, it } from "vitest"
import * as store from "./index"

describe("lib/store barrel", () => {
  it("exposes the store, hooks, selectors and state", () => {
    for (const name of [
      "getProjectStore",
      "createProjectStore",
      "browserDeps",
      "useProjectStore",
      "useStartProjectStore",
      "selectSaveStatus",
      "SAVE_STATUS_KINDS",
      "INITIAL_STATE",
      "NOTICE_KINDS",
    ]) {
      expect(store).toHaveProperty(name)
    }
  })
})
