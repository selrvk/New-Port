// components/sections/contact.tsx
//
// F7 — Contact. Getting in touch is one of the page's three jobs, so email and phone
// are the biggest keys on the page — email is the lit Return key. The terminal form
// beside them composes the same message the 3D version's form does.

import { Mailer } from "@/components/keys/Mailer"
import { Section } from "@/components/keys/Section"
import { SectionHead } from "@/components/keys/SectionHead"
import { contact, directContact } from "@/data/contact"
import { profile } from "@/data/profile"

export default function Contact() {
  return (
    <Section id="contact" labelledBy="contact-title">
      <SectionHead
        id="contact"
        headingId="contact-title"
        meta={profile.available ? <span>{contact.availabilityNote}</span> : undefined}
      >
        {contact.blurb}
      </SectionHead>

      <div className="contact">
        <ul className="contact__direct">
          {directContact.map((d, i) => (
            <li key={d.label}>
              <a className={`kc kc--word${i === 0 ? " kc--enter" : ""}`} href={d.href}>
                <span>
                  <span className="contact__kind">{d.label}</span>
                  <span className="contact__value">{d.value}</span>
                </span>
                <span aria-hidden="true">{i === 0 ? "↵" : "→"}</span>
              </a>
            </li>
          ))}
        </ul>
        <Mailer />
      </div>
    </Section>
  )
}
