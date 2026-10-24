"use client"

import {
  ChevronDownIcon,
  CopyIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  FileTextIcon,
  HistoryIcon,
  LinkIcon,
  PencilIcon,
  ToggleRightIcon,
  Trash2Icon,
  UnlinkIcon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { useLayoutEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { dashboardHref, isActivePath } from "@/lib/dashboard/routes"
import { interpolate } from "@/lib/i18n/interpolate"
import { EXPORT_EXTENSION } from "@/lib/storage"
import { useDictionary, useLocale } from "../i18n-provider"
import { useImport } from "../import/import-provider"
import { DeleteProjectDialog } from "../project-actions/delete-project-dialog"
import { useProjectActions } from "../project-actions/use-project-actions"
import { useStore, useStoreState } from "../store-provider"
import { ModulesDialog } from "./modules-dialog"
import { RenameDialog } from "./rename-dialog"
import { RestoreDialog } from "./restore-dialog"

type MenuDialog = "rename" | "modules" | "restore" | "delete" | null

/**
 * The project menu of the top bar (D-08): rename, duplicate, modules, restore a version, link
 * to a file (Chromium only, D-12), close and delete (confirm + undo). Below 768px it also holds
 * Export, Import and Report, which the top bar hides there.
 */
export function ProjectMenu() {
  const lang = useLocale()
  const shell = useDictionary("shell")
  const store = useStore()
  const pathname = usePathname()
  const active = useStoreState((state) => state.active)
  const fileLink = useStoreState((state) => state.fileLink)
  const { duplicate, exportProject, go } = useProjectActions()
  const { importFile } = useImport()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dialog, setDialog] = useState<MenuDialog>(null)
  const input = useRef<HTMLInputElement>(null)
  // Transient: close when Activity hides the route (preserving-ui-state guide).
  useLayoutEffect(() => () => setMenuOpen(false), [])

  const copy = shell.projectMenu
  const name = active ? active.meta.name || shell.fields.meta.name.placeholder : shell.nav.noProject
  const target = active ? { id: active.meta.id, name: active.meta.name } : null
  const onStart = isActivePath(pathname, dashboardHref(lang))
  const fileStatus = fileLink.fileName
    ? interpolate(shell.storage.fileLink.status[fileLink.status], { file: fileLink.fileName })
    : null

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          {active ? (
            <Button variant="secondary" className="max-w-[16rem] gap-2 px-3 max-lg:size-11 max-lg:px-0" aria-label={`${copy.label}: ${name}`}>
              <span className="truncate font-sans text-sm font-[520] tracking-normal normal-case max-lg:sr-only">{name}</span>
              <ChevronDownIcon className="max-lg:hidden" strokeWidth={1.6} aria-hidden="true" />
              <EllipsisVerticalIcon className="lg:hidden" strokeWidth={1.6} aria-hidden="true" />
            </Button>
          ) : (
            <Button variant="secondary" size="icon" aria-label={copy.label}>
              <EllipsisVerticalIcon strokeWidth={1.6} aria-hidden="true" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem disabled={!active} onSelect={() => setDialog("rename")}>
              <PencilIcon strokeWidth={1.6} aria-hidden="true" />
              {copy.rename}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!active} onSelect={() => active && void duplicate(active.meta.id, active.meta.name)}>
              <CopyIcon strokeWidth={1.6} aria-hidden="true" />
              {copy.duplicate}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!active} onSelect={() => setDialog("modules")}>
              <ToggleRightIcon strokeWidth={1.6} aria-hidden="true" />
              {copy.modules}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!active} onSelect={() => setDialog("restore")}>
              <HistoryIcon strokeWidth={1.6} aria-hidden="true" />
              {copy.restore}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {active && fileLink.supported && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {fileStatus && <DropdownMenuLabel className="truncate font-sans text-sm tracking-normal normal-case">{fileStatus}</DropdownMenuLabel>}
                {fileLink.status === "off" && (
                  <DropdownMenuItem onSelect={() => void store.linkFile()}>
                    <LinkIcon strokeWidth={1.6} aria-hidden="true" />
                    {copy.linkFile}
                  </DropdownMenuItem>
                )}
                {fileLink.status === "needs-permission" && (
                  <DropdownMenuItem onSelect={() => void store.resumeFileLink()}>
                    <LinkIcon strokeWidth={1.6} aria-hidden="true" />
                    {copy.resumeFile}
                  </DropdownMenuItem>
                )}
                {fileLink.status !== "off" && (
                  <DropdownMenuItem onSelect={() => void store.unlinkFile()}>
                    <UnlinkIcon strokeWidth={1.6} aria-hidden="true" />
                    {copy.unlinkFile}
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </>
          )}
          <DropdownMenuSeparator className="sm:hidden" />
          <DropdownMenuGroup className="sm:hidden">
            <DropdownMenuItem disabled={!active} onSelect={() => void exportProject()}>
              <DownloadIcon strokeWidth={1.6} aria-hidden="true" />
              {shell.topBar.export}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => input.current?.click()}>
              <UploadIcon strokeWidth={1.6} aria-hidden="true" />
              {shell.topBar.import}
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <FileTextIcon strokeWidth={1.6} aria-hidden="true" />
              {shell.topBar.report} · {shell.topBar.reportSoon}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {active && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  void store.close()
                  if (!onStart) go({ page: "start" })
                }}
              >
                <XIcon strokeWidth={1.6} aria-hidden="true" />
                {copy.close}
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => setDialog("delete")}>
                <Trash2Icon strokeWidth={1.6} aria-hidden="true" />
                {copy.delete}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={input}
        type="file"
        accept={`${EXPORT_EXTENSION},.json,application/json`}
        aria-hidden="true"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ""
          if (file) void importFile(file)
        }}
      />
      <RenameDialog project={dialog === "rename" ? target : null} onOpenChange={(open) => !open && setDialog(null)} />
      <ModulesDialog open={dialog === "modules"} onOpenChange={(open) => !open && setDialog(null)} />
      <RestoreDialog projectId={dialog === "restore" && active ? active.meta.id : null} onOpenChange={(open) => !open && setDialog(null)} />
      <DeleteProjectDialog
        project={dialog === "delete" ? target : null}
        onOpenChange={(open) => !open && setDialog(null)}
        onDeleted={() => {
          if (!onStart) go({ page: "start" })
        }}
      />
    </>
  )
}
