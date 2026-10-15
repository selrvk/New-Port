// data/certifications.ts

/**
 * The die-cut shape of a certificate's sticker in the text version (see
 * components/keys/Sticker.tsx). Chosen per certificate so the collection looks
 * gathered over time rather than printed as a set: the national certificate is a
 * rosette seal, the networking one a shield, the web course a hexagon dev sticker,
 * the restaurant-site course a ticket, the spreadsheet one a spreadsheet.
 */
export type StickerShape =
  | "burst"
  | "shield"
  | "scallop"
  | "hex"
  | "circle"
  | "pill"
  | "ticket"
  | "label"
  | "grid"
  | "rect"

export type Certification = {
  id:          string
  name:        string
  /** Short label for the 3D lid stickers, where the full name will not fit. */
  short:       string
  issuer:      string
  issued:      string        
  validUntil?: string       
  credentialId?: string
  credentialUrl?: string    
  skills:      string[]
  featured?:   boolean     
  /** Sticker shape in the text version. Unset → one is picked by position. */
  shape?:      StickerShape
}

export const certifications: Certification[] = [
  {
    id:           "anthropic-ai-fluency",
    shape:        "burst",
    short:        "AI Fluency",
    name:         "AI Fluency Framework & Foundations",
    issuer:       "Anthropic",
    issued:       "March 2026",
    credentialId: "qypqa4ipvewi",
    skills:       [
      "Artificial Intelligence",
      "AI Literacy",
      "Prompt Engineering",
      "AI Tools & Applications",
    ],
    featured: true,
  },
  {
    id:           "cisco-networking-1",
    shape:        "shield",
    short:        "CCNA",
    name:         "CCNA: Introduction to Networks",
    issuer:       "Cisco Networking Academy",
    issued:       "March 2026",
    skills:       [
      "Ethernet",
      "IP Connectivity",
      "IP Services",
      "OSI Model",
      "IP Subnetting",
      "Switch Configuration",
      "IPv4 & IPv6 Addressing",
      "Network Security Fundamentals",
      "Network Topology Design",
    ],
    featured: true,
  },
  {
    id:           "tesda-vgd",
    shape:        "scallop",
    short:        "NC III · VGD",
    name:         "National Certificate — Visual Graphic Design",
    issuer:       "TESDA (Technical Education and Skills Development Authority)",
    issued:       "Nov 2025",
    validUntil:   "Nov 2030",
    credentialId: "25041003025428",
    skills:       [
      "Logo Design",
      "Print Media Design",
      "UI Design",
      "UX Design",
      "Product Packaging",
      "Booth & Display Design",
    ],
    featured: true,
  },
  {
    id:           "jhu-html-css-js-2",
    shape:        "hex",
    short:        "HTML·CSS·JS",
    name:         "HTML, CSS, and Javascript for Web Developers",
    issuer:       "Johns Hopkins University",
    issued:       "Sep 2025",
    credentialId: "I8ZGDFQ94BNK",
    skills:       ["Full-Stack Development"],
    featured:     true,
  },
  {
    id:           "java-fundamentals",
    shape:        "circle",
    short:        "Java",
    name:         "Fundamentals of Java Programming",
    issuer:       "Board Infinity",
    issued:       "Sep 2025",
    credentialId: "O4ANVO7PIWYV",
    skills:       ["Java"],
  },
  {
    id:           "jhu-js-ajax",
    shape:        "pill",
    short:        "JS + AJAX",
    name:         "Introduction to Javascript and Ajax: Building Web Apps",
    issuer:       "Johns Hopkins University",
    issued:       "Sep 2025",
    credentialId: "2BB4QZ1GP55Q",
    skills:       ["JavaScript"],
  },
  {
    id:           "jhu-restaurant",
    shape:        "ticket",
    short:        "Static Site",
    name:         "Coding the Static Restaurant Site",
    issuer:       "Johns Hopkins University",
    issued:       "Sep 2025",
    credentialId: "TH9G8PSCP6FH",
    skills:       [],
  },
  {
    id:           "mos-excel",
    shape:        "grid",
    short:        "Excel",
    name:         "Microsoft Office Specialist: Excel Associate",
    issuer:       "Microsoft",
    issued:       "Sep 2025",
    skills:       ["Microsoft Excel"],
  },
  {
    id:           "jhu-html-css-js-1",
    shape:        "label",
    short:        "HTML·CSS·JS",
    name:         "HTML, CSS, and Javascript for Web Developers",
    issuer:       "Johns Hopkins University",
    issued:       "Aug 2025",
    credentialId: "VMUFSEBR1HHC",
    skills:       ["JavaScript"],
  },
  {
    id:           "jhu-css3",
    shape:        "rect",
    short:        "CSS3",
    name:         "Introduction to CSS3",
    issuer:       "Johns Hopkins University",
    issued:       "Aug 2025",
    credentialId: "IQZLME0GXK9G",
    skills:       [],
  },
]

export const sortedCertifications = [
  ...certifications.filter(c => c.featured),
  ...certifications.filter(c => !c.featured),
]

export const certCount = certifications.length
/** Compact issuer labels, used on the lid stickers and the DOM filter chips. */
export const ISSUER_CODE: Record<string, string> = {
  "Anthropic": "ANTHROPIC",
  "Cisco Networking Academy": "CISCO",
  "TESDA (Technical Education and Skills Development Authority)": "TESDA",
  "Johns Hopkins University": "JHU",
  "Board Infinity": "BOARD INF",
  "Microsoft": "MICROSOFT",
}

export const issuerCode = (issuer: string): string =>
  ISSUER_CODE[issuer] ?? issuer.slice(0, 5).toUpperCase()

/** Year only, for the sticker footer. */
export const issuedYear = (issued: string): string => issued.match(/\d{4}/)?.[0] ?? issued
