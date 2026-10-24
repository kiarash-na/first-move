"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"

import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { NoticeKind, StorageNotice } from "@/lib/store"
import { useDictionary, useLocale } from "../i18n-provider"
import { useProjectActions } from "../project-actions/use-project-actions"
import { useStore, useStoreState } from "../store-provider"

const WARNINGS: readonly NoticeKind[] = ["conflict", "deleted-elsewhere", "unreadable", "reload-required"]

/**
 * Turns store notices into toasts (PLAN-DASH-07): the tab-sync notices, the export reminder
 * (with an Export action) and the load notices. Closing a toast dismisses its notice.
 */
export function NoticeToasts() {
  const lang = useLocale()
  const shell = useDictionary("shell")
  const store = useStore()
  const notices = useStoreState((state) => state.notices)
  const { exportProject } = useProjectActions()
  const shown = useRef(new Set<number>())

  useEffect(() => {
    for (const notice of notices) {
      if (shown.current.has(notice.id)) continue
      shown.current.add(notice.id)
      show(notice)
    }

    function show(notice: StorageNotice) {
      const dismiss = () => store.dismissNotice(notice.id)
      const message = interpolate(shell.storage.notice[notice.kind], { count: formatNumber(notice.count ?? 0, lang) })
      const action =
        notice.kind === "export-reminder"
          ? {
              label: shell.notices.export,
              onClick: () => {
                dismiss()
                void exportProject(notice.projectId ?? undefined)
              },
            }
          : notice.kind === "reload-required"
            ? { label: shell.notices.reload, onClick: () => window.location.reload() }
            : undefined
      const options = {
        id: `notice-${notice.id}`,
        action,
        duration: notice.kind === "reload-required" ? Infinity : 8000,
        onDismiss: dismiss,
        onAutoClose: dismiss,
      }
      if (WARNINGS.includes(notice.kind)) toast.warning(message, options)
      else toast.info(message, options)
    }
  }, [notices, shell, lang, store, exportProject])

  return null
}
