// app/page.tsx

import Hero from "@/components/sections/hero";
import "./globals.css";
import Projects from "@/components/sections/projects";
import Skills from "@/components/sections/skills";
import Education from "@/components/sections/education";
import AboutMe from "@/components/sections/about-me";
import Contact from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Projects />
      <Skills />
      <Education />
      <AboutMe />
      <Contact />
    </>
  );
}
