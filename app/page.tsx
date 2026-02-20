// app/page.tsx

import Hero from "@/components/sections/hero";
import "./globals.css";
import Projects from "@/components/sections/projects";
import Skills from "@/components/sections/skills";
import Education from "@/components/sections/education";

export default function Home() {
  return (
    <>
      <Hero />
      <Projects />
      <Skills />
      <Education />
    </>
  );
}
