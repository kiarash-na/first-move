import type { ReactElement } from "react"
import { vi, type Mock } from "vitest"
import { RailContext, SIDEBAR_ID, type Rail } from "../sidebar/rail"

/** Tests only: the desktop sidebar's rail in a given state, with a spied setter. */
export function testRail(collapsed: boolean): Rail & { setCollapsed: Mock<(collapsed: boolean) => void> } {
  return { id: SIDEBAR_ID, collapsed, setCollapsed: vi.fn<(collapsed: boolean) => void>() }
}

/** Tests only: `ui` as a part of the desktop sidebar (wrap it before `renderDashboard`). */
export function inRail(ui: ReactElement, rail: Rail = testRail(true)): ReactElement {
  return <RailContext value={rail}>{ui}</RailContext>
}
