"use client"

import { useCallback, useSyncExternalStore } from "react"
import { clampSlide, hashForSlide, slideFromHash } from "@/lib/presentation/slides"

/** Fired after the deck rewrites the hash itself, since `replaceState` fires no `hashchange`. */
const DECK_HASH_EVENT = "deck:hash"

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange)
  window.addEventListener(DECK_HASH_EVENT, onChange)
  return () => {
    window.removeEventListener("hashchange", onChange)
    window.removeEventListener(DECK_HASH_EVENT, onChange)
  }
}

/**
 * The slide lives in the URL hash (`#3`), so a deep link, the back button after leaving and a
 * language switch all land on the same slide. The server and the first render show slide 1; the
 * pre-paint boot script hides that difference for deep links.
 */
export function useSlideHash(count: number): [index: number, setIndex: (index: number) => void] {
  const read = useCallback(() => slideFromHash(window.location.hash, count) ?? 0, [count])
  const index = useSyncExternalStore(subscribe, read, () => 0)

  const setIndex = useCallback(
    (next: number) => {
      window.history.replaceState(null, "", hashForSlide(clampSlide(next, count)))
      window.dispatchEvent(new Event(DECK_HASH_EVENT))
    },
    [count],
  )

  return [index, setIndex]
}
