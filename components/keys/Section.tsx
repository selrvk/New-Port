// components/keys/Section.tsx
//
// One section of the keyboard. Focusable (tabIndex -1) so the function row and the
// command palette can move focus to where they scroll, not just the viewport.

import type { ReactNode } from "react"

import type { SectionId } from "./sections"

type Props = {
  id: SectionId
  labelledBy: string
  className?: string
  innerClassName?: string
  children: ReactNode
}

export function Section({ id, labelledBy, className = "", innerClassName = "", children }: Props) {
  return (
    <section id={id} aria-labelledby={labelledBy} tabIndex={-1} className={`ks ${className}`.trim()}>
      <div className={`ks__inner ${innerClassName}`.trim()}>{children}</div>
    </section>
  )
}
