import { describe, expect, it } from "vitest"
import { navSections } from "@/lib/dashboard/nav"
import { NAV_ICONS, START_ICON } from "./nav-icons"

describe("nav icons (D-59)", () => {
  const ids = navSections({ quickCheck: true, businessPlan: true }).flatMap((section) => section.items.map((item) => item.id))

  it("has an icon for every entry of a project with both modules on", () => {
    expect(ids.length).toBeGreaterThan(0)
    for (const id of ids) expect(NAV_ICONS[id], id).toBeDefined()
    expect(START_ICON).toBeDefined()
  })

  it("gives every entry its own icon and lists no entry that does not exist", () => {
    expect(Object.keys(NAV_ICONS).sort()).toEqual([...ids].sort())
    const icons = [START_ICON, ...Object.values(NAV_ICONS)]
    expect(new Set(icons).size).toBe(icons.length)
  })
})
