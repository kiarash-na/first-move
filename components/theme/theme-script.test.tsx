import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { THEME_INIT_SCRIPT } from "@/lib/theme/theme"
import { ThemeScript } from "./theme-script"

describe("ThemeScript", () => {
  it("inlines the pre-paint theme script", () => {
    expect(renderToStaticMarkup(<ThemeScript />)).toBe(`<script>${THEME_INIT_SCRIPT}</script>`)
  })
})
