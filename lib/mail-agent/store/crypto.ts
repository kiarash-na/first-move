import "server-only"

const VERSION = "v1"
const IV_BYTES = 12

const base64url = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64url")
const fromBase64url = (text: string) => new Uint8Array(Buffer.from(text, "base64url"))

const imported = new WeakMap<Uint8Array, Promise<CryptoKey>>()

function aesKey(secret: Uint8Array): Promise<CryptoKey> {
  let key = imported.get(secret)
  if (!key) {
    key = crypto.subtle.importKey("raw", secret as Uint8Array<ArrayBuffer>, "AES-GCM", false, ["encrypt", "decrypt"])
    imported.set(secret, key)
  }
  return key
}

/**
 * Encrypts a record with AES-256-GCM (PLAN-AGENT-06 step 4): a random 12-byte IV per record, the
 * store key name as additional data (so a sealed value cannot be moved to another key), and a
 * versioned envelope `v1.<iv>.<ciphertext and tag>`.
 */
export async function seal(secret: Uint8Array, keyName: string, plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const data = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: new TextEncoder().encode(keyName) },
    await aesKey(secret),
    new TextEncoder().encode(plaintext),
  )
  return `${VERSION}.${base64url(iv)}.${base64url(new Uint8Array(data))}`
}

/** Decrypts a sealed record; null when the envelope is unknown, tampered with or sealed for another key. */
export async function open(secret: Uint8Array, keyName: string, envelope: string): Promise<string | null> {
  const [version, iv, data, ...rest] = envelope.split(".")
  if (version !== VERSION || !iv || !data || rest.length > 0) return null
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64url(iv) as Uint8Array<ArrayBuffer>, additionalData: new TextEncoder().encode(keyName) },
      await aesKey(secret),
      fromBase64url(data) as Uint8Array<ArrayBuffer>,
    )
    return new TextDecoder().decode(plain)
  } catch {
    return null
  }
}
