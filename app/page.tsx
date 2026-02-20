// app/page.tsx

import Hero from "@/components/sections/hero";
import "./globals.css";
import Projects from "@/components/sections/projects";

export default function Home() {
  return (
    <>
      <Hero />
      <Projects />
    </>
  );
}
