import { errorName } from "./web-storage"

/**
 * "Link to a file" autosave (D-12): the File System Access API writes each save to a file the
 * user picked. Chromium only; everywhere else `isFileLinkSupported` is false and the UI hides it.
 * Nothing is uploaded: the file is on the user's disk.
 */

/** Permission methods Chromium adds to handles (not in TypeScript's DOM types yet). */
interface PermissionedHandle extends FileSystemFileHandle {
  queryPermission?(descriptor: { mode: "readwrite" }): Promise<PermissionState>
  requestPermission?(descriptor: { mode: "readwrite" }): Promise<PermissionState>
}

interface SaveFilePickerOptions {
  suggestedName?: string
  id?: string
  types?: { description?: string; accept: Record<string, string[]> }[]
}

interface PickerWindow {
  showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>
  isSecureContext?: boolean
  self?: unknown
  top?: unknown
}

export const FILE_LINK_ERROR_CODES = ["permission", "not-found", "write-failed"] as const

export type FileLinkErrorCode = (typeof FILE_LINK_ERROR_CODES)[number]

/** What the app needs from the API (injectable for tests). */
export interface FileLinkApi {
  /** Asks the user where to save; null when they cancel. Call from a click handler. */
  pick(suggestedName: string): Promise<FileSystemFileHandle | null>
  /** Current permission; with `request`, asks the user (needs a click). */
  permission(handle: FileSystemFileHandle, request: boolean): Promise<PermissionState>
  write(handle: FileSystemFileHandle, text: string): Promise<void>
}

/** Feature detection: a top-level, secure Chromium page with `showSaveFilePicker`. */
export function isFileLinkSupported(win: PickerWindow | undefined = typeof window === "undefined" ? undefined : window): boolean {
  if (!win || typeof win.showSaveFilePicker !== "function" || win.isSecureContext === false) return false
  try {
    return win.self === win.top
  } catch {
    return false
  }
}

/** Maps a failed write or permission call to what the UI explains. */
export function fileLinkErrorCode(error: unknown): FileLinkErrorCode {
  const name = errorName(error)
  if (name === "NotAllowedError" || name === "SecurityError") return "permission"
  if (name === "NotFoundError") return "not-found"
  return "write-failed"
}

/** The browser implementation, or null when unsupported. */
export function createFileLinkApi(win: PickerWindow | undefined = typeof window === "undefined" ? undefined : window): FileLinkApi | null {
  if (!win || !isFileLinkSupported(win)) return null
  const picker = win.showSaveFilePicker!.bind(win)
  return {
    async pick(suggestedName) {
      try {
        return await picker({
          suggestedName,
          id: "first-move",
          types: [{ accept: { "application/json": [".json"] } }],
        })
      } catch (error) {
        if (errorName(error) === "AbortError") return null
        throw error
      }
    },
    async permission(handle, request) {
      const permissioned = handle as PermissionedHandle
      const descriptor = { mode: "readwrite" } as const
      const current = (await permissioned.queryPermission?.(descriptor)) ?? "granted"
      if (current !== "prompt" || !request) return current
      return (await permissioned.requestPermission?.(descriptor)) ?? "denied"
    },
    async write(handle, text) {
      const writable = await handle.createWritable()
      try {
        await writable.write(text)
      } finally {
        await writable.close()
      }
    },
  }
}
