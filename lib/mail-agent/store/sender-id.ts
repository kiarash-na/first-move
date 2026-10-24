import "server-only"

/** A plain address: one @, no spaces or angle brackets, a domain with a dot. */
const ADDRESS = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/
const GMAIL = new Set(["gmail.com", "googlemail.com"])

/** The address in a From field (`Name <a@b.c>` or `a@b.c`), lower case; null when there is none. */
export function emailAddress(from: string): string | null {
  const bracketed = /<([^<>]+)>\s*$/.exec(from)
  const address = (bracketed ? bracketed[1] : from).trim().toLowerCase()
  return ADDRESS.test(address) && address.length <= 254 ? address : null
}

/**
 * One mailbox, one id (PLAN-AGENT-06 step 4): lower case, `+tag` dropped, and for Gmail the dots
 * dropped and googlemail.com mapped to gmail.com, so variants of one address share their limits.
 */
export function normalizeAddress(address: string): string {
  const [local, domain] = address.trim().toLowerCase().split("@")
  const base = local.split("+")[0]
  return GMAIL.has(domain) ? `${base.replaceAll(".", "")}@gmail.com` : `${base}@${domain}`
}

export const domainOf = (address: string) => normalizeAddress(address).split("@")[1]

const keys = new WeakMap<Uint8Array, Promise<CryptoKey>>()

function hmacKey(secret: Uint8Array): Promise<CryptoKey> {
  let key = keys.get(secret)
  if (!key) {
    key = crypto.subtle.importKey("raw", secret as Uint8Array<ArrayBuffer>, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    keys.set(secret, key)
  }
  return key
}

/** base64url(HMAC-SHA-256(secret, value)). */
export async function hmacId(secret: Uint8Array, value: string): Promise<string> {
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), new TextEncoder().encode(value))
  return Buffer.from(signature).toString("base64url")
}

/** The sender id `sid`: the store never sees the address itself, only this HMAC. */
export const senderId = (secret: Uint8Array, address: string) => hmacId(secret, `sender:${normalizeAddress(address)}`)

/** The id of the sender's domain, for the per-domain limit. */
export const domainId = (secret: Uint8Array, address: string) => hmacId(secret, `domain:${domainOf(address)}`)
