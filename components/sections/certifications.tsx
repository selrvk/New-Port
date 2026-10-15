// components/sections/certifications.tsx
//
// F3 — Certifications: the stickers off the back of the 3D laptop's lid, in the
// same colourways (components/laptop/lib/stickerStyles.ts), each die-cut to its own
// shape (components/keys/Sticker.tsx) and stuck onto a dark lid. The stickers are
// the picture; the list underneath is the record — full names, issuers, dates and
// credential IDs.

import type { CSSProperties } from "react"

import { stickerStyle } from "@/components/laptop/lib/stickerStyles"
import { Section } from "@/components/keys/Section"
import { shapeFor, Sticker, StickerDefs, stickerSize } from "@/components/keys/Sticker"
import { SectionHead } from "@/components/keys/SectionHead"
import {
  certCount,
  certifications,
  sortedCertifications,
} from "@/data/certifications"

const issuerCount = new Set(certifications.map((c) => c.issuer)).size

/** Stuck on by hand: a small, repeatable tilt and drop per sticker. */
const tilt = (i: number) => ((i * 37) % 15) - 7
const drop = (i: number) => ((i * 53) % 11) - 5

export default function Certifications() {
  return (
    <Section id="certifications" labelledBy="certifications-title">
      <SectionHead
        id="certifications"
        headingId="certifications-title"
        meta={
          <span>
            {certCount} stickers · {issuerCount} issuers
          </span>
        }
      >
        The same stickers that are on the back of the laptop&rsquo;s lid. ★ marks the featured ones.
      </SectionHead>

      <div className="lid" aria-hidden="true">
        <StickerDefs />
        {sortedCertifications.map((c, i) => {
          const shape = shapeFor(c, i)
          return (
            <div
              key={c.id}
              className="stk"
              style={
                {
                  "--tilt": `${tilt(i)}deg`,
                  "--drop": `${drop(i)}px`,
                  "--u": stickerSize(shape).w,
                } as CSSProperties
              }
            >
              <Sticker cert={c} style={stickerStyle(c, i)} shape={shape} />
            </div>
          )
        })}
      </div>

      <ul className="certs">
        {sortedCertifications.map((c) => (
          <li key={c.id}>
            <span className="certs__star">
              {c.featured ? (
                <>
                  <span aria-hidden="true">★</span>
                  <span className="sr-only">Featured: </span>
                </>
              ) : null}
            </span>
            <div>
              <h3>{c.name}</h3>
              <p>
                {c.issuer} · {c.issued}
                {c.validUntil ? ` · valid until ${c.validUntil}` : ""}
              </p>
              {c.credentialId ? <p className="k-mono">ID {c.credentialId}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
