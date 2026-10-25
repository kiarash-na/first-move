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
    ["Option 2 – nein danke", "businessPlan", false],
    ["Hi,\n\n3, yes", "both", true],
  ] as const)("reads the menu answer %j", (text, module, wantsFile) => {
    expect(parseReply(text)).toMatchObject({ command: null, module, onlyChoice: true, wantsFile })
  })

  it.each([
    "All right, the Quick Check please.",
    "Alles klar, ich nehme den Quick Check. Datei ja.",
    "3,5 ha, 42 Gebäude, Wohngebäude 1961-1990: 100 %, Grundwasser hoch",
    "One question first: what does 5GDHC mean?",
    "3 buildings on 2 ha",
    "1.5 ha",
  ])("reads no menu answer from the opener or the numbers of %j", (text) => {
    expect(parseReply(text)).toMatchObject({ command: null, module: null, onlyChoice: false })
  })

  it("says when more than the menu answer came", () => {
    expect(parseReply("1, yes\n\nThe project is called Sonnenhof.")).toMatchObject({ module: "quickCheck", onlyChoice: false })
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

  it.each([
    "Thanks. Could I talk to a human about the tariffs?",
    "Kann ich bitte mit einem Menschen sprechen?",
    "Hello,\n\nCan I speak with a real person, please?",
    "I'd like to talk to a person instead.",
    "Ich möchte mit einem echten Menschen reden.",
    "human",
  ])("reads a request for a person on the first line: %j", (text) => {
    expect(parseReply(text).command).toBe("human")
  })

  it.each([
    "Our human resources team has 40 buildings",
    "We will talk to people in the district at a town hall meeting",
    "first we need to speak with someone at the municipality",
    "Our plan is to chat with people from the neighbourhood association",
    "Quick Check: 42 Gebäude, 3,5 ha. Wir wollen mit echten Menschen im Quartier reden.",
    "42 buildings on 3.5 ha.\nCould I talk to a human about the tariffs?",
  ])("does not read project text as a request for a person: %j", (text) => {
    expect(parseReply(text).command).toBeNull()
  })

  it("does not read prose or quoted history as commands", () => {
    const prose = "Stop the presses: we have 42 buildings on 3.5 ha, mostly residential from 1961-1990, and ground water with high potential."
    expect(parseReply(prose)).toMatchObject({ command: null, module: null, wantsFile: null, hasNumbers: true })
    expect(parseReply("1. 42\n2. 35000 m2")).toMatchObject({ module: null, hasNumbers: true })
    expect(parseReply("Thanks!\n\nOn Mon, 1 Jan 2026, agent wrote:\n> stop").command).toBeNull()
  })
})
