import { renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"
import { testRail } from "../test-utils/rail"
import { RailContext, useRail } from "./rail"

describe("useRail (D-59)", () => {
  it("is null outside the desktop sidebar, as in the mobile sheet", () => {
    expect(renderHook(() => useRail()).result.current).toBeNull()
  })

  it("hands the desktop sidebar's rail to its parts", () => {
    const rail = testRail(true)
    const wrapper = ({ children }: { children: ReactNode }) => <RailContext value={rail}>{children}</RailContext>
    expect(renderHook(() => useRail(), { wrapper }).result.current).toBe(rail)
  })
})
