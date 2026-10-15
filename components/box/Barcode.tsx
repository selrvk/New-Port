// components/box/Barcode.tsx
//
// The barcode on the base of the box. It is real Code 128 and encodes the email
// address printed beneath it, so a phone camera pointed at it gets something useful.
// It is also a mailto link, for everyone not holding a phone up to their screen.

import { code128Bars } from "./code128"

export function Barcode({ value, href }: { value: string; href: string }) {
  const { bars, width } = code128Bars(value)
  return (
    <a className="box-barcode" href={href}>
      <svg
        viewBox={`0 0 ${width} 40`}
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
      >
        <rect width={width} height="40" fill="#FFFFFF" />
        {bars.map((b) => (
          <rect key={b.x} x={b.x} width={b.width} height="40" fill="#0A0A0A" />
        ))}
      </svg>
      <span className="box-barcode__text box-mono">{value}</span>
    </a>
  )
}
