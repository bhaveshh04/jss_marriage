import type { Metadata, Viewport } from "next";
import { Manrope, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";

const ui = Manrope({ subsets: ["latin"], variable: "--font-ui", display: "swap" });
const marathi = Noto_Sans_Devanagari({ subsets: ["devanagari", "latin"], weight: ["400", "500", "700"], variable: "--font-marathi", display: "swap" });
const marathiHead = Noto_Serif_Devanagari({ subsets: ["devanagari", "latin"], weight: ["500", "700"], variable: "--font-marathi-head", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Maratha Vadhu Var Melava", template: "%s · Vadhu Var Melava" },
  description: "Register, print and display bride & groom bio-data at melava events.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#3A0A13", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ui.variable} ${marathi.variable} ${marathiHead.variable}`}>
      <body>{children}</body>
    </html>
  );
}
