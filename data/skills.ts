export const skillsData = {

  "Web Development": {

    "Front End": [
        "Proficient with certifications in JavaScript, TypeScript, C++, Java",
        "Familiar with modern frameworks and libraries such as React, Next.js, Vue.js, Angular",
        "Experience with responsive design, CSS frameworks (Tailwind CSS, Bootstrap), and UI/UX principles",
    ],
    "Back End": [
        "Proficient with a certification from Cisco for Linux",
        "Strong understanding of server-side programming languages such as Node.js, Express.js, Java (Spring Boot)",
        "Familiar with database management systems like MySQL, MongoDB, and PostgreSQL",
        "Experience with RESTful API design and development and authentication",
        "Currently expanding my skills in cloud platforms like AWS and Azure for scalable back-end solutions",
    ],
    "Practices": [
        "Agile Methodology",
        "Test-Driven Development (TDD)",
        "Version Control (Git)",
        "Continuous Integration / Continuous Deployment (CI/CD)",
    ],
  },

  "Software Development": {

    "Mobile Apps": [
        "My strong foundation with React helps me quickly adapt to mobile development frameworks like React Native",
        "My familiarity with Java and C++ allows me to easily transition to Android development using Java/Kotlin",
        "Experienced with Flutter and Dart, enabling me to create cross-platform mobile applications with a single codebase",
        "Currently expanding my skills in iOS development using Swift and SwiftUI to create native iOS applications",
    ],
    "Desktop Apps": [
        "Highly proficient in C# and Java with a certification from CodeChum and CodeAcademy",
        "Familiar with MVVM architecture and desktop application frameworks such as Electron and JavaFX",
        "Experience with desktop application development, including UI design and integration with APIs and MySQL databases",
    ],
  },

  "Visual Graphic Design": {

    "Brand Identity": [
        "Visual Graphic Designer with a National Certificate III from TESDA",
        "Skilled in Adobe Creative Suite (Photoshop, Illustrator) for creating compelling brand identities",
        "Experience in logo design, typography, color theory, and visual storytelling to create cohesive and impactful brand identities",
        "Strong understanding of design principles and trends to create visually appealing and effective brand assets",
    ],
  },

} as const;

export type SkillCategory = keyof typeof skillsData;
export type SkillType<T extends SkillCategory> = keyof typeof skillsData[T];