// data/profile.ts
// Single source of truth for identity + headline copy.
// Extracted from components/sections/hero.tsx so the DOM layer and the 3D layer agree.

export const profile = {
  name: "Charles Alcantara",
  /** Rendered as four stacked lines in the hero. */
  titleLines: ["FULL-STACK", "DEVELOPER", "& UI/UX", "DESIGNER"] as const,
  /** Flat version for <title>, aria-labels, and the boot sequence. */
  title: "Full-Stack Developer & UI/UX Designer",
  location: "Batangas, Philippines",
  available: true,
  availableLabel: "Open to work",
  tagline:
    "Full-stack developer & UI/UX designer from the Philippines. Building products that are technically solid and visually sharp.",
  /** Shown as chips in the hero aside. */
  focus: ["Next.js", "React", "TypeScript", "Node.js", "Figma", "UI/UX"] as const,
  portrait: "/pictures/my-closeup.png",
  year: "2026",
} as const

export const socials = [
  { code: "GH", label: "GitHub", value: "github.com/selrvk", href: "https://github.com/selrvk" },
  { code: "LI", label: "LinkedIn", value: "linkedin.com/in/charles-alcantara", href: "https://linkedin.com/in/charles-alcantara" },
  { code: "IG", label: "Instagram", value: "instagram.com/selrvk", href: "https://instagram.com/selrvk" },
  { code: "DC", label: "Discord", value: "selrvk", href: "https://discord.com/users/selrvk" },
] as const

export type Social = (typeof socials)[number]
