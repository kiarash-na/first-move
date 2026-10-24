"use client"

import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { firstRoute, modulesFor, type StartPath } from "@/lib/dashboard/start-paths"
import { TEXT_LIMITS } from "@/lib/project"
import { useDictionary } from "../_components/i18n-provider"
import { useProjectActions } from "../_components/project-actions/use-project-actions"
import { useStore } from "../_components/store-provider"

/** Path tile → name → create → first step (PLAN-DASH-07 step 2). */
export function NewProjectDialog({ path, onOpenChange }: { path: StartPath | null; onOpenChange: (open: boolean) => void }) {
  const start = useDictionary("start")
  const shell = useDictionary("shell")
  const store = useStore()
  const { go } = useProjectActions()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const copy = start.newProject

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!path || busy) return
    const name = String(new FormData(event.currentTarget).get("name") ?? "").slice(0, TEXT_LIMITS.name)
    const modules = modulesFor(path)
    setBusy(true)
    setFailed(false)
    try {
      await store.create({ modules, name })
      onOpenChange(false)
      go(firstRoute(modules))
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={path !== null} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={shell.close}>
        <form onSubmit={(event) => void submit(event)} className="grid gap-5">
          <DialogHeader>
            {path && <p className="font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">{start.paths[path].title}</p>}
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.body}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="new-project-name">{copy.label}</Label>
            <Input
              id="new-project-name"
              name="name"
              defaultValue={copy.defaultName}
              maxLength={TEXT_LIMITS.name}
              autoComplete="off"
              autoFocus
              onFocus={(event) => event.currentTarget.select()}
            />
            {failed && (
              <p role="alert" className="text-sm text-hot">
                {copy.failed}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {copy.cancel}
            </Button>
            <Button type="submit" variant={path === "business-plan" ? "hot" : "default"} disabled={busy}>
              {copy.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
