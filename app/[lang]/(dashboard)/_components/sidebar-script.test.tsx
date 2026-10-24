import { render } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import { SIDEBAR_INIT_SCRIPT } from "@/lib/dashboard/sidebar-state"
import { SidebarScript } from "./sidebar-script"

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("SidebarScript (D-59)", () => {
  it("inlines the pre-paint sidebar script as JavaScript in the server HTML", () => {
    vi.stubGlobal("window", undefined)
    const html = renderToStaticMarkup(<SidebarScript />)
    expect(html).toContain('type="text/javascript"')
    expect(html).toContain(`>${SIDEBAR_INIT_SCRIPT}</script>`)
  })

  it("is inert text when React renders it in the browser", () => {
    const { container } = render(<SidebarScript />)
    expect(container.querySelector("script")).toHaveAttribute("type", "text/plain")
  })
})
