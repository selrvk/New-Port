// components/box/BoxFooter.tsx
//
// Slot 7: the base of the box. Mirrors the top flap with its own dashed fold, and
// carries what the base of a box carries: a barcode, the small print, and a handling
// mark — which here is also the way back to the top.

import { contact } from "@/data/contact"
import { profile } from "@/data/profile"

import { Barcode } from "./Barcode"
import { UprightMark } from "./marks"

export function BoxFooter() {
  return (
    <footer className="box-base">
      <div className="box-base__inner">
        <Barcode value={contact.email} href={`mailto:${contact.email}`} />
        <p className="box-smallprint">
          <strong>{profile.name}</strong> — {profile.title}
          <br />
          Based in {profile.location}
          <br />© {profile.year} {profile.name}
        </p>
        <a className="box-upright box-label" href="#hero">
          <UprightMark />
          <span>This side up · back to top</span>
        </a>
      </div>
    </footer>
  )
}
