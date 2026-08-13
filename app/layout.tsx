import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "PrepFlow — Vehicle Prep Control (Demo)",
  description:
    "Demo of a vehicle preparation tracking system for car dealerships: PDI, wheel refurbishment, bodyshop, valet and photos — in one pipeline.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#1c4e80",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
