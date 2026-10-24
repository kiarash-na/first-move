export interface UnloadGuardOptions {
  target: Window
  /**
   * Writes pending changes synchronously (the localStorage mirror) and starts the IndexedDB
   * write. Returns true when every change is safe in at least one store.
   */
  flush(): boolean
}

export interface UnloadGuard {
  /** Arm while a write is pending; the browser's leave prompt is shown only when armed and unsafe. */
  setArmed(armed: boolean): void
  dispose(): void
}

/**
 * Data safety on leaving the page (D-11). Pending changes are flushed when the page is hidden
 * (tab switch, mobile app switch, close). While a write is pending, `beforeunload` flushes too
 * and asks the user to stay only if the changes could not be kept anywhere. The `beforeunload`
 * listener is attached only while armed, so the page stays eligible for the back/forward cache.
 */
export function installUnloadGuard({ target, flush }: UnloadGuardOptions): UnloadGuard {
  let armed = false
  const doc = target.document

  const onHide = () => {
    if (armed) flush()
  }
  const onVisibility = () => {
    if (doc.visibilityState === "hidden") onHide()
  }
  const onBeforeUnload = (event: BeforeUnloadEvent) => {
    if (flush()) return
    event.preventDefault()
    // Older browsers show the prompt only when returnValue is set.
    event.returnValue = ""
  }

  target.addEventListener("pagehide", onHide)
  doc.addEventListener("visibilitychange", onVisibility)

  return {
    setArmed(next) {
      if (next === armed) return
      armed = next
      if (armed) target.addEventListener("beforeunload", onBeforeUnload)
      else target.removeEventListener("beforeunload", onBeforeUnload)
    },
    dispose() {
      target.removeEventListener("pagehide", onHide)
      doc.removeEventListener("visibilitychange", onVisibility)
      target.removeEventListener("beforeunload", onBeforeUnload)
      armed = false
    },
  }
}
