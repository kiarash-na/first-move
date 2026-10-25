/**
 * Points of the 3D district that the hero labels (PLAN-LANDING-FIX-00 step 1). The scene projects
 * them through its camera every frame and reports where they are on screen, so a callout's dot
 * sits on the thing it names instead of at a fixed viewport percentage.
 */

/** A point in district space (the group's local coordinates, see `districtWorld.ts`). */
export interface SceneAnchor {
  id: string
  position: readonly [number, number, number]
}

/** Where an anchor is on screen (CSS px from the viewport's top left) and whether to show it. */
export interface AnchorPosition {
  id: string
  x: number
  y: number
  on: boolean
}

/** What the visibility rule needs to know about the viewport and the page. */
export interface AnchorView {
  width: number
  height: number
  /** `window.scrollY`. */
  scrolled: number
  /** The hero (`overview`) is the active chapter. */
  overview: boolean
}

/**
 * The hero callouts: "Bidirectional flow" on the node where the cool and the warm line cross, and
 * "Local sources" on the orange corner node that sits beside the scene's warm light.
 */
export const HERO_ANCHORS: readonly SceneAnchor[] = [
  { id: 'flow', position: [0, 0.06, 0] },
  { id: 'source', position: [5.35, 0.03, -3.75] },
]

/**
 * From normalized device coordinates to a screen position. A callout is on only while the hero
 * is the chapter and barely scrolled, the point is in front of the camera and in the right part
 * of the viewport (clear of the hero copy, the HUD above and the scene controls below); its label
 * extends about 200 px to the left of the dot.
 */
export function screenAnchor(id: string, ndc: { x: number; y: number; z: number }, view: AnchorView): AnchorPosition {
  const x = ((ndc.x + 1) / 2) * view.width
  const y = ((1 - ndc.y) / 2) * view.height
  const on = view.overview
    && view.scrolled < view.height * 0.35
    && ndc.z < 1
    && x > view.width * 0.6
    && x < view.width - 32
    && y > 190
    && y < view.height * 0.74
  return { id, x: Math.round(x * 2) / 2, y: Math.round(y * 2) / 2, on }
}

/** True when a frame moved an anchor by at least half a pixel or switched one on or off. */
export function anchorsChanged(previous: readonly AnchorPosition[] | null, next: readonly AnchorPosition[]): boolean {
  if (!previous || previous.length !== next.length) return true
  return next.some((anchor, index) => {
    const before = previous[index]
    return before.id !== anchor.id || before.on !== anchor.on || Math.abs(before.x - anchor.x) >= 0.5 || Math.abs(before.y - anchor.y) >= 0.5
  })
}
