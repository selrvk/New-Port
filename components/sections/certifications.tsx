// components/sections/certifications.tsx
//
// Base — Certification marks. On a product, certifications are the monochrome
// marks printed on the base; here each certificate is one, with the full detail
// beside it. (In the 3D version the same certificates are stickers on the lid.)

import { Fragment } from "react"

import { Panel } from "@/components/box/Panel"
import {
  certCount,
  certifications,
  issuedYear,
  issuerCode,
  sortedCertifications,
} from "@/data/certifications"

const issuerCount = new Set(certifications.map((c) => c.issuer)).size

export default function Certifications() {
  return (
    <Panel id="certifications" labelledBy="certifications-title">
      <h2 id="certifications-title" className="box-display box-h2">
        Certification marks
      </h2>
      <p className="box-lede">
        {certCount} certificates from {issuerCount} issuers.
      </p>

      <ul className="box-marks">
        {sortedCertifications.map((c) => (
          <li key={c.id} className="box-mark">
            <div className="box-mark__emblem" aria-hidden="true">
              <span className="box-mark__short">
                {/* Line-break opportunities after each "·", so "HTML·CSS·JS"
                    wraps between its parts rather than inside one. */}
                {c.short.split("·").map((part, i) => (
                  <Fragment key={i}>
                    {i > 0 ? (
                      <>
                        ·<wbr />
                      </>
                    ) : null}
                    {part}
                  </Fragment>
                ))}
              </span>
              <span className="box-mark__meta">{issuerCode(c.issuer)}</span>
              <span className="box-mark__meta">{issuedYear(c.issued)}</span>
            </div>
            <div>
              <h3 className="box-mark__name">{c.name}</h3>
              <p className="box-mark__detail">{c.issuer}</p>
              <p className="box-mark__detail">
                Issued {c.issued}
                {c.validUntil ? ` · valid until ${c.validUntil}` : ""}
              </p>
              {c.credentialId ? (
                <p className="box-mark__detail box-mono">ID {c.credentialId}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
