// data/contact.ts
// Extracted from components/sections/contact.tsx.

export const contact = {
  email: "selrvk@gmail.com",
  phone: "+63 939 354 7380",
  phoneHref: "tel:+639393547380",
  availabilityNote: "Currently available for work",
  blurb:
    "I'm open to freelance work, collaborations, and full-time opportunities. Whether it's a product idea, a design system, or just a conversation — reach out.",
} as const

export const directContact = [
  { code: "01", label: "Email", value: contact.email, href: `mailto:${contact.email}`, action: "Send email" },
  { code: "02", label: "Phone", value: contact.phone, href: contact.phoneHref, action: "Call" },
] as const

/**
 * Prompts for the terminal-style contact form drawn on the laptop screen.
 * `key` maps to the hidden DOM <input> that actually collects the value.
 */
export const contactPrompts = [
  { key: "name", prompt: "name:", placeholder: "your name", type: "text", required: true, maxLength: 80 },
  { key: "email", prompt: "email:", placeholder: "you@domain.com", type: "email", required: true, maxLength: 120 },
  { key: "message", prompt: "message:", placeholder: "what are we building?", type: "textarea", required: true, maxLength: 600 },
] as const

export type ContactPrompt = (typeof contactPrompts)[number]
export type ContactField = ContactPrompt["key"]
