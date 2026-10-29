import type { Metadata, Viewport } from "next";
import { Manrope, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from "next/font/google";
import { LangProvider } from "@/lib/lang";
import "./globals.css";

const ui = Manrope({ subsets: ["latin"], variable: "--font-ui", display: "swap" });
const marathi = Noto_Sans_Devanagari({ subsets: ["devanagari", "latin"], weight: ["400", "500", "700"], variable: "--font-marathi", display: "swap" });
const marathiHead = Noto_Serif_Devanagari({ subsets: ["devanagari", "latin"], weight: ["500", "700"], variable: "--font-marathi-head", display: "swap" });

export const metadata: Metadata = {
  title: { default: "खान्देश मराठा मंडळ — वधू-वर मेळावा", template: "%s · खान्देश मराठा मंडळ" },
  description: "खान्देश मराठा मंडळ, पिंपरी चिंचवड व पुणे जिल्हा परिसर — वधू-वर मेळावा. Register, print and display bride & groom bio-data.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#3A0A13", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mr" className={`${ui.variable} ${marathi.variable} ${marathiHead.variable}`}>
      <body>
        <LangProvider>
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
