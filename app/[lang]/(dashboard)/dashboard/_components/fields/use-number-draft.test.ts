import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { PatchError } from "@/lib/project"
import { useNumberDraft } from "./use-number-draft"

const error: PatchError = { path: "x", code: "min", params: { min: 0 }, message: "" }

describe("useNumberDraft", () => {
  it("commits the parsed value and keeps the typed text", () => {
    const commit = vi.fn(() => [])
    const { result, rerender } = renderHook(({ value }) => useNumberDraft(value, "en", commit), { initialProps: { value: null as number | null } })
    act(() => result.current.change("1."))
    expect(commit).toHaveBeenLastCalledWith(1)
    rerender({ value: 1 })
    expect(result.current.text).toBe("1.")
    act(() => result.current.blur())
    expect(result.current.text).toBe("1")
  })

  it("keeps a rejected text with its error until the value changes elsewhere", () => {
    const { result, rerender } = renderHook(({ value }) => useNumberDraft(value, "en", () => [error]), { initialProps: { value: 5 as number | null } })
    act(() => result.current.change("-3"))
    expect(result.current).toMatchObject({ text: "-3", error })
    act(() => result.current.blur())
    expect(result.current.text).toBe("-3")
    rerender({ value: 8 })
    expect(result.current).toMatchObject({ text: "8", error: null })
  })

  it("reformats when the language changes", () => {
    const { result, rerender } = renderHook(({ lang }) => useNumberDraft(1234.5, lang, () => []), { initialProps: { lang: "en" as "en" | "de" } })
    expect(result.current.text).toBe("1,234.5")
    rerender({ lang: "de" })
    expect(result.current.text).toBe("1.234,5")
  })
})
