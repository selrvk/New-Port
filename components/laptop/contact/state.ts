// components/laptop/contact/state.ts
//
// Shared state for the contact form.
//
// The values live in a real DOM <input>/<textarea> positioned invisibly over the
// screen — so autofill, IME, mobile keyboards, paste and screen readers all work —
// while the visible representation is painted onto the laptop's display. Nothing
// here reads raw keystrokes; the input element is the source of truth and this is
// just the channel between it and the painter.
//
// Module-level rather than context because it is read inside the render loop.

import { contactPrompts, type ContactField } from "@/data/contact"

export type ContactState = {
  values: Record<ContactField, string>
  /** Index into contactPrompts. */
  active: number
  focused: boolean
  submitted: boolean
  /** Validation message for the active field, or null. */
  error: string | null
  /**
   * Where the screen's display area lands in CSS pixels, projected from the 3D
   * plane each frame so the invisible input can sit exactly on top of it.
   */
  rect: { x: number; y: number; w: number; h: number; visible: boolean }
  /** Bumped on any change, so the painter knows to redraw. */
  version: number
}

export const contactState: ContactState = {
  values: { name: "", email: "", message: "" },
  active: 0,
  focused: false,
  submitted: false,
  error: null,
  rect: { x: 0, y: 0, w: 0, h: 0, visible: false },
  version: 0,
}

export function resetContact(): void {
  contactState.values = { name: "", email: "", message: "" }
  contactState.active = 0
  contactState.submitted = false
  contactState.error = null
  contactState.version++
}

/** Light validation, matching the required flags in data/contact.ts. */
export function validate(field: ContactField, value: string): string | null {
  const prompt = contactPrompts.find((p) => p.key === field)
  if (!prompt) return null
  const trimmed = value.trim()
  if (prompt.required && !trimmed) return `${field} is required`
  if (field === "email" && trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "that does not look like an email"
  }
  return null
}

export function allValid(): boolean {
  return contactPrompts.every((p) => !validate(p.key, contactState.values[p.key]))
}

/**
 * Composes a mailto for the visitor's own mail client. Nothing is sent from here —
 * the form has no backend, and pretending otherwise would silently drop messages.
 */
export function buildMailto(to: string): string {
  const { name, email, message } = contactState.values
  const subject = `Portfolio enquiry from ${name.trim() || "someone"}`
  const body = [message.trim(), "", "—", name.trim(), email.trim()].join("\n")
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
