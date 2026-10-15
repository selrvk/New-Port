"use client"

// components/keys/Mailer.tsx
//
// The contact form as the 3D version types it: a terminal with name, email and
// message prompts. Same prompts (data/contact.ts), same validation and the same
// composed message (components/laptop/contact/state.ts) — whichever version it is
// typed into, Charles receives the same email.
//
// There is no backend. Sending opens the visitor's own mail client with the message
// filled in, and the form says so rather than pretending to deliver it.

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react"

import { mailtoFor, validate } from "@/components/laptop/contact/state"
import { contact, contactPrompts, type ContactField } from "@/data/contact"

type Values = Record<ContactField, string>

export function Mailer() {
  const [values, setValues] = useState<Values>({ name: "", email: "", message: "" })
  const [error, setError] = useState<{ field: ContactField; text: string } | null>(null)
  const fieldRefs = useRef(new Map<ContactField, HTMLInputElement | HTMLTextAreaElement>())

  const send = () => {
    for (const p of contactPrompts) {
      const problem = validate(p.key, values[p.key])
      if (problem) {
        setError({ field: p.key, text: problem })
        fieldRefs.current.get(p.key)?.focus()
        return
      }
    }
    setError(null)
    window.location.assign(mailtoFor(contact.email, values))
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    send()
  }

  // ⌘↵ / Ctrl+↵ sends from the message field, where a bare Return is a newline.
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      send()
    }
  }

  return (
    <form className="term mailer" onSubmit={onSubmit} noValidate aria-labelledby="mailer-title">
      <p className="term__bar" id="mailer-title">
        mail — {contact.email}
      </p>
      <div className="term__body">
        {contactPrompts.map((p) => {
          const invalid = error?.field === p.key
          const common = {
            ref: (el: HTMLInputElement | HTMLTextAreaElement | null) => {
              if (el) fieldRefs.current.set(p.key, el)
            },
            name: p.key,
            value: values[p.key],
            placeholder: p.placeholder,
            maxLength: p.maxLength,
            required: p.required,
            "aria-invalid": invalid || undefined,
            "aria-describedby": invalid ? "mailer-error" : undefined,
            onChange: (e: { target: { value: string } }) => {
              setValues((v) => ({ ...v, [p.key]: e.target.value }))
              if (invalid) setError(null)
            },
          }
          return (
            <label key={p.key}>
              <span>{p.prompt}</span>
              {p.type === "textarea" ? (
                <textarea rows={4} onKeyDown={onKeyDown} {...common} />
              ) : (
                <input
                  type={p.type}
                  autoComplete={p.key === "email" ? "email" : "name"}
                  {...common}
                />
              )}
            </label>
          )
        })}
        <div className="mailer__foot">
          {error ? (
            <p className="mailer__err" id="mailer-error" role="alert">
              {error.text}
            </p>
          ) : (
            <p className="mailer__note">Opens your mail app with this filled in.</p>
          )}
          <button type="submit" className="kc kc--enter kc--word">
            <span className="kc__mod">⌘↵</span>
            <span>Send</span>
          </button>
        </div>
      </div>
    </form>
  )
}
