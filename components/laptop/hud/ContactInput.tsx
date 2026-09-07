"use client"

// components/laptop/hud/ContactInput.tsx
//
// The real form field, laid invisibly over the laptop's screen.
//
// The spec is explicit about this and it is the right call: a genuine <input>
// means autofill, password managers, IME composition, mobile keyboards, paste,
// spellcheck and screen readers all work. Reading raw keystrokes would break every
// one of those. What is painted on the 3D screen is only a representation.
//
// It is transparent rather than hidden — hidden inputs cannot be focused by
// clicking, and `visibility: hidden` or `display: none` would take it out of the
// accessibility tree entirely.
//
// The field is UNCONTROLLED, deliberately. `contactState` is a plain mutable object
// read by the render loop, not React state, so a `value` prop would never change as
// far as React is concerned — and React restores a controlled input's DOM value to
// its prop after every input event. The result is an input you cannot type into.
// Instead each field is keyed so it remounts per prompt, seeded with `defaultValue`,
// and onChange writes straight through to the shared state.

import { useCallback, useEffect, useRef, useState } from "react"

import { contact, contactPrompts } from "@/data/contact"
import {
  allValid,
  buildMailto,
  contactState,
  validate,
} from "../contact/state"

export function ContactInput() {
  const boxRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)

  // Position follows the projected screen rect, written by ContactAnchor.
  useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const el = boxRef.current
      if (!el) return
      const { rect } = contactState
      if (rect.visible !== visible) setVisible(rect.visible)
      if (!rect.visible) return
      el.style.transform = `translate3d(${rect.x.toFixed(1)}px, ${rect.y.toFixed(1)}px, 0)`
      el.style.width = `${rect.w.toFixed(1)}px`
      el.style.height = `${rect.h.toFixed(1)}px`
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visible])

  const prompt = contactPrompts[active]

  // The element remounts when the field changes, so focus has to be re-applied or
  // advancing with Enter would silently drop the caret.
  const wasFocused = useRef(false)
  useEffect(() => {
    if (wasFocused.current) fieldRef.current?.focus()
  }, [active])

  const commit = useCallback((value: string) => {
    contactState.values[contactPrompts[contactState.active].key] = value
    contactState.error = null
    contactState.version++
  }, [])

  const advance = useCallback(() => {
    const current = contactPrompts[contactState.active]
    const problem = validate(current.key, contactState.values[current.key])
    if (problem) {
      contactState.error = problem
      contactState.version++
      return
    }
    const next = Math.min(contactPrompts.length - 1, contactState.active + 1)
    contactState.active = next
    contactState.error = null
    contactState.version++
    setActive(next)
  }, [])

  const submit = useCallback(() => {
    if (!allValid()) {
      const bad = contactPrompts.find((p) => validate(p.key, contactState.values[p.key]))
      if (bad) {
        contactState.active = contactPrompts.indexOf(bad)
        contactState.error = validate(bad.key, contactState.values[bad.key])
        contactState.version++
        setActive(contactState.active)
      }
      return
    }
    contactState.submitted = true
    contactState.version++
    // No backend: hand the composed message to the visitor's own mail client
    // rather than pretending to send it.
    window.location.href = buildMailto(contact.email)
  }, [])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Enter") return
      // In the message field a bare Enter should insert a newline, as it would in
      // any textarea; only the modifier sends.
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault()
        submit()
        return
      }
      if (prompt.type === "textarea") return
      e.preventDefault()
      if (active === contactPrompts.length - 1) submit()
      else advance()
    },
    [active, advance, prompt.type, submit]
  )

  const shared = {
    ref: fieldRef as never,
    className: "contact-field",
    defaultValue: contactState.values[prompt.key],
    maxLength: prompt.maxLength,
    "aria-label": `${prompt.key} — contact form`,
    onFocus: () => {
      wasFocused.current = true
      contactState.focused = true
      contactState.version++
    },
    onBlur: () => {
      contactState.focused = false
      contactState.version++
    },
    onKeyDown,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      commit(e.target.value),
  }

  return (
    <div
      ref={boxRef}
      className="contact-overlay"
      style={{ display: visible ? "block" : "none" }}
    >
      {/* Labelled for assistive tech; the visible prompt is painted on the screen. */}
      <label className="sr-only" htmlFor="contact-active-field">
        {prompt.prompt} {prompt.placeholder}
      </label>
      {prompt.type === "textarea" ? (
        <textarea key={prompt.key} id="contact-active-field" autoComplete="off" {...shared} />
      ) : (
        <input
          key={prompt.key}
          id="contact-active-field"
          type={prompt.type}
          autoComplete={prompt.key === "email" ? "email" : "name"}
          {...shared}
        />
      )}
    </div>
  )
}
