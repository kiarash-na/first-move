import "server-only"
import { drop, pass, type Gate } from "./types"

/**
 * Gate 2 (D-54): only mail whose From domain passed DMARC, as the receiving server reports it
 * (a separate field, not a header a sender could write). Anything else is dropped silently.
 */
export const dmarcGate: Gate = ({ email }) => (email.authentication.dmarc === "pass" ? pass : drop("dmarc"))
