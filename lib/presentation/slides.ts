/**
 * The ten slides of `/[lang]/presentation`, in order (PLAN-PRESENTATION-00). Their copy lives in
 * `dictionaries/<lang>/presentation.json` under `slides.<id>`.
 */
export const SLIDE_IDS = [
  "why",
  "challenge",
  "quickCheck",
  "businessPlan",
  "aiEngine",
  "emails",
  "systemOne",
  "selfHealing",
  "nextMoves",
  "contact",
] as const

export type SlideId = (typeof SLIDE_IDS)[number]

export const SLIDE_COUNT = SLIDE_IDS.length

/** Clamps any number to a valid slide index (0-based). */
export function clampSlide(index: number, count = SLIDE_COUNT): number {
  if (!Number.isFinite(index)) return 0
  return Math.min(count - 1, Math.max(0, Math.trunc(index)))
}

/** `#3` → 2. Anything else (empty, `#0`, `#11`, `#abc`) → null. The hash is 1-based, like the counter. */
export function slideFromHash(hash: string, count = SLIDE_COUNT): number | null {
  const match = /^#?(\d{1,3})$/.exec(hash.trim())
  if (!match) return null
  const number = Number(match[1])
  return number >= 1 && number <= count ? number - 1 : null
}

/** 2 → `#3`. */
export const hashForSlide = (index: number) => `#${index + 1}`

/** `3` → `03`, for the counter. */
export const padSlideNumber = (number: number) => String(number).padStart(2, "0")

export type DeckAction = "next" | "previous" | "first" | "last"

/** What a key does, or null. Space and Shift+Space follow the presentation-software convention. */
export function actionForKey(key: string, shiftKey = false): DeckAction | null {
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
    case "PageDown":
      return "next"
    case " ":
    case "Spacebar":
      return shiftKey ? "previous" : "next"
    case "ArrowLeft":
    case "ArrowUp":
    case "PageUp":
      return "previous"
    case "Home":
      return "first"
    case "End":
      return "last"
    default:
      return null
  }
}

/** The slide an action leads to. */
export function applyAction(index: number, action: DeckAction, count = SLIDE_COUNT): number {
  switch (action) {
    case "next":
      return clampSlide(index + 1, count)
    case "previous":
      return clampSlide(index - 1, count)
    case "first":
      return 0
    case "last":
      return count - 1
  }
}

/** Keys that the focused control itself needs, so the deck must not take them. */
export interface KeyTarget {
  tagName: string
  isContentEditable?: boolean
  role?: string | null
  /** Roles of the target's ancestors, nearest first. */
  ancestorRoles?: readonly string[]
}

const TEXT_INPUTS = new Set(["INPUT", "TEXTAREA", "SELECT"])
const ACTIVATES_ON_SPACE = new Set(["BUTTON", "A", "SUMMARY"])
const ARROW_WIDGETS = new Set(["radiogroup", "tablist", "listbox", "slider", "menu", "menubar", "tree", "grid"])

/** True when the deck should leave the key to the focused element. */
export function keyBelongsToTarget(key: string, target: KeyTarget | null): boolean {
  if (!target) return false
  if (TEXT_INPUTS.has(target.tagName) || target.isContentEditable) return true
  if ((key === " " || key === "Spacebar" || key === "Enter") && (ACTIVATES_ON_SPACE.has(target.tagName) || target.role === "button")) return true
  if (key.startsWith("Arrow") || key === "Home" || key === "End") {
    const roles = [target.role ?? "", ...(target.ancestorRoles ?? [])]
    if (roles.some((role) => ARROW_WIDGETS.has(role))) return true
  }
  return false
}

/** A horizontal swipe: far enough, and clearly more sideways than up or down. */
export function swipeAction(dx: number, dy: number, threshold = 56): DeckAction | null {
  if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.4) return null
  return dx < 0 ? "next" : "previous"
}
