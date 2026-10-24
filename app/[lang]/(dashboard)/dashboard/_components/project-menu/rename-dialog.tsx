"use client"

import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { validationMessage } from "@/lib/dashboard/validation-message"
import { TEXT_LIMITS } from "@/lib/project"
import { useDictionary, useLocale } from "../i18n-provider"
import { useStore } from "../store-provider"

/** Renames a project through the registry field `meta.name` (D-05). */
export function RenameDialog({
  project,
  onOpenChange,
}: {
  project: { id: string; name: string } | null
  onOpenChange: (open: boolean) => void
}) {
  const shell = useDictionary("shell")
  const lang = useLocale()
  const store = useStore()
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!project) return
    const name = String(new FormData(event.currentTarget).get("name") ?? "")
    const result = await store.rename(project.id, name)
    const problem = result?.errors[0]
    if (problem) {
      setError(validationMessage(problem, shell, lang))
      return
    }
    onOpenChange(false)
  }

  return (
    <Dialog
      open={project !== null}
      onOpenChange={(open) => {
        setError(null)
        onOpenChange(open)
      }}
    >
      <DialogContent closeLabel={shell.close}>
        <form onSubmit={(event) => void submit(event)} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>{shell.rename.title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="rename-project">{shell.rename.label}</Label>
            <Input
              id="rename-project"
              name="name"
              defaultValue={project?.name ?? ""}
              placeholder={shell.fields.meta.name.placeholder}
              maxLength={TEXT_LIMITS.name}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "rename-project-error" : undefined}
              autoComplete="off"
              autoFocus
            />
            {error && (
              <p id="rename-project-error" className="text-sm text-hot">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {shell.rename.cancel}
            </Button>
            <Button type="submit">{shell.rename.save}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
