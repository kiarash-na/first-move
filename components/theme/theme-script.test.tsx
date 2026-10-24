import { render } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import { THEME_INIT_SCRIPT } from "@/lib/theme/theme"
import { ThemeScript } from "./theme-script"

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("ThemeScript", () => {
  it("inlines the pre-paint theme script as JavaScript in the server HTML", () => {
    vi.stubGlobal("window", undefined)
    const html = renderToStaticMarkup(<ThemeScript />)
    expect(html).toContain('type="text/javascript"')
    expect(html).toContain(`>${THEME_INIT_SCRIPT}</script>`)
  })

  it("is inert text when React renders it in the browser", () => {
    const { container } = render(<ThemeScript />)
    expect(container.querySelector("script")).toHaveAttribute("type", "text/plain")
  })
})
