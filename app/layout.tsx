import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PrepFlow — Vehicle Prep Control (Demo)",
  description:
    "Demo of a vehicle preparation tracking system for car dealerships: PDI, wheel refurbishment, bodyshop, valet and photos — in one pipeline.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0a0e14",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
