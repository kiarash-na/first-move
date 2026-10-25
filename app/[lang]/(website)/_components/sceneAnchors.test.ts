import { describe, expect, it } from 'vitest'
import { anchorsChanged, HERO_ANCHORS, screenAnchor } from './sceneAnchors'

const view = { width: 1440, height: 900, scrolled: 0, overview: true }

describe('screenAnchor', () => {
  it('maps normalized device coordinates to CSS pixels from the top left', () => {
    expect(screenAnchor('a', { x: 0, y: 0, z: 0.5 }, view)).toMatchObject({ id: 'a', x: 720, y: 450 })
    expect(screenAnchor('a', { x: 0.5, y: -0.5, z: 0.5 }, view)).toMatchObject({ x: 1080, y: 675 })
  })

  it('is on only in the right part of the viewport, clear of the copy, the HUD and the controls', () => {
    expect(screenAnchor('a', { x: -0.5, y: 0, z: 0.5 }, view).on).toBe(false) // over the hero copy
    expect(screenAnchor('a', { x: 0.99, y: 0, z: 0.5 }, view).on).toBe(false) // at the edge
    expect(screenAnchor('a', { x: 0.5, y: 0.9, z: 0.5 }, view).on).toBe(false) // under the HUD
    expect(screenAnchor('a', { x: 0.5, y: -0.9, z: 0.5 }, view).on).toBe(false) // over the controls
    expect(screenAnchor('a', { x: 0.5, y: 0, z: 0.5 }, view).on).toBe(true)
  })

  it('is off behind the camera, outside the hero chapter and once the page scrolled', () => {
    expect(screenAnchor('a', { x: 0.5, y: 0, z: 1.2 }, view).on).toBe(false)
    expect(screenAnchor('a', { x: 0.5, y: 0, z: 0.5 }, { ...view, overview: false }).on).toBe(false)
    expect(screenAnchor('a', { x: 0.5, y: 0, z: 0.5 }, { ...view, scrolled: 400 }).on).toBe(false)
    expect(screenAnchor('a', { x: 0.5, y: 0, z: 0.5 }, { ...view, scrolled: 200 }).on).toBe(true)
  })

  it('rounds to half pixels so frames that barely move write nothing', () => {
    const a = screenAnchor('a', { x: 0.5001, y: 0, z: 0.5 }, view)
    const b = screenAnchor('a', { x: 0.5002, y: 0, z: 0.5 }, view)
    expect(anchorsChanged([a], [b])).toBe(false)
    expect(anchorsChanged([a], [{ ...b, x: b.x + 1 }])).toBe(true)
    expect(anchorsChanged([a], [{ ...b, on: false }])).toBe(true)
    expect(anchorsChanged(null, [a])).toBe(true)
  })
})

describe('HERO_ANCHORS', () => {
  it('names the two hero callouts: the crossing node and the orange corner node', () => {
    expect(HERO_ANCHORS.map((anchor) => anchor.id)).toEqual(['flow', 'source'])
  })
})
