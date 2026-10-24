/** One file of a test ZIP. The options produce the malformed archives the guards must reject. */
export interface FixtureEntry {
  name: string
  data: Uint8Array | string
  /** Deflate the data (the default); false stores it. */
  deflate?: boolean
  /** Lie about the uncompressed size in both headers. */
  declaredSize?: number
  /** Set the "encrypted" flag; the data stays as it is. */
  encrypted?: boolean
  /** Override the compression method (8 deflate, 0 stored; 12 is bzip2). */
  method?: number
}

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let crc = index
  for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
  return crc >>> 0
})

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

export async function deflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as Uint8Array<ArrayBuffer>]).stream().pipeThrough(new CompressionStream("deflate-raw"))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

const bytesOf = (data: Uint8Array | string) => (typeof data === "string" ? new TextEncoder().encode(data) : data)

function concat(parts: readonly Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.byteLength, 0))
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.byteLength
  }
  return out
}

function header(size: number, write: (view: DataView) => void): Uint8Array {
  const out = new Uint8Array(size)
  write(new DataView(out.buffer))
  return out
}

/** Builds a ZIP archive (local headers, central directory, end record) for tests. */
export async function makeZip(entries: readonly FixtureEntry[]): Promise<Uint8Array> {
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0
  for (const entry of entries) {
    const raw = bytesOf(entry.data)
    const deflate = entry.deflate ?? true
    const body = deflate ? await deflateRaw(raw) : raw
    const name = new TextEncoder().encode(entry.name)
    const method = entry.method ?? (deflate ? 8 : 0)
    const flags = (entry.encrypted ? 1 : 0) | 0x800
    const crc = crc32(raw)
    const size = entry.declaredSize ?? raw.byteLength
    const local = header(30, (view) => {
      view.setUint32(0, 0x04034b50, true)
      view.setUint16(4, 20, true)
      view.setUint16(6, flags, true)
      view.setUint16(8, method, true)
      view.setUint16(12, 0x21, true)
      view.setUint32(14, crc, true)
      view.setUint32(18, body.byteLength, true)
      view.setUint32(22, size, true)
      view.setUint16(26, name.byteLength, true)
    })
    const central = header(46, (view) => {
      view.setUint32(0, 0x02014b50, true)
      view.setUint16(4, 20, true)
      view.setUint16(6, 20, true)
      view.setUint16(8, flags, true)
      view.setUint16(10, method, true)
      view.setUint16(14, 0x21, true)
      view.setUint32(16, crc, true)
      view.setUint32(20, body.byteLength, true)
      view.setUint32(24, size, true)
      view.setUint16(28, name.byteLength, true)
      view.setUint32(42, offset, true)
    })
    locals.push(local, name, body)
    centrals.push(central, name)
    offset += local.byteLength + name.byteLength + body.byteLength
  }
  const directory = concat(centrals)
  const end = header(22, (view) => {
    view.setUint32(0, 0x06054b50, true)
    view.setUint16(8, entries.length, true)
    view.setUint16(10, entries.length, true)
    view.setUint32(12, directory.byteLength, true)
    view.setUint32(16, offset, true)
  })
  return concat([...locals, directory, end])
}
