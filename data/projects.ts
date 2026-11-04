// data/projects.ts
//
// Order is presentation order — index 0 leads the carousel and the browser's tab
// strip. Both renderers derive their counts from this array, so adding an entry is
// the only change needed.
//
// `source` is optional: not everything shipped here is open source, and pointing a
// "Source" button at a profile page instead of a repo would be worse than omitting
// it. `demoLabel` overrides "live demo" for things that aren't a live web demo.

export type Project = {
  id: number
  title: string
  description: string
  stack: string[]
  image: string
  /** Where the thing actually lives. Typed into the address bar on the 3D screen. */
  demo: string
  /** Label for the primary link. Defaults to a live-demo wording. */
  demoLabel?: string
  /** Public repository, when there is one. */
  source?: string
}

export const projects: Project[] = [
  {
    id: 6,
    title: "Habbit: Habits & Finance",
    description:
      "An iOS habit and budget tracker with an AI companion, Bon, that reads the relationship between what you do and what you spend. On the App Store.",
    stack: ["React Native", "TypeScript", "iOS"],
    image: "/pictures/habbit.webp",
    demo: "https://apps.apple.com/ph/app/habbit-habits-finance/id6762041450",
    demoLabel: "app store",
  },
  {
    id: 7,
    title: "LifeTap: NFC ID",
    description: "LifeTap turns an NFC Tag into a personal lifeline.",
    stack: ["React Native", "TypeScript", "iOS"],
    image: "/pictures/lifetap.webp",
    demo: "https://apps.apple.com/ph/app/lifetap-nfc-id/id6762006490",
    demoLabel: "app store",
  },
  {
    id: 8,
    title: "Business Suite: Inventory & POS",
    description:
      "Inventory, point of sale, attendance and fleet tracking for small businesses, built around a cheap barcode scanner. Businesses sign up for a free trial, and the database itself keeps each one's data separate.",
    stack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    image: "/pictures/business-suite.webp",
    // No public deployment yet, so the primary link is the repository itself.
    demo: "https://github.com/selrvk/business-suite",
    demoLabel: "source",
  },
  {
    id: 9,
    title: "Sol by Sol",
    description:
      "A junior astronaut mission trainer for ages 10 to 16, built with Team ARCHSPACE for the 2026 NASA Space Apps Challenge. Run a Moon or Mars outpost and trade science against survival — every meter shows the real NASA figures behind it.",
    stack: ["React", "TypeScript", "Vite", "Recharts"],
    image: "/pictures/sol-by-sol.webp",
    demo: "https://sol-by-sol.vercel.app",
    source: "https://github.com/selrvk/sol-by-sol",
  },
  {
    id: 1,
    title: "System Administration & Automation System",
    description: "Full-stack SADAS app with database from Supabase",
    stack: ["React", "Vite", "TypeScript", "Tailwind CSS", "Supabase"],
    image: "/pictures/sadas-img.webp",
    demo: "https://sadas.charlesalcantara.com",
    source: "https://github.com/selrvk/sadas"
  },
  {
    id: 3,
    title: "Majestic Balinese",
    description: "A luxury resort website for a resort in Calatagan, Batangas.",
    image: "/pictures/majestic-img.webp",
    stack: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    demo: "https://majesticbalinese.charlesalcantara.com",
    source: "https://github.com/selrvk/Majestic-Balinese"
  },
  {
    id: 4,
    title: "Selrvk Skies",
    description: "A weather Next.js app with WeatherAPI.",
    image: "/pictures/weather-img.webp",
    stack: ["React","HTML5", "CSS3", "Next.js"],
    demo: "https://skies.charlesalcantara.com",
    source: "https://github.com/selrvk/Weather-App"
  },
  {
    id: 5,
    title: "Para",
    description: "An all in one information hub for public transport for Batangas.",
    image: "/pictures/para-img.webp",
    stack: ["React", "NodeJS", "TypeScript"],
    demo: "https://para.charlesalcantara.com",
  },
];
