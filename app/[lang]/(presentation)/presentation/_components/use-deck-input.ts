"use client"

import { useEffect, useEffectEvent, useRef, type PointerEvent } from "react"
import { actionForKey, keyBelongsToTarget, swipeAction, type DeckAction, type KeyTarget } from "@/lib/presentation/slides"

/** The facts `keyBelongsToTarget` needs about the focused element. */
function keyTarget(element: EventTarget | null): KeyTarget | null {
  if (!(element instanceof HTMLElement)) return null
  const ancestorRoles: string[] = []
  for (let node = element.parentElement; node; node = node.parentElement) {
    const role = node.getAttribute("role")
    if (role) ancestorRoles.push(role)
  }
  return { tagName: element.tagName, isContentEditable: element.isContentEditable, role: element.getAttribute("role"), ancestorRoles }
}

/**
 * Keyboard for the whole page: arrows, Space, Page Up/Down, Home, End. Keys a focused control
 * needs stay with it; shortcuts with Ctrl, Alt or Meta stay with the browser.
 */
export function useDeckKeys(onAction: (action: DeckAction) => void) {
  const act = useEffectEvent(onAction)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
      const action = actionForKey(event.key, event.shiftKey)
      if (!action || keyBelongsToTarget(event.key, keyTarget(event.target))) return
      event.preventDefault()
      act(action)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])
}

/** Horizontal swipes on touch and pen; the stage keeps `touch-action: pan-y`, so slides still scroll. */
export function useSwipe(onAction: (action: DeckAction) => void) {
  const start = useRef<{ id: number; x: number; y: number } | null>(null)

  return {
    onPointerDown(event: PointerEvent) {
      start.current = event.pointerType === "mouse" ? null : { id: event.pointerId, x: event.clientX, y: event.clientY }
    },
    onPointerUp(event: PointerEvent) {
      const from = start.current
      start.current = null
      if (!from || from.id !== event.pointerId) return
      const action = swipeAction(event.clientX - from.x, event.clientY - from.y)
      if (action) onAction(action)
    },
    onPointerCancel() {
      start.current = null
    },
  }
}
