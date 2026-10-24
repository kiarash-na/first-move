import type { FileLinkApi } from "@/lib/storage/file-link"

/** Test helper: a File System Access stand-in that records writes. Not used by the app. */
export interface FakeFileLink {
  api: FileLinkApi
  /** Text last written per file name. */
  files: Map<string, string>
  /** What `permission` answers (without and with a prompt). */
  permission: { query: PermissionState; request: PermissionState }
  /** The next `pick` result: a file name, null (cancelled) or an error to throw. */
  nextPick: string | null | Error
  /** Error thrown by the next writes, if any. */
  writeError: Error | null
}

export function fakeFileLink(): FakeFileLink {
  const fake: FakeFileLink = {
    files: new Map(),
    permission: { query: "granted", request: "granted" },
    nextPick: "project.firstmove.json",
    writeError: null,
    api: {
      async pick() {
        const next = fake.nextPick
        if (next instanceof Error) throw next
        if (next === null) return null
        return { kind: "file", name: next } as unknown as FileSystemFileHandle
      },
      async permission(_handle, request) {
        const current = fake.permission.query
        return current === "prompt" && request ? fake.permission.request : current
      },
      async write(handle, text) {
        if (fake.writeError) throw fake.writeError
        fake.files.set(handle.name, text)
      },
    },
  }
  return fake
}
