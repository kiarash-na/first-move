"use client"

import { Maximize2, Minimize2 } from "lucide-react"
import { useSyncExternalStore } from "react"

const subscribe = (onChange: () => void) => {
  document.addEventListener("fullscreenchange", onChange)
  return () => document.removeEventListener("fullscreenchange", onChange)
}
const isSupported = () => Boolean(document.fullscreenEnabled)
const isActive = () => document.fullscreenElement != null
const never = () => false

/**
 * Toggles full screen for the whole page. Not rendered on the server, nor where the browser has
 * no Fullscreen API (iPhone Safari): there it would do nothing.
 */
export function FullscreenButton({ enterLabel, exitLabel }: { enterLabel: string; exitLabel: string }) {
  const supported = useSyncExternalStore(subscribe, isSupported, never)
  const active = useSyncExternalStore(subscribe, isActive, never)

  if (!supported) return null

  const toggle = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    else void document.documentElement.requestFullscreen().catch(() => {})
  }

  const Icon = active ? Minimize2 : Maximize2
  return (
    <button type="button" className="deck-icon-button" aria-pressed={active} aria-label={active ? exitLabel : enterLabel} onClick={toggle}>
      <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
    </button>
  )
}
