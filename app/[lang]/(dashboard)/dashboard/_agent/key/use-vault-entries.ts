"use client"

import { useCallback, useEffect, useState } from "react"

import { listVault, type VaultEntry } from "@/lib/assistant/vault/vault"

/**
 * The keys remembered on this device (without anything secret), read from IndexedDB after mount,
 * never while rendering. `refresh` reads them again after a change.
 */
export function useVaultEntries(): { entries: VaultEntry[]; refresh: () => void } {
  const [entries, setEntries] = useState<VaultEntry[]>([])
  const [version, setVersion] = useState(0)
  useEffect(() => {
    let live = true
    listVault()
      .then((found) => live && setEntries(found))
      .catch(() => live && setEntries([]))
    return () => {
      live = false
    }
  }, [version])
  const refresh = useCallback(() => setVersion((value) => value + 1), [])
  return { entries, refresh }
}
