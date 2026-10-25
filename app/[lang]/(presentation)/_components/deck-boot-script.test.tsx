import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DECK_BOOT_SCRIPT } from "@/lib/presentation/boot"
import { DeckBootScript } from "./deck-boot-script"

describe("DeckBootScript", () => {
  it("carries the boot script, inert when React renders it in the browser", () => {
    const { container } = render(<DeckBootScript />)
    const script = container.querySelector("script")!
    expect(script.innerHTML).toBe(DECK_BOOT_SCRIPT)
    expect(script.type).toBe("text/plain")
  })
})
