import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { forgetKey, rememberKey } from "@/lib/assistant/vault/vault"
import { useVaultEntries } from "./use-vault-entries"

afterEach(async () => {
  await forgetKey("openrouter")
})

describe("useVaultEntries", () => {
  it("reads the remembered keys after mount, without anything secret, and again on refresh", async () => {
    const { result } = renderHook(() => useVaultEntries())
    expect(result.current.entries).toEqual([])
    await rememberKey("openrouter", `sk-or-v1-${"e1".repeat(32)}`, "482915", { iterations: 1000 })
    act(() => result.current.refresh())
    await waitFor(() => expect(result.current.entries).toHaveLength(1))
    expect(Object.keys(result.current.entries[0]).sort()).toEqual(["createdAt", "failedAttempts", "last4", "provider"])
    await forgetKey("openrouter")
    act(() => result.current.refresh())
    await waitFor(() => expect(result.current.entries).toEqual([]))
  })
})
