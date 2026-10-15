// components/keys/KeyWord.tsx
//
// A word spelled out on keycaps. With `typeOnView`, the keys strike in order when
// the word first scrolls into view (TypeOnView in Chrome.tsx sets data-typed; the
// animation is CSS, see .kw in app/keys.css).
//
// Always aria-hidden: a word read out one keycap at a time is noise. Whatever
// renders it supplies the word as real text alongside.

import type { CSSProperties } from "react"

type Props = {
  word: string
  typeOnView?: boolean
  /** Keystrokes already typed before this word, so two rows read as one sentence. */
  offset?: number
  className?: string
}

export function KeyWord({ word, typeOnView = false, offset = 0, className = "" }: Props) {
  return (
    <span
      className={`kw ${className}`.trim()}
      aria-hidden="true"
      data-type-on-view={typeOnView ? "" : undefined}
    >
      {[...word].map((ch, i) => (
        <span
          key={i}
          className="kc"
          data-legend={ch.toUpperCase()}
          style={{ "--i": offset + i } as CSSProperties}
        >
          {ch}
        </span>
      ))}
    </span>
  )
}
