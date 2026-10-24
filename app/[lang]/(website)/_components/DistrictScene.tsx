'use client'

import { useEffect, useRef, useState } from 'react'
import type { ToolId } from './Header'

interface DistrictSceneProps {
  flowDirection: 1 | -1
  emphasis: ToolId | null
  chapter: string
  demandDensity: number
  sourceAvailability: number
}

function SceneFallback() {
  const buildings = [
    [-180, 40, 62], [-95, 5, 105], [5, 45, 76], [105, 5, 130],
    [-135, 135, 86], [-25, 135, 54], [85, 125, 96], [185, 75, 65],
  ]
  return (
    <svg className="scene-fallback__art" viewBox="0 0 1000 760" aria-hidden="true">
      <g transform="translate(510 280)">
        <path d="M-350 120 0-70 350 120 0 310Z" fill="#0d171c" stroke="#38515a" />
        <path d="M-330 120 0-57 330 120 0 297Z" fill="none" stroke="#00e5ff" strokeWidth="4" />
        <path d="M-314 120 0-45 314 120 0 285Z" fill="none" stroke="#ff6a00" strokeWidth="3" />
        <path d="M-330 120H330M0-57V297" stroke="#00e5ff" strokeOpacity=".45" strokeWidth="2" />
        {buildings.map(([x, y, height], index) => (
          <g key={index} transform={`translate(${x} ${y})`}>
            <path d={`M0 0 48-26 96 0 48 26Z`} fill="#20343c" stroke="#6d929d" strokeOpacity=".5" />
            <path d={`M0 0V-${height}L48-${height + 26}V26Z`} fill="#111f25" stroke="#6d929d" strokeOpacity=".35" />
            <path d={`M48 26V-${height + 26}L96-${height}V0Z`} fill="#172a31" stroke="#6d929d" strokeOpacity=".35" />
            <path d={`M0-${height} 48-${height + 26} 96-${height} 48-${height - 26}Z`} fill="#263e47" stroke="#6d929d" strokeOpacity=".5" />
          </g>
        ))}
      </g>
    </svg>
  )
}

export function DistrictScene({ flowDirection, emphasis, chapter, demandDensity, sourceAvailability }: DistrictSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const directionRef = useRef(flowDirection)
  const emphasisRef = useRef(emphasis)
  const chapterRef = useRef(chapter)
  const demandRef = useRef(demandDensity)
  const sourceRef = useRef(sourceAvailability)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    directionRef.current = flowDirection
  }, [flowDirection])

  useEffect(() => {
    emphasisRef.current = emphasis
  }, [emphasis])

  useEffect(() => {
    chapterRef.current = chapter
  }, [chapter])

  useEffect(() => {
    demandRef.current = demandDensity
  }, [demandDensity])

  useEffect(() => {
    sourceRef.current = sourceAvailability
  }, [sourceAvailability])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let unmount: (() => void) | undefined
    // three.js loads after hydration, so it never blocks the first paint; until the first
    // frame the SVG fallback shows, as before.
    import('./districtWorld')
      .then(({ mountDistrictWorld }) => {
        if (cancelled) return
        unmount = mountDistrictWorld(
          container,
          { directionRef, emphasisRef, chapterRef, demandRef, sourceRef },
          {
            onReady: () => setReady(true),
            onFailed: () => setFailed(true),
            onContextLost: () => {
              setReady(false)
              setFailed(true)
            },
          },
        )
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      unmount?.()
    }
  }, [])

  return (
    <div className={`district-scene ${ready && !failed ? 'district-scene--ready' : ''}`} ref={containerRef}>
      <div className="scene-fallback"><SceneFallback /></div>
    </div>
  )
}
