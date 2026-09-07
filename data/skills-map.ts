// data/skills-map.ts
//
// Skills grouped by category, for the command-palette section.
//
// AUTHORED, NOT INVENTED: every entry is traceable to something already in this
// repo — the prose in data/skills.ts, a `stack` array in data/projects.ts, a
// `skills` array in data/certifications.ts, or the focus chips in the hero.
// `from` records which, so provenance survives future edits.
//
// The categories mirror the real structure in data/skills.ts, so the 3D section and
// the static DOM section describe the same thing rather than drifting apart.
//
// `query` is what gets typed — on the physical keyboard, letter by letter, and into
// the palette's search field at the same time. Keep them lowercase and letters-only:
// every character has to map to a key we can actually light.

export type SkillSource = "skills" | "projects" | "certifications" | "profile"

export type SkillEntry = {
  name: string
  from: SkillSource
}

export type SkillCategory = {
  id: string
  /** Typed on the keyboard and into the palette field. Letters only. */
  query: string
  /** Shown as the palette's result heading. */
  label: string
  /** Parent grouping, matching data/skills.ts. */
  group: string
  skills: SkillEntry[]
}

export const skillCategories: SkillCategory[] = [
  {
    id: "frontend",
    query: "frontend",
    label: "Front End",
    group: "Web Development",
    skills: [
      { name: "React", from: "projects" },
      { name: "Next.js", from: "projects" },
      { name: "TypeScript", from: "projects" },
      { name: "JavaScript", from: "skills" },
      { name: "Vue.js", from: "skills" },
      { name: "Angular", from: "skills" },
      { name: "Tailwind CSS", from: "projects" },
      { name: "Bootstrap", from: "skills" },
      { name: "HTML5", from: "projects" },
      { name: "CSS3", from: "projects" },
      { name: "Vite", from: "projects" },
    ],
  },
  {
    id: "backend",
    query: "backend",
    label: "Back End",
    group: "Web Development",
    skills: [
      { name: "Node.js", from: "skills" },
      { name: "Express.js", from: "skills" },
      { name: "Spring Boot", from: "skills" },
      { name: "REST APIs", from: "skills" },
      { name: "MySQL", from: "skills" },
      { name: "PostgreSQL", from: "skills" },
      { name: "MongoDB", from: "skills" },
      { name: "Supabase", from: "projects" },
      { name: "Linux", from: "skills" },
      { name: "AWS", from: "skills" },
      { name: "Azure", from: "skills" },
      { name: "AJAX", from: "certifications" },
    ],
  },
  {
    id: "mobile",
    query: "mobile",
    label: "Mobile Apps",
    group: "Software Development",
    skills: [
      { name: "React Native", from: "skills" },
      { name: "Flutter", from: "skills" },
      { name: "Dart", from: "skills" },
      { name: "Kotlin", from: "skills" },
      { name: "Swift", from: "skills" },
      { name: "SwiftUI", from: "skills" },
    ],
  },
  {
    id: "desktop",
    query: "desktop",
    label: "Desktop Apps",
    group: "Software Development",
    skills: [
      { name: "C#", from: "skills" },
      { name: "C++", from: "skills" },
      { name: "Java", from: "certifications" },
      { name: "JavaFX", from: "skills" },
      { name: "Electron", from: "skills" },
      { name: "MVVM", from: "skills" },
    ],
  },
  {
    id: "design",
    query: "design",
    label: "Brand Identity",
    group: "Visual Graphic Design",
    skills: [
      { name: "Figma", from: "profile" },
      { name: "Photoshop", from: "skills" },
      { name: "Illustrator", from: "skills" },
      { name: "UI/UX Design", from: "certifications" },
      { name: "Logo Design", from: "certifications" },
      { name: "Typography", from: "skills" },
    ],
  },
  {
    id: "practices",
    query: "practices",
    label: "Practices",
    group: "Web Development",
    skills: [
      { name: "Git", from: "skills" },
      { name: "Agile", from: "skills" },
      { name: "TDD", from: "skills" },
      { name: "CI/CD", from: "skills" },
      { name: "Prompt Engineering", from: "certifications" },
      { name: "OSI Model", from: "certifications" },
      { name: "Excel", from: "certifications" },
    ],
  },
]

export const CATEGORY_COUNT = skillCategories.length

export const totalMappedSkills = skillCategories.reduce((n, c) => n + c.skills.length, 0)

/** Every distinct letter typed across all queries — the keys that will ever light. */
export const typedLetters = Array.from(
  new Set(skillCategories.flatMap((c) => c.query.toUpperCase().split("")))
).sort()
