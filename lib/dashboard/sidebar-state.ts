/**
 * The desktop sidebar can collapse into an icon rail (D-59). The choice is a per-browser UI
 * preference, not project data: `<html data-sidebar="collapsed">` carries it on the page, and CSS
 * draws the rail from that attribute (`rail:` variant and `--sidebar-width` in `app/globals.css`).
 */

/** localStorage key of the choice: `"collapsed"` while collapsed, removed when expanded (Cookie Policy). */
export const SIDEBAR_STORAGE_KEY = "first-move:sidebar"

/** Attribute on `<html>` set by the pre-paint script and the toggle. */
export const SIDEBAR_ATTRIBUTE = "data-sidebar"

/** The one stored value and attribute value; expanded is their absence. */
export const SIDEBAR_COLLAPSED = "collapsed"

/** Whether `<html>` shows the collapsed rail. */
export function isSidebarCollapsed(root: HTMLElement = document.documentElement): boolean {
  return root.getAttribute(SIDEBAR_ATTRIBUTE) === SIDEBAR_COLLAPSED
}

export function applySidebar(collapsed: boolean, root: HTMLElement = document.documentElement): void {
  if (collapsed) root.setAttribute(SIDEBAR_ATTRIBUTE, SIDEBAR_COLLAPSED)
  else root.removeAttribute(SIDEBAR_ATTRIBUTE)
}

/** Client only, outside render (effects and event handlers). */
export function readStoredSidebar(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === SIDEBAR_COLLAPSED
  } catch {
    return false
  }
}

/** Client only, outside render. Expanding removes the key, so it exists only while collapsed. */
export function storeSidebar(collapsed: boolean): void {
  try {
    if (collapsed) window.localStorage.setItem(SIDEBAR_STORAGE_KEY, SIDEBAR_COLLAPSED)
    else window.localStorage.removeItem(SIDEBAR_STORAGE_KEY)
  } catch {
    // Storage can be blocked (private mode); the choice still applies to this page.
  }
}

/** Pre-paint inline script for `<head>`: shows the rail before first paint when it was collapsed. */
export const SIDEBAR_INIT_SCRIPT = `(function(){try{if(localStorage.getItem(${JSON.stringify(
  SIDEBAR_STORAGE_KEY,
)})===${JSON.stringify(SIDEBAR_COLLAPSED)})document.documentElement.setAttribute(${JSON.stringify(
  SIDEBAR_ATTRIBUTE,
)},${JSON.stringify(SIDEBAR_COLLAPSED)})}catch(e){}})()`
