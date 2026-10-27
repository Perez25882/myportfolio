import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono, Newsreader, Public_Sans } from "next/font/google";
import { ContactSheet } from "@/components/ContactSheet";
import { TopBar } from "@/components/TopBar";
import { profile } from "@/content/profile";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-public-sans", display: "swap" });
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "PEREZ · Museum of What's Possible",
    template: "%s · PEREZ",
  },
  description: profile.intro,
};

export const viewport: Viewport = {
  themeColor: "#141312",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fontVariables = [archivo, publicSans, newsreader, jetbrainsMono].map((font) => font.variable).join(" ");

  return (
    <html lang="en" className={fontVariables}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <TopBar />
        <main id="main">{children}</main>
        <ContactSheet />
      </body>
    </html>
  );
}
