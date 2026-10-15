// components/keys/sections.ts
//
// The text version is the laptop's keyboard (see app/keys.css). This list maps each
// section to its key: the function-row key that navigates to it, the word typed on
// keycaps as its title, and the plain label assistive tech and the ⌘K palette use.
// The function row, the section titles and the palette all read from here, so they
// cannot disagree.
//
// Order is the page's section order. The ids are what in-page links (#projects,
// #contact) and the 3D layer's fallbacks point at — do not rename them.

export type Section = {
  id: string
  /** The function-row key. */
  fkey: string
  /** Typed on keycaps as the visible title. Kept to nine letters so it fits a phone. */
  word: string
  /** The plain name — the heading's accessible name, and the palette entry. */
  label: string
}

export const SECTIONS = [
  { id: "hero", fkey: "esc", word: "CHARLES", label: "Home" },
  { id: "projects", fkey: "F1", word: "PROJECTS", label: "Projects" },
  { id: "skills", fkey: "F2", word: "SKILLS", label: "Skills" },
  { id: "certifications", fkey: "F3", word: "CERTIFIED", label: "Certifications" },
  { id: "education", fkey: "F4", word: "SCHOOLS", label: "Schools" },
  { id: "about-me", fkey: "F5", word: "README", label: "About" },
  { id: "languages", fkey: "F6", word: "LANGUAGES", label: "Languages" },
  { id: "contact", fkey: "F7", word: "CONTACT", label: "Contact" },
] as const satisfies readonly Section[]

export type SectionId = (typeof SECTIONS)[number]["id"]

export function sectionFor(id: SectionId): Section {
  return SECTIONS.find((s) => s.id === id)!
}
