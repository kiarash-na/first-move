import { describe, expect, it } from "vitest"
import { cleanFileName } from "./file-name"

describe("cleanFileName", () => {
  it("keeps an ordinary name", () => {
    expect(cleanFileName("Machbarkeitsstudie Wärmenetz 2026.pdf")).toBe("Machbarkeitsstudie Wärmenetz 2026.pdf")
  })

  it("drops path segments", () => {
    expect(cleanFileName("../../etc/passwd")).toBe("passwd")
    expect(cleanFileName("C:\\Users\\me\\data.xlsx")).toBe("data.xlsx")
  })

  it("removes bidi and control characters, flattens whitespace", () => {
    expect(cleanFileName("invoice\u{202E}fdp.exe")).toBe("invoicefdp.exe")
    expect(cleanFileName("a\n\tb\u{0}.csv")).toBe("a b.csv")
  })

  it("cuts long names and names an empty one", () => {
    expect(cleanFileName(`${"x".repeat(300)}.pdf`)).toHaveLength(200)
    expect(cleanFileName("\u{200B}")).toBe("document")
    expect(cleanFileName("")).toBe("document")
  })
})
