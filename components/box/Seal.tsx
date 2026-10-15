// components/box/Seal.tsx
//
// The neon sticker seal on the front of the box — the one element carried over from
// the 3D version, where the certifications are stickers on the laptop's lid.
//
// Every word on it is sourced: "Open to work" is profile.availableLabel, and the
// ring repeats the three kinds of work contact.blurb says Charles is open to.

import { profile } from "@/data/profile"

const RING = "FREELANCE · COLLABORATIONS · FULL-TIME · "

export function Seal() {
  if (!profile.available) return null
  const [first, ...rest] = profile.availableLabel.toUpperCase().split(" ")
  return (
    <svg
      className="box-seal"
      viewBox="0 0 200 200"
      role="img"
      aria-label={`${profile.availableLabel}: freelance, collaborations and full-time`}
    >
      <defs>
        <path id="box-seal-ring" d="M100,100 m-71,0 a71,71 0 1,1 142,0 a71,71 0 1,1 -142,0" />
      </defs>
      {/* White die-cut margin, then the neon sticker with an ink edge — neon alone
          has almost no contrast against the board. */}
      <circle cx="100" cy="100" r="98" fill="#FFFFFF" />
      <circle cx="100" cy="100" r="91" fill="var(--box-spot)" stroke="var(--box-ink)" strokeWidth="2.5" />
      <circle cx="100" cy="100" r="55" fill="none" stroke="var(--box-ink)" strokeWidth="1.5" />
      <text fontSize="13.5" fontWeight="700" letterSpacing="1.5" style={{ fontStretch: "87.5%" }}>
        <textPath href="#box-seal-ring" textLength="438" lengthAdjust="spacing">
          {RING}
        </textPath>
      </text>
      <text
        x="100"
        y="96"
        textAnchor="middle"
        fontSize="30"
        fontWeight="800"
        style={{ fontStretch: "125%" }}
      >
        {first}
      </text>
      <text
        x="100"
        y="124"
        textAnchor="middle"
        fontSize="19"
        fontWeight="800"
        letterSpacing="1"
        style={{ fontStretch: "100%" }}
      >
        {rest.join(" ")}
      </text>
    </svg>
  )
}
