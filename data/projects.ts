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
    image: "/pictures/habbit.jpg",
    demo: "https://apps.apple.com/ph/app/habbit-habits-finance/id6762041450",
    demoLabel: "app store",
  },
  {
    id: 1,
    title: "System Administration & Automation System",
    description: "Full-stack SADAS app with database from Supabase",
    stack: ["React", "Vite", "TypeScript", "Tailwind CSS", "Supabase"],
    image: "/pictures/sadas-img.png",
    demo: "https://sadas.selrvk.dev",
    source: "https://github.com/selrvk/sadas"
  },
  {
    id: 2,
    title: "Inventory Management System",
    description: "An Inventory Management System for a local business in Batangas.",
    image: "/pictures/fnv-img.png",
    stack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
    demo: "https://fnv-inventory.vercel.app",
    source: "https://github.com/selrvk/fnv-inventory"
  },
  {
    id: 3,
    title: "Majestic Balinese",
    description: "A luxury resort website for a resort in Calatagan, Batangas.",
    image: "/pictures/majestic-img.png",
    stack: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    demo: "https://majestic-balinese.vercel.app",
    source: "https://github.com/selrvk/Majestic-Balinese"
  },
  {
    id: 4,
    title: "Selrvk Skies",
    description: "A weather Next.js app with WeatherAPI.",
    image: "/pictures/weather-img.png",
    stack: ["React","HTML5", "CSS3", "Next.js"],
    demo: "https://skies.selrvk.dev",
    source: "https://github.com/selrvk/yoru-hotel"
  },
  {
    id: 5,
    title: "Para",
    description: "An all in one information hub for public transport for Batangas.",
    image: "/pictures/para-img.png",
    stack: ["React", "NodeJS", "TypeScript"],
    demo: "https://para-ph.vercel.app/",
    source: "https://github.com/selrvk"
  },
];
