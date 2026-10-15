import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./keys.css";
import { bootScript } from "@/components/laptop/boot";

// One type system for both versions of the site: Syne for display, Plus Jakarta
// Sans for reading, JetBrains Mono for keycaps, code and labels. The 3D layer paints
// its screen text in the same three (FONTS in components/laptop/config.ts).
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jakarta",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
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
          ${syne.variable}
          ${plusJakartaSans.variable}
          ${jetbrainsMono.variable}
          antialiased
        `}
      >
        {children}
      </body>
    </html>
  );
}