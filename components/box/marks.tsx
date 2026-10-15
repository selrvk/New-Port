// components/box/marks.tsx
//
// The printer's and handling marks used across the box. Pure SVG, decorative, and
// drawn in currentColor so they take the ink they are printed in.

/** A registration target — what printers align each colour plate to. */
export function RegMark({ className = "box-reg" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="4.25" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M8 0v16M0 8h16" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

/** The ISO "this way up" handling mark: two arrows standing on a base line. */
export function UprightMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="miter">
        <path d="M5 27h22" />
        <path d="M11 24V8M7 12l4-5 4 5" />
        <path d="M21 24V8M17 12l4-5 4 5" />
      </g>
    </svg>
  )
}
