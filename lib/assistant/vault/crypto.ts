/**
 * The vault's cryptography (D-50), Web Crypto only. The key is sealed twice with AES-256-GCM:
 * inside under a key derived from the PIN (PBKDF2-SHA-256, 600,000 iterations, 16-byte random
 * salt), outside under a device key that is created non-extractable and never leaves IndexedDB.
 * Both layers authenticate the provider and the record version as associated data.
 */
export const PBKDF2_ITERATIONS = 600_000
export const SALT_BYTES = 16
export const IV_BYTES = 12

const AES = { name: "AES-GCM", length: 256 } as const
const encoder = new TextEncoder()

export function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(length))
}

/** The inner key: from the PIN and the salt, usable only for AES-GCM, never exportable. */
export async function derivePinKey(pin: string, salt: Uint8Array<ArrayBuffer>, iterations = PBKDF2_ITERATIONS): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", encoder.encode(pin), "PBKDF2", false, ["deriveKey"])
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, base, AES, false, ["encrypt", "decrypt"])
}

/** The outer key of this browser profile. Non-extractable: scripts can use it but never read it. */
export function createDeviceKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(AES, false, ["encrypt", "decrypt"])
}

export interface Sealed {
  iv: Uint8Array<ArrayBuffer>
  data: Uint8Array<ArrayBuffer>
}

export async function seal(key: CryptoKey, plain: Uint8Array<ArrayBuffer>, aad: Uint8Array<ArrayBuffer>): Promise<Sealed> {
  const iv = randomBytes(IV_BYTES)
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: aad }, key, plain))
  return { iv, data }
}

/** Throws when the key is wrong or anything was changed (GCM tag check). */
export async function unseal(key: CryptoKey, sealed: Sealed, aad: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: sealed.iv, additionalData: aad }, key, sealed.data))
}

export const utf8 = (text: string): Uint8Array<ArrayBuffer> => encoder.encode(text)
export const fromUtf8 = (bytes: Uint8Array<ArrayBuffer>): string => new TextDecoder().decode(bytes)
