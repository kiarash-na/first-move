/**
 * Test helper: an in-memory Web Storage (localStorage / sessionStorage) with an optional quota in
 * characters, so quota errors and blocked storage can be simulated. Not used by the app.
 */
export class MemoryStorage implements Storage {
  private readonly items = new Map<string, string>()

  /** `quota`: max total characters of keys and values; `blocked`: every call throws. */
  constructor(
    private readonly options: { quota?: number; blocked?: boolean } = {},
  ) {}

  get length(): number {
    this.check()
    return this.items.size
  }

  key(index: number): string | null {
    this.check()
    return [...this.items.keys()][index] ?? null
  }

  getItem(key: string): string | null {
    this.check()
    return this.items.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.check()
    const size = this.used() - (this.items.has(key) ? key.length + this.items.get(key)!.length : 0) + key.length + value.length
    if (this.options.quota !== undefined && size > this.options.quota) {
      throw new DOMException("The quota has been exceeded.", "QuotaExceededError")
    }
    this.items.set(key, String(value))
  }

  removeItem(key: string): void {
    this.check()
    this.items.delete(key)
  }

  clear(): void {
    this.check()
    this.items.clear()
  }

  /** Characters stored (keys and values). */
  used(): number {
    let total = 0
    for (const [key, value] of this.items) total += key.length + value.length
    return total
  }

  private check() {
    if (this.options.blocked) throw new DOMException("The operation is insecure.", "SecurityError")
  }
}
