// data/certifications.ts

export type Certification = {
  id:          string
  name:        string
  issuer:      string
  issued:      string        
  validUntil?: string       
  credentialId?: string
  credentialUrl?: string    
  skills:      string[]
  featured?:   boolean     
}

export const certifications: Certification[] = [
  {
    id:           "anthropic-ai-fluency",
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
    name:         "HTML, CSS, and Javascript for Web Developers",
    issuer:       "Johns Hopkins University",
    issued:       "Sep 2025",
    credentialId: "I8ZGDFQ94BNK",
    skills:       ["Full-Stack Development"],
    featured:     true,
  },
  {
    id:           "java-fundamentals",
    name:         "Fundamentals of Java Programming",
    issuer:       "Board Infinity",
    issued:       "Sep 2025",
    credentialId: "O4ANVO7PIWYV",
    skills:       ["Java"],
  },
  {
    id:           "jhu-js-ajax",
    name:         "Introduction to Javascript and Ajax: Building Web Apps",
    issuer:       "Johns Hopkins University",
    issued:       "Sep 2025",
    credentialId: "2BB4QZ1GP55Q",
    skills:       ["JavaScript"],
  },
  {
    id:           "jhu-restaurant",
    name:         "Coding the Static Restaurant Site",
    issuer:       "Johns Hopkins University",
    issued:       "Sep 2025",
    credentialId: "TH9G8PSCP6FH",
    skills:       [],
  },
  {
    id:           "mos-excel",
    name:         "Microsoft Office Specialist: Excel Associate",
    issuer:       "Microsoft",
    issued:       "Sep 2025",
    skills:       ["Microsoft Excel"],
  },
  {
    id:           "jhu-html-css-js-1",
    name:         "HTML, CSS, and Javascript for Web Developers",
    issuer:       "Johns Hopkins University",
    issued:       "Aug 2025",
    credentialId: "VMUFSEBR1HHC",
    skills:       ["JavaScript"],
  },
  {
    id:           "jhu-css3",
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