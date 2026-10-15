// components/sections/contact.tsx
//
// Side E — Customer care: the panel on every box that says who to contact. Getting
// in touch is one of the page's three jobs, so the email and phone are the largest
// targets on the face and the email carries the spot colour.

import { Panel } from "@/components/box/Panel"
import { contact, directContact } from "@/data/contact"
import { profile, socials } from "@/data/profile"

export default function Contact() {
  return (
    <Panel id="contact" labelledBy="contact-title">
      <div className="box-care">
        <div>
          <h2 id="contact-title" className="box-display box-h2">
            Questions? Get in touch.
          </h2>
          {profile.available ? <p className="box-status">{contact.availabilityNote}</p> : null}
          <p className="box-lede">{contact.blurb}</p>
        </div>

        <div>
          <ul className="box-care__direct">
            {directContact.map((d, i) => (
              <li key={d.label}>
                <a className={`box-tab${i === 0 ? " box-tab--spot" : ""}`} href={d.href}>
                  <span>
                    <span className="box-care__kind">{d.label}</span>
                    {d.value}
                  </span>
                  <span aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ul>

          <p className="box-label">Elsewhere</p>
          <ul className="box-socials">
            {socials.map((s) => (
              <li key={s.code}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  <span className="box-label" aria-hidden="true">
                    {s.code}
                  </span>
                  <span className="box-socials__value">
                    <span className="sr-only">{s.label}: </span>
                    {s.value}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </span>
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  )
}
