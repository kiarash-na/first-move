import { SLIDE_COUNT } from "./slides"

/** Id of the style the boot script adds and the deck removes once it has taken over. */
export const DECK_BOOT_STYLE_ID = "deck-boot"

/**
 * Pre-paint script of the presentation's root layout (like the theme script of the docs):
 * - marks `<html data-deck="js">`, so the slides stack as one page without JavaScript and turn
 *   into a deck with it;
 * - for a deep link (`#5`), shows that slide instead of the first until the deck hydrates, so the
 *   first slide never flashes.
 */
export const DECK_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;d.setAttribute("data-deck","js");var m=/^#(\\d{1,3})$/.exec(location.hash);var n=m?Number(m[1]):1;if(n>1&&n<=${SLIDE_COUNT}){var s=document.createElement("style");s.id="${DECK_BOOT_STYLE_ID}";s.textContent='.deck-slide{opacity:0!important;visibility:hidden!important}.deck-slide[data-number="'+n+'"]{opacity:1!important;visibility:visible!important;transform:none!important}';document.head.appendChild(s)}}catch(e){}})()`
