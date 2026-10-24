/**
 * The "Brought to you by" strip on the landing page (D-69). Until partners sign up it shows
 * placeholders; each opens a dialog that points to the owner's contact page.
 */

/** Where "Contact us" in the partner dialog leads (the owner's contact page, new tab). */
export const PARTNER_CONTACT_URL = "https://kiarash.online/contact/"

/** How many "Your Company" placeholders the strip shows. */
export const PARTNER_PLACEHOLDERS = 3

/**
 * How often the placeholder row repeats inside each half of the sliding track. One half must be
 * at least as wide as the widest viewport (1600px), so the loop never shows a gap.
 */
export const PARTNER_REPEATS = 2
