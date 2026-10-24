import type { Locator } from "@playwright/test"

/**
 * True when the element is what the user sees at its centre: inside the viewport, not scrolled out
 * of its scroller and not covered by another layer (the phase 11 check for the sidebar's current page).
 */
export function hitAtCentre(locator: Locator): Promise<boolean> {
  return locator.evaluate((el) => {
    const box = el.getBoundingClientRect()
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
    return hit !== null && el.contains(hit)
  })
}
