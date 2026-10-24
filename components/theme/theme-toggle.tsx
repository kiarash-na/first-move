"use client"

import { MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/theme/use-theme"

export interface ThemeToggleLabels {
  switchToLight: string
  switchToDark: string
}

/** Light/dark switch for the dashboard and docs (D-16). Labels come from the `common` dictionary. */
export function ThemeToggle({ labels }: { labels: ThemeToggleLabels }) {
  const [theme, setTheme] = useTheme()
  const isDark = theme === "dark"
  const label = isDark ? labels.switchToLight : labels.switchToDark

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      data-theme-current={theme}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <SunIcon strokeWidth={1.6} aria-hidden="true" />
      ) : (
        <MoonIcon strokeWidth={1.6} aria-hidden="true" />
      )}
    </Button>
  )
}
