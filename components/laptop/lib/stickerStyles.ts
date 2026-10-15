// components/laptop/lib/stickerStyles.ts
//
// The colourways of the certification stickers, shared by the 3D lid (painted onto
// canvas textures in stickerTexture.ts) and the text version (rendered as HTML), so
// a given certificate is the same sticker in both. Import-free apart from the
// palette and data, so it never pulls three.js into the text version's bundle.

import type { Certification } from "@/data/certifications"

import { COLORS } from "../palette"

export type StickerStyle = {
  fill: string
  text: string
  accent: string
  /** Border drawn just inside the die-cut edge. */
  rule?: string
}

/**
 * A small palette so the lid looks collected-over-time rather than art-directed.
 * Featured certs get the loud ones.
 */
const FEATURED_STYLES: StickerStyle[] = [
  { fill: COLORS.neon, text: "#0A0A0A", accent: "#0A0A0A" },
  { fill: "#101316", text: COLORS.neon, accent: COLORS.neon, rule: COLORS.neon },
  { fill: COLORS.hot, text: COLORS.paper, accent: COLORS.paper },
]

const PLAIN_STYLES: StickerStyle[] = [
  { fill: COLORS.paper, text: "#0A0A0A", accent: "#0A0A0A" },
  { fill: "#171A1E", text: COLORS.paper, accent: COLORS.hot, rule: "rgba(240,237,230,0.25)" },
  { fill: "#232830", text: COLORS.paper, accent: COLORS.neon },
]

/** The sticker for the `index`-th entry of sortedCertifications. */
export function stickerStyle(cert: Certification, index: number): StickerStyle {
  const pool = cert.featured ? FEATURED_STYLES : PLAIN_STYLES
  return pool[index % pool.length]
}
