import type { Metadata } from "next";
import { Bebas_Neue, Be_Vietnam_Pro, Calistoga} from "next/font/google";
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

export const metadata: Metadata = {
  title: "Charles Alcantara",
  description: "Welcome to my portfolio!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
          className={`${bebasNeue.variable} ${beVietnamPro.variable} ${calistoga.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
