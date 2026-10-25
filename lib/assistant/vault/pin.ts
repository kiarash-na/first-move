/** A vault PIN: exactly six digits (D-50). */
export const PIN_LENGTH = 6

/**
 * The 20 six-digit PINs people choose most: the ten repeated digits, the straight and mirrored
 * runs, and the common keypad patterns (Wang et al., "Understanding Human-Chosen PINs", 2017).
 * A PIN from this list is refused, because anyone sitting at the browser would try it first.
 */
export const COMMON_PINS: readonly string[] = [
  "000000",
  "111111",
  "222222",
  "333333",
  "444444",
  "555555",
  "666666",
  "777777",
  "888888",
  "999999",
  "123456",
  "654321",
  "123123",
  "121212",
  "112233",
  "123321",
  "159753",
  "789456",
  "147258",
  "101010",
]

export type PinProblem = "format" | "common" | "mismatch"

/** Why a new PIN cannot be used, or null: six digits, not a common PIN, typed the same twice. */
export function pinProblem(pin: string, repeat: string): PinProblem | null {
  if (!isPinFormat(pin)) return "format"
  if (COMMON_PINS.includes(pin)) return "common"
  return pin === repeat ? null : "mismatch"
}

/** Exactly six ASCII digits. */
export function isPinFormat(pin: string): boolean {
  return new RegExp(`^[0-9]{${PIN_LENGTH}}$`).test(pin)
}
