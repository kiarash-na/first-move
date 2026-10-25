'use client'

import { useRef, type ReactNode } from 'react'
import { useMobileReveal } from './useMobileReveal'

/** The root of the mobile landing: holds the element the scroll-reveal watches. Its children stay server components. */
export function MobileRevealRoot({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  useMobileReveal(root)

  return (
    <div className="m-landing" ref={root}>
      {children}
    </div>
  )
}
