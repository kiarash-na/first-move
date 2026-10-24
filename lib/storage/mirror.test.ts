// @vitest-environment node
import { describe, expect, it } from "vitest"
import { MIRROR_PREFIX } from "./keys"
import { readAllMirrors, readMirror, removeMirror, writeMirror } from "./mirror"
import { MemoryStorage } from "./test-utils/memory-storage"
import { testId, testProject } from "./test-utils/projects"

const at = (minute: number) => new Date(`2026-10-24T08:${String(minute).padStart(2, "0")}:00.000Z`)

describe("localStorage mirror", () => {
  it("writes, reads and removes a project's latest state", () => {
    const storage = new MemoryStorage()
    const project = testProject(1)
    expect(writeMirror(storage, project, at(1))).toBe("ok")
    expect(readMirror(storage, project.meta.id)).toEqual({ savedAt: at(1).toISOString(), project })
    removeMirror(storage, project.meta.id)
    expect(readMirror(storage, project.meta.id)).toBeNull()
  })

  it("reads every readable copy and skips damaged ones and other keys", () => {
    const storage = new MemoryStorage()
    writeMirror(storage, testProject(1), at(1))
    writeMirror(storage, testProject(2), at(2))
    storage.setItem(`${MIRROR_PREFIX}broken`, "{not json")
    storage.setItem(`${MIRROR_PREFIX}shape`, JSON.stringify({ project: {} }))
    storage.setItem("first-move:theme", "light")
    const all = readAllMirrors(storage)
    expect([...all.keys()].sort()).toEqual([testId(1), testId(2)])
  })

  it("makes room by dropping the oldest other copies when storage is full", () => {
    const size = JSON.stringify({ savedAt: at(0).toISOString(), project: testProject(1) }).length + MIRROR_PREFIX.length + 40
    const storage = new MemoryStorage({ quota: size * 2 })
    writeMirror(storage, testProject(1), at(1))
    writeMirror(storage, testProject(2), at(2))
    expect(writeMirror(storage, testProject(3), at(3))).toBe("ok")
    expect(readMirror(storage, testId(1))).toBeNull()
    expect(readMirror(storage, testId(2))).not.toBeNull()
    expect(readMirror(storage, testId(3))).not.toBeNull()
  })

  it("reports a full storage it cannot free, and blocked or missing storage", () => {
    expect(writeMirror(new MemoryStorage({ quota: 10 }), testProject(1), at(1))).toBe("quota-exceeded")
    expect(writeMirror(new MemoryStorage({ blocked: true }), testProject(1), at(1))).toBe("unavailable")
    expect(writeMirror(null, testProject(1), at(1))).toBe("unavailable")
    expect(readMirror(new MemoryStorage({ blocked: true }), testId(1))).toBeNull()
    expect(readAllMirrors(new MemoryStorage({ blocked: true })).size).toBe(0)
    expect(readAllMirrors(null).size).toBe(0)
    expect(() => removeMirror(new MemoryStorage({ blocked: true }), testId(1))).not.toThrow()
  })
})
