// components/box/Panel.tsx
//
// One face of the box: a section with its face name printed on the crease above it.
// The crease itself is CSS (.box-panel + .box-panel::before), so every face after
// the front panel gets one without any extra markup.

import type { ReactNode } from "react"

import { faceFor, type FaceId } from "./faces"
import { RegMark } from "./marks"

type Props = {
  id: FaceId
  /** Id of the section's heading, for aria-labelledby. */
  labelledBy: string
  /** Faces that sit in shadow get the darker board. */
  tone?: "board" | "shade" | "insert"
  children: ReactNode
}

export function Panel({ id, labelledBy, tone = "board", children }: Props) {
  const toneClass = tone === "shade" ? " box-panel--shade" : tone === "insert" ? " box-panel--insert" : ""
  return (
    <section id={id} aria-labelledby={labelledBy} className={`box-panel${toneClass}`}>
      <div className="box-panel__inner">
        {/* The face name is the metaphor talking; it carries nothing a screen-reader
            user needs, so it stays out of the accessibility tree. */}
        <p className="box-face box-label" aria-hidden="true">
          {faceFor(id)}
          <RegMark />
        </p>
        {children}
      </div>
    </section>
  )
}
