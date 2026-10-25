// @vitest-environment node
import { describe, expect, it } from "vitest"
import { parseReply } from "./commands"

describe("parseReply", () => {
  it.each([
    ["1", "quickCheck", null],
    ["2, yes", "businessPlan", true],
    ["3, no", "both", false],
    ["both, no", "both", false],
    ["Beides, ja bitte", "both", true],
    ["Quick Check please", "quickCheck", true],
    ["Quick Check and Business Plan, yes", "both", true],
    ["den Business Plan, nein", "businessPlan", false],
    ["1 - ja", "quickCheck", true],
  ] as const)("reads the menu answer %j", (text, module, wantsFile) => {
    expect(parseReply(text)).toMatchObject({ command: null, module, wantsFile })
  })

  it.each([
    ["stop", "stop"],
    ["Stopp.", "stop"],
    ["Please stop", "stop"],
    ["new", "new"],
    ["Neu", "new"],
    ["file", "file"],
    ["Datei bitte", "file"],
    ["weiter", "next"],
    ["Next", "next"],
  ] as const)("reads the command %j", (text, command) => {
    expect(parseReply(text).command).toBe(command)
  })

  it("finds a request for a person anywhere in the text", () => {
    expect(parseReply("Thanks. Could I talk to a human about the tariffs?").command).toBe("human")
    expect(parseReply("Kann ich bitte mit einem Menschen sprechen?").command).toBe("human")
    expect(parseReply("Our human resources team has 40 buildings").command).toBeNull()
  })

  it("does not read prose or quoted history as commands", () => {
    const prose = "Stop the presses: we have 42 buildings on 3.5 ha, mostly residential from 1961-1990, and ground water with high potential."
    expect(parseReply(prose)).toMatchObject({ command: null, module: null, wantsFile: null, hasNumbers: true })
    expect(parseReply("1. 42\n2. 35000 m2").module).toBe("quickCheck")
    expect(parseReply("Thanks!\n\nOn Mon, 1 Jan 2026, agent wrote:\n> stop").command).toBeNull()
  })
})
