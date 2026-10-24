"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { validationMessage } from "@/lib/dashboard/validation-message"
import type { ProjectModules } from "@/lib/project"
import { useDictionary, useLocale } from "../i18n-provider"
import { useStore, useStoreState } from "../store-provider"

const MODULES = ["quickCheck", "businessPlan"] as const satisfies readonly (keyof ProjectModules)[]

/** Turns the open project's modules on or off (D-01); data of a module that is off is kept. */
export function ModulesDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Where focus goes when the dialog closes (the menu item that opened it is gone). */
  onCloseAutoFocus?: (event: Event) => void
}) {
  const shell = useDictionary("shell")
  const lang = useLocale()
  const store = useStore()
  const modules = useStoreState((state) => state.active?.meta.modules ?? null)
  const [error, setError] = useState<string | null>(null)
  const copy = shell.fields.meta.modules

  function toggle(module: keyof ProjectModules, on: boolean) {
    const result = store.patch({ [`meta.modules.${module}`]: on })
    const problem = result?.errors[0]
    setError(problem ? validationMessage(problem, shell, lang) : null)
  }

  return (
    <Dialog
      open={open && modules !== null}
      onOpenChange={(next) => {
        setError(null)
        onOpenChange(next)
      }}
    >
      <DialogContent closeLabel={shell.close} onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader>
          <DialogTitle>{shell.modules.title}</DialogTitle>
          <DialogDescription>{copy.help}</DialogDescription>
        </DialogHeader>
        <ul className="divide-y border-y">
          {MODULES.map((module) => (
            <li key={module} className="flex items-center justify-between gap-6 py-4">
              <div className="flex flex-col gap-1">
                <label htmlFor={`module-${module}`} className="text-base font-[520]">
                  {copy[module].label}
                </label>
                <p id={`module-${module}-help`} className="text-sm leading-normal text-muted-foreground">
                  {copy[module].help}
                </p>
              </div>
              <Switch
                id={`module-${module}`}
                checked={modules?.[module] ?? false}
                aria-describedby={`module-${module}-help`}
                onCheckedChange={(on) => toggle(module, on)}
              />
            </li>
          ))}
        </ul>
        {error && (
          <p role="alert" className="text-sm text-hot">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{shell.modules.close}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
