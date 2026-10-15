// components/sections/certifications.tsx
//
// F3 — Certifications: the stickers off the back of the 3D laptop's lid, in the
// same colourways (components/laptop/lib/stickerStyles.ts), stuck onto a dark lid.
// The stickers are the picture; the list underneath is the record — full names,
// issuers, dates and credential IDs.

import type { CSSProperties } from "react"

import { stickerStyle } from "@/components/laptop/lib/stickerStyles"
import { Section } from "@/components/keys/Section"
import { SectionHead } from "@/components/keys/SectionHead"
import {
  certCount,
  certifications,
  issuedYear,
  issuerCode,
  sortedCertifications,
} from "@/data/certifications"

const issuerCount = new Set(certifications.map((c) => c.issuer)).size

/** Stuck on by hand: a small, repeatable tilt and drop per sticker. */
const tilt = (i: number) => ((i * 37) % 13) - 6
const drop = (i: number) => ((i * 53) % 9) - 4

/**
 * Font size, in % of the sticker's width, that fits the short name on one line.
 * Estimated per character, because Syne's capitals are far wider than its lower
 * case — counting characters alone let "HTML·CSS·JS" run off its sticker. The 60
 * is calibrated against the rendered stickers: it puts the widest name at about
 * 82% of the face, inside the face's own padding.
 */
function fit(text: string): number {
  let em = 0
  for (const ch of text) {
    em += ch === " " ? 0.3 : /[·.,]/.test(ch) ? 0.32 : /[A-Z0-9+&]/.test(ch) ? 0.86 : 0.64
  }
  return Math.min(16, 60 / Math.max(em, 1))
}

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
        {sortedCertifications.map((c, i) => {
          const st = stickerStyle(c, i)
          return (
            <div
              key={c.id}
              className="stk"
              style={
                {
                  "--tilt": `${tilt(i)}deg`,
                  "--drop": `${drop(i)}px`,
                } as CSSProperties
              }
            >
              <div className="stk__paper">
                <div
                  className="stk__face"
                  data-rule={st.rule ? "" : undefined}
                  style={
                    {
                      "--fill": st.fill,
                      "--text": st.text,
                      "--accent": st.accent,
                      "--rule": st.rule,
                      "--fit": fit(c.short),
                    } as CSSProperties
                  }
                >
                  <span className="stk__issuer">{issuerCode(c.issuer)}</span>
                  <span className="stk__name">{c.short}</span>
                  <span className="stk__foot">
                    <span>{issuedYear(c.issued)}</span>
                    <span>{c.featured ? "★" : ""}</span>
                  </span>
                </div>
              </div>
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
