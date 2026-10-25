import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { ResultActions } from "../types"
import { useLastRequest } from "./use-last-request"

describe("useLastRequest", () => {
  it("starts with the fallback and follows the last running request", () => {
    const initialProps: { busy: ResultActions["busy"] } = { busy: null }
    const { result, rerender } = renderHook(({ busy }) => useLastRequest(busy), { initialProps })
    expect(result.current).toBe("report")
    rerender({ busy: "suggestions" })
    expect(result.current).toBe("suggestions")
    // The request ends (it may have failed): the last one is kept.
    rerender({ busy: null })
    expect(result.current).toBe("suggestions")
    rerender({ busy: "report" })
    rerender({ busy: null })
    expect(result.current).toBe("report")
  })

  it("takes a request already running on mount", () => {
    const { result } = renderHook(() => useLastRequest("suggestions"))
    expect(result.current).toBe("suggestions")
  })
})
