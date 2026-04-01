import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant"
});

export const metadata: Metadata = {
  title: "BoxOfficeCollect",
  description:
    "Track daily and cumulative theatrical box office performance across major Hollywood and Indian releases."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${cormorant.variable} font-sans text-ink antialiased`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
