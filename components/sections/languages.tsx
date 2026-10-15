// components/sections/languages.tsx
//
// F6 — Languages: the laptop's own keyboard, switching input source.

import { LanguageBoard } from "@/components/keys/LanguageBoard"
import { Section } from "@/components/keys/Section"
import { SectionHead } from "@/components/keys/SectionHead"
import { languages } from "@/data/languages"

export default function Languages() {
  return (
    <Section id="languages" labelledBy="languages-title">
      <SectionHead
        id="languages"
        headingId="languages-title"
        meta={<span>{languages.length} input sources</span>}
      >
        Switch input source and the keyboard relabels itself, then types a greeting in that
        language — the same board as the 3D laptop.
      </SectionHead>
      <LanguageBoard />
    </Section>
  )
}
