/** Colour themes (D-16): dark is the default; the dashboard and docs may switch to light. */
export const THEMES = ["dark", "light"] as const

export type Theme = (typeof THEMES)[number]

export const DEFAULT_THEME: Theme = "dark"

/** localStorage key for the stored choice (a per-browser UI preference, not project data). */
export const THEME_STORAGE_KEY = "first-move:theme"

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value)
}

/** The theme currently on `<html data-theme>`. */
export function currentTheme(root: HTMLElement = document.documentElement): Theme {
  const value = root.getAttribute("data-theme")
  return isTheme(value) ? value : DEFAULT_THEME
}

export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  root.setAttribute("data-theme", theme)
}

/** Client only, outside render (effects and event handlers). */
export function readStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(value) ? value : null
  } catch {
    return null
  }
}

/** Client only, outside render (effects and event handlers). */
export function storeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage can be blocked (private mode); the theme still applies for this page.
  }
}

/** Pre-paint inline script for `<head>`: applies the stored choice before first paint. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`
