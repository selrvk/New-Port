// data/about.ts
// Extracted from components/sections/about-me.tsx.
// Rendered twice: as semantic DOM (SEO/a11y) and as a README.md preview on the laptop screen.

export const aboutStats = [
  { label: "Status", value: "Undergraduate" },
  { label: "University", value: "LPU – Batangas" },
  { label: "Degree", value: "BS Information Technology" },
  { label: "Certified", value: "Visual Graphics Designer" },
  { label: "Based in", value: "Philippines" },
  { label: "Available", value: "Open to work" },
] as const

/** Always-visible opening line. Kept as segments so the screen renderer can colour the name. */
export const aboutLead = {
  greeting: "Hi, I'm",
  name: "Charles",
  pronunciation: "/ tʃɑːrlz /",
  rest: "— a full-stack web developer with a strong foundation in software engineering and a passion for building clean, scalable, and user-centered digital products.",
} as const

export const aboutParagraphs = [
  "I began my journey studying BS Software Technology at De La Salle University – Manila, and I am currently pursuing BS Information Technology at Lyceum of the Philippines University – Batangas. My academic background combined with hands-on project experience has shaped my ability to work across the entire development stack.",
  "I'm proficient in a wide range of languages and frameworks — from crafting intuitive user interfaces to architecting robust backend systems, RESTful APIs, and both SQL and NoSQL databases. I also have experience in system design, deployment pipelines, and version control with Git.",
  "As a nationally certified Visual Graphics Designer, I bring a strong sense of UI/UX — blending technical precision with meaningful design. Whether in Agile or Waterfall environments, I communicate clearly, work efficiently, and prioritize reliability in every project.",
  "Driven, adaptable, and eager to grow. My goal is to build products that solve real problems, perform flawlessly, and deliver exceptional experiences for both users and clients.",
] as const

/**
 * `whoami` output drawn on the screen before the README renders.
 * Short, factual, terminal-shaped.
 */
export const whoami = [
  ["user", "charles"],
  ["role", "full-stack developer / ui-ux designer"],
  ["edu", "BS Information Technology — LPU Batangas"],
  ["prev", "BS Software Technology — DLSU Manila"],
  ["cert", "TESDA NC III — Visual Graphic Design"],
  ["loc", "Batangas, Philippines"],
  ["status", "open to work"],
] as const
