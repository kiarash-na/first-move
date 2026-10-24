/** Room kept above and below the revealed link, so its neighbours hint that the list goes on. */
const MARGIN_PX = 24

/**
 * Scrolls the sidebar's own scroller (never the page) so the current page's link
 * (`aria-current="page"`) is visible (D-07: the sidebar always shows where the user is).
 */
export function revealActiveLink(scroller: HTMLElement): void {
  const link = scroller.querySelector<HTMLElement>('[aria-current="page"]')
  if (!link) return
  const box = scroller.getBoundingClientRect()
  const item = link.getBoundingClientRect()
  if (item.bottom > box.bottom) scroller.scrollTop += item.bottom - box.bottom + MARGIN_PX
  else if (item.top < box.top) scroller.scrollTop -= box.top - item.top + MARGIN_PX
}
