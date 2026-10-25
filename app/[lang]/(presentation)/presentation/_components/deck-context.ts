"use client"

import { createContext, useContext } from "react"

export interface DeckApi {
  /** The slide on screen, 0-based. */
  index: number
  count: number
  /** Goes to a slide; `focus` moves keyboard focus to it (index, links between slides). */
  goTo: (index: number, options?: { focus?: boolean }) => void
}

const noop: DeckApi = { index: 0, count: 1, goTo: () => {} }

export const DeckContext = createContext<DeckApi>(noop)

/** The index of the slide a component sits in. */
export const SlideIndexContext = createContext(0)

export const useDeck = () => useContext(DeckContext)

/** True while the component's own slide is on screen, e.g. to start or reset an animation. */
export function useSlideActive(): boolean {
  const { index } = useDeck()
  return useContext(SlideIndexContext) === index
}
