// data/education.ts
//
// Ordered oldest → newest. `version` drives the CHANGELOG.md rendering on the
// laptop screen; the last entry is HEAD (currently enrolled).
//
// NOTE: every entry currently points at the same placeholder seal asset.
// Swap `seal` per school when you have the real logos.

export type School = {
  id: number
  /** Changelog tag, e.g. "v3.0.0". */
  version: string
  school: string
  seal: string
  year: string
  degree: string
  description: string
  /** True for the school currently being attended. */
  current?: boolean
}

export const education: School[] = [
  {
    id: 1,
    version: "v1.0.0",
    school: "Dumantay Elementary School",
    seal: "/pictures/De_La_Salle_University_Seal.svg",
    year: "2006",
    degree: "Nursery",
    description: "",
  },
  {
    id: 2,
    version: "v2.0.0",
    school: "University of Batangas",
    seal: "/pictures/De_La_Salle_University_Seal.svg",
    year: "2007 - 2009",
    degree: "Preschool",
    description: "",
  },
  {
    id: 3,
    version: "v3.0.0",
    school: "Saint Bridget College",
    seal: "/pictures/De_La_Salle_University_Seal.svg",
    year: "2009 - 2010",
    degree: "Grade 1",
    description: "",
  },
  {
    id: 4,
    version: "v4.0.0",
    school: "Saint Therese Multiple Intelligence School",
    seal: "/pictures/De_La_Salle_University_Seal.svg",
    year: "2010 - 2011",
    degree: "Grade 2",
    description: "",
  },
  {
    id: 5,
    version: "v5.0.0",
    school: "Dukhan English School",
    seal: "/pictures/De_La_Salle_University_Seal.svg",
    year: "2011 - 2014",
    degree: "Grade 3 - 6",
    description: "",
  },
  {
    id: 6,
    version: "v6.0.0",
    school: "McKinley Hill School",
    seal: "/pictures/De_La_Salle_University_Seal.svg",
    year: "2014 - 2019",
    degree: "Grade 7 - 10",
    description: "",
  },
  {
    id: 7,
    version: "v7.0.0",
    school: "Lyceum of the Philippines University",
    seal: "/pictures/De_La_Salle_University_Seal.svg",
    year: "2019 - 2021",
    degree: "Senior High",
    description: "",
  },
  {
    id: 8,
    version: "v8.0.0",
    school: "De La Salle University - Manila",
    seal: "/pictures/De_La_Salle_University_Seal.svg",
    year: "2021 - 2025",
    degree: "Bachelor of Science in Software Technology",
    description: "",
  },
  {
    id: 9,
    version: "v9.0.0",
    school: "Lyceum of the Philippines University - Batangas",
    seal: "/pictures/De_La_Salle_University_Seal.svg",
    year: "2025 - present",
    degree: "Bachelor of Science in Information Technology",
    description: "",
    current: true,
  },
]

export const currentSchool = education.find((e) => e.current) ?? education[education.length - 1]
