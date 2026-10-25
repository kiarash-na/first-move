import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { clearGatewayKey, setGatewayKey } from "@/lib/assistant/gateway/key"
import { useMaskedGatewayKey } from "./use-gateway-key"

afterEach(() => clearGatewayKey())

describe("useMaskedGatewayKey (D-71)", () => {
  it("shows only the masked key and follows changes", () => {
    const { result } = renderHook(() => useMaskedGatewayKey())
    expect(result.current).toBeNull()
    act(() => setGatewayKey("vck_test_0123456789abcdefWXYZ"))
    expect(result.current).toBe("…WXYZ")
    act(() => clearGatewayKey())
    expect(result.current).toBeNull()
  })
})
