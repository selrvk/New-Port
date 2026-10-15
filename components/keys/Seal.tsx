// components/keys/Seal.tsx
//
// The neon "open to work" seal — a sticker, like the certificates on the 3D lid.
// Every word on it is sourced: "Open to work" is profile.availableLabel, and the
// ring repeats the three kinds of work contact.blurb says Charles is open to.

import { COLORS } from "@/components/laptop/palette"
import { profile } from "@/data/profile"

const RING = "FREELANCE · COLLABORATIONS · FULL-TIME · "

export function Seal() {
  if (!profile.available) return null
  const [first, ...rest] = profile.availableLabel.toUpperCase().split(" ")
  return (
    <svg
      className="seal"
      viewBox="0 0 200 200"
      role="img"
      aria-label={`${profile.availableLabel}: freelance, collaborations and full-time`}
    >
      <defs>
        <path id="seal-ring" d="M100,100 m-71,0 a71,71 0 1,1 142,0 a71,71 0 1,1 -142,0" />
      </defs>
      {/* The white die-cut edge every vinyl sticker has. */}
      <circle cx="100" cy="100" r="98" fill="#F4F1EA" />
      <circle cx="100" cy="100" r="91" fill={COLORS.neon} />
      <circle cx="100" cy="100" r="55" fill="none" stroke={COLORS.bg} strokeWidth="1.5" />
      <text fontSize="12.5" fontWeight="700" letterSpacing="1.4">
        <textPath href="#seal-ring" textLength="438" lengthAdjust="spacing">
          {RING}
        </textPath>
      </text>
      <text x="100" y="97" textAnchor="middle" fontSize="31" fontWeight="800">
        {first}
      </text>
      <text x="100" y="124" textAnchor="middle" fontSize="17" fontWeight="800" letterSpacing="0.5">
        {rest.join(" ")}
      </text>
    </svg>
  )
}
