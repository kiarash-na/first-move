import { describe, expect, it } from "vitest"
import { newEmailText } from "./email-body"

describe("newEmailText", () => {
  it("keeps a message without history unchanged", () => {
    expect(newEmailText("Hello,\n\nwhat is a Quick Check?\n")).toEqual({ text: "Hello,\n\nwhat is a Quick Check?", stripped: false })
  })

  it("drops Gmail-style history in English, also when the attribution line wraps", () => {
    const body = "Yes, 120 buildings.\n\nOn Mon, 3 Nov 2026 at 10:02, First Move assistant (AI) <agent@mail.firstmove.energy>\nwrote:\n> How many buildings?\n"
    expect(newEmailText(body)).toEqual({ text: "Yes, 120 buildings.", stripped: true })
    expect(newEmailText("Ok\nOn Mon, Nov 3, 2026 at 10:02 AM Bot <a@b.c> wrote:\n> q").text).toBe("Ok")
  })

  it("drops German attribution lines", () => {
    expect(newEmailText("Ja, 12 ha.\n\nAm 03.11.2026 um 10:02 schrieb First Move <agent@mail.firstmove.energy>:\n> Fläche?").text).toBe("Ja, 12 ha.")
    expect(newEmailText("Ja.\nAm Mo., 3. Nov. 2026 um 10:02 Uhr schrieb Bot\n<a@b.c>:\n> x").text).toBe("Ja.")
  })

  it("drops Outlook header blocks and separators, EN and DE", () => {
    expect(newEmailText("Answer\n\nFrom: Bot <a@b.c>\nSent: Monday, 3 November 2026 10:02\nTo: me\nSubject: Re: Quick Check\n\nOld text").text).toBe("Answer")
    expect(newEmailText("Antwort\n________________________________\nVon: Bot <a@b.c>\nGesendet: Montag\nAn: ich\nBetreff: AW: x\nAlt").text).toBe("Antwort")
    expect(newEmailText("Answer\n-----Original Message-----\nold").text).toBe("Answer")
    expect(newEmailText("Antwort\n----- Ursprüngliche Nachricht -----\nalt").text).toBe("Antwort")
  })

  it("keeps interleaved answers but drops the quoted lines between them", () => {
    const body = "> Number of buildings?\n120\n> Project area?\n12 ha"
    expect(newEmailText(body)).toEqual({ text: "120\n12 ha", stripped: true })
  })

  it("drops the signature after '-- ' and mobile signatures", () => {
    expect(newEmailText("The area is 12 ha.\n-- \nJane Doe\nCity of Example").text).toBe("The area is 12 ha.")
    expect(newEmailText("Ja\n\nVon meinem iPhone gesendet").text).toBe("Ja")
    expect(newEmailText("Yes\nSent from my Android phone").text).toBe("Yes")
  })

  it("keeps the full text of a bare forward, where nothing new was written", () => {
    const body = "---------- Forwarded message ---------\nFrom: Planner <p@x.y>\nDate: Mon\nSubject: Data\nTo: me\n\n120 buildings, 12 ha"
    expect(newEmailText(body)).toEqual({ text: body, stripped: false })
  })

  it("does not cut at ordinary sentences that mention writing", () => {
    expect(newEmailText("On Monday the council wrote back.\nThey agree.").text).toBe("On Monday the council wrote back.\nThey agree.")
  })
})
