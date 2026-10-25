'use client'

import { Suspense, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import './landing-switch.css'

/** The desktop landing owns this width and up; phones and tablets get the mobile version (PLAN-LANDING-MOBILE-00, D-LM-1). */
export const DESKTOP_MIN_WIDTH = 1024

const DESKTOP_QUERY = `(min-width: ${DESKTOP_MIN_WIDTH}px)`

/** `both` on the server and while hydrating (CSS shows one), then the media query's answer. */
export type LandingVariant = 'both' | 'desktop' | 'mobile'

function subscribe(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getSnapshot(): LandingVariant {
  return window.matchMedia(DESKTOP_QUERY).matches ? 'desktop' : 'mobile'
}

function getServerSnapshot(): LandingVariant {
  return 'both'
}

/** Which landing the viewer gets. Never reads the window during a server or hydration render. */
export function useLandingVariant(): LandingVariant {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

interface LandingSwitchProps {
  desktop: ReactNode
  mobile: ReactNode
}

/**
 * The page-level switch between the two landings (PLAN-LANDING-MOBILE-00 step 1). The server
 * renders both trees and `landing-switch.css` shows one, so there is no layout shift and nothing
 * reads the viewport while rendering. After hydration the hidden tree is unmounted. Each tree has
 * its own Suspense boundary: React hydrates a server-rendered boundary after the page shell, and
 * the hidden one is removed before its turn, so none of its effects ever runs. On a phone the
 * desktop's 3D scene therefore never loads three.js, and on a desktop the mobile tree costs nothing.
 *
 * The two boundary elements keep their identity across renders (`useMemo`): a dehydrated boundary
 * whose props changed can no longer be hydrated lazily and React would client-render it from
 * scratch; an unchanged one is left alone and hydrated in place when its turn comes.
 */
export function LandingSwitch({ desktop, mobile }: LandingSwitchProps) {
  const variant = useLandingVariant()
  const desktopTree = useMemo(() => <Suspense>{desktop}</Suspense>, [desktop])
  const mobileTree = useMemo(() => <Suspense>{mobile}</Suspense>, [mobile])

  return (
    <>
      <div className="landing-desktop" data-variant={variant}>
        {variant !== 'mobile' && desktopTree}
      </div>
      <div className="landing-mobile" data-variant={variant}>
        {variant !== 'desktop' && mobileTree}
      </div>
    </>
  )
}
