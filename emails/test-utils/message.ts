import type { MailMessage, Section } from "../model"

/** A complete message for template tests, with the given sections. */
export function testMessage(sections: Section[], overrides: Partial<MailMessage> = {}): MailMessage {
  return {
    locale: "en",
    title: "First Move assistant",
    preheader: "Your Quick Check result",
    brand: "First Move",
    tagline: "Screening for fifth-generation district heating and cooling",
    greeting: "Hello,",
    sections,
    signoff: "First Move assistant",
    footer: {
      ai: "Written by an AI system. It can be wrong and is not binding.",
      human: "Privacy or legal requests, or anything for a person: {address}",
      humanAddress: "human@mail.firstmove.energy",
      links: [
        { label: "Terms", href: "https://firstmove.energy/en/terms" },
        { label: "Privacy Policy", href: "https://firstmove.energy/en/privacy" },
      ],
    },
    ...overrides,
  }
}
