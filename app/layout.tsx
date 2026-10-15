import type { Metadata } from "next";
import { Archivo, Syne, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./box.css";
import { bootScript } from "@/components/laptop/boot";

// The text version — "the box it came in" — is set in two families: Archivo, whose
// width axis gives both the extra-wide packaging headlines and the condensed
// label caps from one file, and JetBrains Mono for spec values and small print.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

// Used only by the 3D layer — its HUD and the text painted onto the laptop screen
// (FONTS in components/laptop/config.ts). Not preloaded: phones and every other
// text-layout visitor never use them, and the 3D boot screen waits for
// document.fonts.ready before revealing the scene, so they still arrive in time.
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  preload: false,
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jakarta",
  preload: false,
});

export const metadata: Metadata = {
  title: "💻 hey, it's charles",
  description: "My personal site, designed to keep track of my progress and skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the boot script below sets data-laptop on <html>
    // before React hydrates, so the attribute is expected to differ from the server
    // render. It applies to this element's own attributes only, not its children.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Must run before <body> is parsed — see components/laptop/boot.ts. */}
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body
        className={`
          ${archivo.variable}
          ${jetbrainsMono.variable}
          ${syne.variable}
          ${plusJakartaSans.variable}
          antialiased
        `}
      >
        {children}
      </body>
    </html>
  );
}