"use client"

import { useRouter } from "next/navigation"
import { useCallback, useMemo } from "react"
import { toast } from "sonner"

import { dashboardHref, type DashboardRoute } from "@/lib/dashboard/routes"
import { interpolate } from "@/lib/i18n/interpolate"
import { downloadFile } from "@/lib/storage"
import { useDictionary, useLocale } from "../i18n-provider"
import { useStore } from "../store-provider"

export interface ProjectActions {
  /** Opens a stored project in this tab and goes to its overview (PLAN-DASH-07). */
  open(id: string, route?: DashboardRoute): Promise<boolean>
  /** Copies a project under "<name> (copy)" (D-29); stays on the page. */
  duplicate(id: string, name: string): Promise<boolean>
  /** Downloads a project as `.firstmove.json` (D-13); the active one by default. */
  exportProject(id?: string): Promise<boolean>
  /** Goes to a dashboard route of the current language. */
  go(route: DashboardRoute): void
}

/** Store actions with their navigation and toasts, shared by the top bar, project menu and start screen. */
export function useProjectActions(): ProjectActions {
  const router = useRouter()
  const lang = useLocale()
  const shell = useDictionary("shell")
  const store = useStore()

  const go = useCallback((route: DashboardRoute) => router.push(dashboardHref(lang, route)), [router, lang])

  const open = useCallback(
    async (id: string, route: DashboardRoute = { page: "overview" }) => {
      const ok = await store.open(id)
      if (ok) go(route)
      return ok
    },
    [store, go],
  )

  const duplicate = useCallback(
    async (id: string, name: string) => {
      const copyName = interpolate(shell.duplicate.name, { name: name || shell.fields.meta.name.placeholder })
      const copy = await store.duplicate(id, { name: copyName })
      if (copy) toast.success(interpolate(shell.duplicate.done, { name: copy.meta.name }))
      return copy !== null
    },
    [store, shell],
  )

  const exportProject = useCallback(
    async (id?: string) => {
      const file = await store.exportProject(id).catch(() => null)
      if (!file) {
        toast.error(shell.export.failed)
        return false
      }
      downloadFile(file)
      toast.success(interpolate(shell.export.done, { file: file.fileName }))
      return true
    },
    [store, shell],
  )

  return useMemo(() => ({ open, duplicate, exportProject, go }), [open, duplicate, exportProject, go])
}
