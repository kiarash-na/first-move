'use client'

import type { Landing } from './types'

interface SceneCalloutsProps {
  copy: Pick<Landing['hero'], 'annotationTop' | 'annotationSide'>
  /** Hands each callout's element to the owner, which moves it to the scene's anchor of that id. */
  register: (id: string) => (element: HTMLDivElement | null) => void
}

/**
 * The two hero labels on the 3D district: "Bidirectional flow" on the crossing node and "Local
 * sources" on the orange corner node (`HERO_ANCHORS`). The scene reports where those points are
 * every frame; `Home` writes `--anchor-x/-y` and `data-on` on these elements, so the dot at the end
 * of the line sits on the point it names. Decorative, so hidden from assistive technology.
 */
export function SceneCallouts({ copy, register }: SceneCalloutsProps) {
  return (
    <>
      <div className="scene-callout" data-anchor="flow" data-on="false" ref={register('flow')} aria-hidden="true">
        <span>{copy.annotationTop}</span><i />
      </div>
      <div className="scene-callout scene-callout--hot" data-anchor="source" data-on="false" ref={register('source')} aria-hidden="true">
        <span>{copy.annotationSide}</span><i />
      </div>
    </>
  )
}
