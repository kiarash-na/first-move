import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import en from "@/dictionaries/en/presentation.json"
import { OPERATOR } from "@/lib/legal/operator"
import { EmailsSlide } from "./emails-slide"

const copy = en.slides.emails

describe("EmailsSlide", () => {
  it("offers both addresses as mail links, named after the address", () => {
    render(<EmailsSlide number={6} copy={copy} />)
    expect(screen.getByRole("link", { name: `Write to ${OPERATOR.emailAgent}` })).toHaveAttribute("href", `mailto:${OPERATOR.emailAgent}`)
    expect(screen.getByRole("link", { name: `Write to ${OPERATOR.emailHuman}` })).toHaveAttribute("href", `mailto:${OPERATOR.emailHuman}`)
    expect(OPERATOR.emailAgent).toBe("agent@mail.firstmove.energy")
    expect(OPERATOR.emailHuman).toBe("human@mail.firstmove.energy")
  })

  it("tags the agent as experimental, and only on the agent's card", () => {
    render(<EmailsSlide number={6} copy={copy} />)
    const [agent, human] = screen.getAllByRole("listitem")
    expect(agent).toHaveTextContent(copy.agent.status)
    expect(agent).toHaveTextContent(copy.agent.statusNote)
    expect(human).not.toHaveTextContent(copy.agent.status)
    expect(human).toHaveTextContent(copy.human.text)
  })
})
