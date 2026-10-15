// components/laptop/palette.ts
//
// The site's colours, kept free of imports.
//
// config.ts imports three.js, so anything that reached COLORS through it — the
// sticker colourways, the text version — would drag the 3D engine into bundles
// that never draw a triangle. config.ts re-exports this unchanged.
//
// The text version's stylesheet (app/keys.css) mirrors these values as CSS custom
// properties; change one, change both.

export const COLORS = {
  bg: "#0A0A0A",
  paper: "#F0EDE6",
  neon: "#E8FF47",
  hot: "#FF2D6B",
  muted: "#3A3A3A",
  rule: "#1E1E1E",
  /** Screen-only shades. */
  screenBg: "#0B0D0F",
  screenChrome: "#16191C",
  screenDim: "#6B6860",
} as const
