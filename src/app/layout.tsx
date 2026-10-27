import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Poppins } from "next/font/google";
import { ContactSheet } from "@/components/ContactSheet";
import { TopBar } from "@/components/TopBar";
import { profile } from "@/content/profile";
import "./globals.css";

// Two families carry the whole site (2D and 3D): Poppins for headings and the wordmark, Inter for
// reading. JetBrains Mono appears only for real technical names. next/font self-hosts all three.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-jetbrains-mono", display: "swap" });

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
  const fontVariables = [poppins, inter, jetbrainsMono].map((font) => font.variable).join(" ");

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
