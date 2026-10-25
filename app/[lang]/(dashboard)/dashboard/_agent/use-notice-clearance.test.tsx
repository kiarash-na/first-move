import { screen, waitFor } from "@testing-library/react"
import { createPortal } from "react-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CookieNotice } from "@/components/cookie-notice/cookie-notice"
import legal from "@/dictionaries/en/legal.json"
import { resetNoticeForTests } from "@/lib/legal/notice"
import { AgentLauncher } from "./agent-launcher"
import { assistantCopy, renderAgent } from "./test-utils/render"
import { NOTICE_SELECTOR } from "./use-notice-clearance"

const copy = assistantCopy()

/** The cookie notice where the root layout puts it: directly in `<body>`, next to the dashboard. */
const page = () => (
  <>
    {createPortal(<CookieNotice lang="en" copy={legal.cookieNotice} />, document.body)}
    <AgentLauncher />
  </>
)

function viewport(width: number, height: number, notice: { top: number; right: number }) {
  vi.spyOn(window, "innerWidth", "get").mockReturnValue(width)
  vi.spyOn(window, "innerHeight", "get").mockReturnValue(height)
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const rect = this.tagName === "SECTION" ? { top: notice.top, right: notice.right, bottom: height - 16, left: 16 } : { top: 0, right: 0, bottom: 0, left: 0 }
    return { ...rect, x: rect.left, y: rect.top, width: rect.right - rect.left, height: rect.bottom - rect.top, toJSON: () => rect } as DOMRect
  })
}

beforeEach(() => {
  window.localStorage.clear()
  resetNoticeForTests()
})

afterEach(() => vi.restoreAllMocks())

describe("launcher and cookie notice", () => {
  it("finds the cookie notice, and nothing else, with its selector", () => {
    viewport(1280, 800, { top: 640, right: 500 })
    renderAgent(page())
    const notices = document.querySelectorAll(NOTICE_SELECTOR)
    expect(notices).toHaveLength(1)
    expect(notices[0]).toHaveAccessibleName(legal.cookieNotice.label)
  })

  it("moves up above the notice on a phone, where the notice spans the width", async () => {
    viewport(390, 844, { top: 600, right: 374 })
    renderAgent(page())
    const button = screen.getByRole("button", { name: copy.launcher.open })
    await waitFor(() => expect(button.style.bottom).toContain("260px"))
  })

  it("stays in the corner on a wide screen, where the two sit side by side", async () => {
    viewport(1280, 800, { top: 640, right: 500 })
    renderAgent(page())
    expect(screen.getByRole("region", { name: legal.cookieNotice.label })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: copy.launcher.open }).style.bottom).toContain("max(16px")
  })

  it("returns to the corner once the notice is dismissed", async () => {
    viewport(390, 844, { top: 600, right: 374 })
    renderAgent(page())
    const button = screen.getByRole("button", { name: copy.launcher.open })
    await waitFor(() => expect(button.style.bottom).toContain("260px"))
    screen.getByRole("button", { name: legal.cookieNotice.dismiss }).click()
    await waitFor(() => expect(button.style.bottom).toContain("max(16px"))
  })
})
