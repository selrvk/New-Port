import type { Metadata } from "next";
import { Bebas_Neue, Be_Vietnam_Pro, Calistoga, Syne, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-be-vietnam-pro",
});

const calistoga = Calistoga({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-calistoga",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jakarta",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
    <html lang="en">
      <body
        className={`
          ${bebasNeue.variable}
          ${beVietnamPro.variable}
          ${calistoga.variable}
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