// components/box/faces.ts
//
// The text version is "the box it came in": the retail packaging of the laptop the
// 3D version is built around. Each section of the page is one printed face of that
// box. This list is the single source of truth for that mapping — the face labels
// printed at the top of each section and the patches of the print strip (the scroll
// indicator) are both derived from it, so they cannot disagree.
//
// Order is the page's section order, which is fixed: the section ids are what the
// in-page links (#projects, #contact) and the 3D layer's fallbacks point at.

export type Face = {
  /** The section's element id. */
  id: string
  /** What is printed on the crease above it. Decorative — hidden from assistive tech. */
  face: string
}

export const FACES = [
  { id: "hero", face: "Front panel" },
  { id: "projects", face: "Side A — Contents" },
  { id: "skills", face: "Side B — Specifications" },
  { id: "certifications", face: "Base — Certification marks" },
  { id: "education", face: "Side C — Origin" },
  { id: "about-me", face: "Insert — Read me first" },
  { id: "languages", face: "Side D — Languages" },
  { id: "contact", face: "Side E — Customer care" },
] as const satisfies readonly Face[]

export type FaceId = (typeof FACES)[number]["id"]

export function faceFor(id: FaceId): string {
  return FACES.find((f) => f.id === id)!.face
}
