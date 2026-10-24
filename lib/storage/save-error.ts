import { errorName, isQuotaError } from "./web-storage"

/** Why a save failed (`shell.storage.saveError.<code>`). */
export const SAVE_ERROR_CODES = ["quota-exceeded", "unavailable", "write-failed"] as const

export type SaveErrorCode = (typeof SAVE_ERROR_CODES)[number]

/** Maps an IndexedDB or storage error to a save error code. */
export function saveErrorCode(error: unknown): SaveErrorCode {
  if (isQuotaError(error)) return "quota-exceeded"
  const name = errorName(error)
  if (name === "InvalidStateError" || name === "TransactionInactiveError") return "unavailable"
  return "write-failed"
}
