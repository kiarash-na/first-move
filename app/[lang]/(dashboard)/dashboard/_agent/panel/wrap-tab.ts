const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]'

/**
 * The elements Tab reaches inside `container`, in order. An unchecked radio is left out: Tab
 * reaches only the checked one of its group, and every group in the panel has one checked.
 */
export function tabbables(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(TABBABLE)].filter(
    (element) => element.tabIndex >= 0 && !element.closest("[hidden], [inert]") && !(element instanceof HTMLInputElement && element.type === "radio" && !element.checked),
  )
}

type TabEvent = Pick<KeyboardEvent, "key" | "shiftKey" | "defaultPrevented" | "preventDefault">

/**
 * Keeps Tab and Shift+Tab inside `container` while it is modal: Tab from the last element goes
 * to the first, Shift+Tab from the first (or from the container itself) to the last.
 */
export function wrapTab(event: TabEvent, container: HTMLElement): void {
  if (event.key !== "Tab" || event.defaultPrevented) return
  const items = tabbables(container)
  const active = document.activeElement
  const inside = active instanceof HTMLElement && container.contains(active)
  if (items.length === 0) {
    event.preventDefault()
    container.focus()
    return
  }
  const first = items[0]
  const last = items[items.length - 1]
  if (event.shiftKey && (!inside || active === first || active === container)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && (!inside || active === last)) {
    event.preventDefault()
    first.focus()
  }
}
