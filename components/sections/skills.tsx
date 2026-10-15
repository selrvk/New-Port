// components/sections/skills.tsx
//
// F2 — Skills: the 3D version's command palette, with the categories as keys.

import { Section } from "@/components/keys/Section"
import { SectionHead } from "@/components/keys/SectionHead"
import { SkillsPalette } from "@/components/keys/SkillsPalette"
import { CATEGORY_COUNT, totalMappedSkills } from "@/data/skills-map"

export default function Skills() {
  return (
    <Section id="skills" labelledBy="skills-title">
      <SectionHead
        id="skills"
        headingId="skills-title"
        meta={
          <span>
            {totalMappedSkills} skills · {CATEGORY_COUNT} categories
          </span>
        }
      >
        Press a category to search it. Each result says where it comes from.
      </SectionHead>
      <SkillsPalette />
    </Section>
  )
}
