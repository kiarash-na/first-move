import { THEME_INIT_SCRIPT } from "@/lib/theme/theme"

/**
 * Pre-paint theme script for `<head>` in the dashboard and docs root layouts
 * (preventing-flash-before-hydration guide). The landing never renders it: it is always dark.
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
}
