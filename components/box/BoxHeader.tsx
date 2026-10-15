// components/box/BoxHeader.tsx
//
// Slot 1: the top flap. The dashed rule beneath it is the fold where the tuck flap
// meets the front panel. Contact is the one link kept on the narrowest screens —
// getting in touch is one of the page's three jobs.

import { profile } from "@/data/profile"

const NAV = [
  { href: "#projects", label: "Contents" },
  { href: "#skills", label: "Specs" },
  { href: "#contact", label: "Contact" },
] as const

export function BoxHeader() {
  return (
    <header className="box-flap">
      <a className="box-flap__mark" href="#hero">
        {profile.name}
      </a>
      <nav aria-label="Sections">
        <ul className="box-flap__nav">
          {NAV.map((n) => (
            <li key={n.href}>
              <a href={n.href}>{n.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
