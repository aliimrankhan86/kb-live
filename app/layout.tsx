import type { Metadata, Viewport } from "next";
import "./globals.css";
import { baseMetadata } from "@/lib/seo";
import { exo2Font } from "@/lib/fonts";
import { RouteScrollManager } from "@/components/layout/RouteScrollManager";

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0B0B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={exo2Font.variable}>
      <body className="antialiased">
        <RouteScrollManager />
        {children}
      </body>
    </html>
  );
}
