// components/keys/SectionHead.tsx
//
// Slot 3 of the keyboard: every section opens by typing its name. The function-row
// key it lives on sits above, so the title and the navigation visibly match.

import type { ReactNode } from "react"

import { KeyWord } from "./KeyWord"
import { sectionFor, type SectionId } from "./sections"

type Props = {
  id: SectionId
  /** Id given to the h2, for the section's aria-labelledby. */
  headingId: string
  /** A small mono line beside the F-key: a count, a path, a prompt. */
  meta?: ReactNode
  children?: ReactNode
}

export function SectionHead({ id, headingId, meta, children }: Props) {
  const s = sectionFor(id)
  return (
    <header className="sh">
      <p className="sh__fkey" aria-hidden="true">
        <span className="kc kc--xs">{s.fkey}</span>
        {meta}
      </p>
      <h2 id={headingId} className="sh__title">
        <span className="sr-only">{s.label}</span>
        <KeyWord word={s.word} typeOnView />
      </h2>
      {children ? <p className="sh__lede">{children}</p> : null}
    </header>
  )
}
